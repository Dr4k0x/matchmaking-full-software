import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type Employee, type NivelCarta, type Technology } from '../../types';
import './Employees.css';

interface EmployeeFormProps {
    initialData?: Employee | null;
    onSave: (emp: Omit<Employee, 'idCarta'>) => void;
    onCancel: () => void;
    onDelete: () => void;
    availableTechnologies: Technology[];
}

interface SelectionState {
    restoredFromSelection?: boolean;
    selectionPayload?: {
        selected: Array<{ tecnologiaId: number, nivel: number }>;
        [key: string]: any;
    };
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSave, onCancel, onDelete, availableTechnologies }) => {
    const [nombreApellido, setNombreApellido] = useState('');
    const [cedulaIdentidad, setCedulaIdentidad] = useState('');
    const [tipoCarta, setTipoCarta] = useState('');

    const [stats, setStats] = useState({
        poderSocial: 1,
        sabiduria: 1,
        velocidad: 1
    });

    const [niveles, setNiveles] = useState<NivelCarta[]>([]);
    const [techToDelete, setTechToDelete] = useState<number | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1. Prepare Storage Keys
        const mode = initialData ? 'edit' : 'create';
        const currentId = initialData?.idCarta;
        const storageKey = `techSelection:${currentId ?? 'new'}:${mode}`;

        // 2. Sources of Selection (State > Storage Fallback)
        let selectionPayload: SelectionState['selectionPayload'] = undefined;
        
        // Priority 1: Navigation State
        const locState = location.state as SelectionState;
        if (locState?.selectionPayload) {
            selectionPayload = locState.selectionPayload;
        } 
        
        // Priority 2: Session Storage Fallback
        if (!selectionPayload) {
            const selectionFallbackRaw = sessionStorage.getItem(storageKey);
            if (selectionFallbackRaw) {
                try {
                    const parsed = JSON.parse(selectionFallbackRaw);
                    // 20 min TTL check
                    if (Date.now() < (parsed.expiresAt || 0)) {
                        selectionPayload = parsed;
                    }
                } catch (e) {}
            }
        }

        // 3. Rehydrating from Draft Context
        const draftContextRaw = sessionStorage.getItem('EMPLOYEE_DRAFT_CONTEXT');
        if (draftContextRaw) {
            try {
                const context = JSON.parse(draftContextRaw);
                const isCorrectEdit = initialData && context.mode === 'edit' && context.employeeId === initialData.idCarta;
                const isCorrectCreate = !initialData && context.mode === 'create';

                if (isCorrectEdit || isCorrectCreate) {
                    if (context.formData) {
                        setNombreApellido(context.formData.nombreApellido || '');
                        setCedulaIdentidad(context.formData.cedulaIdentidad || '');
                        setTipoCarta(context.formData.tipoCarta || '');
                        setStats(context.formData.stats || { poderSocial: 1, sabiduria: 1, velocidad: 1 });
                        
                        let currentNiveles = [...(context.formData.niveles || [])];

                        // 4. Robust Merge of Technology Selection
                        if (selectionPayload?.selected) {
                            const incoming = selectionPayload.selected;
                            currentNiveles = incoming.map((sel) => {
                                const existing = currentNiveles.find((p: NivelCarta) => p.idTecnologia === sel.tecnologiaId);
                                return { 
                                    idTecnologia: sel.tecnologiaId, 
                                    nivelDominado: existing ? existing.nivelDominado : (sel.nivel || 1) 
                                };
                            });
                        }
                        
                        setNiveles(currentNiveles);
                        return;
                    }
                }
            } catch (e) {
                console.error("Error rehydrating draft", e);
            }
        }

        // 5. Standard Initialization (no draft or mismatch)
        if (initialData) {
            setNombreApellido(initialData.nombreApellido);
            setCedulaIdentidad(initialData.cedulaIdentidad);
            setTipoCarta(initialData.tipoCarta);
            setStats({
                poderSocial: initialData.poderSocial,
                sabiduria: initialData.sabiduria,
                velocidad: initialData.velocidad
            });
            setNiveles(initialData.nivelesCarta ? initialData.nivelesCarta.map(n => ({ ...n })) : []);
        } else {
            setNombreApellido('');
            setCedulaIdentidad('');
            setTipoCarta('');
            setStats({ poderSocial: 1, sabiduria: 1, velocidad: 1 });
            setNiveles([]);
        }
    }, [initialData, location.state]);

    const handleStatChange = (stat: keyof typeof stats, delta: number) => {
        setStats(prev => ({
            ...prev,
            [stat]: Math.min(10, Math.max(1, prev[stat] + delta))
        }));
    };

    const handleAddTechNavigation = () => {
        const context = {
            mode: initialData ? 'edit' : 'create',
            employeeId: initialData?.idCarta,
            timestamp: Date.now(),
            returnPath: window.location.pathname + window.location.search,
            formData: {
                nombreApellido,
                cedulaIdentidad,
                tipoCarta,
                stats,
                niveles
            }
        };
        sessionStorage.setItem('EMPLOYEE_DRAFT_CONTEXT', JSON.stringify(context));
        navigate('/technologies?mode=select');
    };

    const handleRemoveTechRequest = (id: number) => {
        setTechToDelete(id);
    };

    const confirmRemoveTech = () => {
        if (techToDelete) {
            setNiveles(prev => prev.filter(n => n.idTecnologia !== techToDelete));
            setTechToDelete(null);
        }
    };

    const cancelRemoveTech = () => {
        setTechToDelete(null);
    };

    const handleLevelChange = (idTecnologia: number, delta: number) => {
        setNiveles(prev => prev.map(n => {
            if (n.idTecnologia === idTecnologia) {
                return { ...n, nivelDominado: Math.min(10, Math.max(1, n.nivelDominado + delta)) };
            }
            return n;
        }));
    };

    const getTechName = (id: number) => {
        return availableTechnologies.find(t => t.idTecnologia === id)?.nombre || 'Unknown';
    };

    const handleSubmit = () => {
        if (!nombreApellido.trim()) return alert('El nombre es obligatorio.');
        if (!cedulaIdentidad.trim()) return alert('La cédula es obligatoria.');
        if (!tipoCarta) return alert('El tipo de carta es obligatorio.');

        const payload: Omit<Employee, 'idCarta'> = {
            nombreApellido,
            cedulaIdentidad,
            tipoCarta,
            poderSocial: stats.poderSocial,
            sabiduria: stats.sabiduria,
            velocidad: stats.velocidad,
            nivelesCarta: niveles.map(n => ({
                idTecnologia: n.idTecnologia,
                nivelDominado: n.nivelDominado
            }))
        };
        
        onSave(payload);
    };
    
    const handleCancelForm = () => {
         onCancel();
    };

    return (
        <div className="emp-form-container">
            {techToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header red">
                            CONFIRMAR
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#2c3e50', textAlign: 'center', fontSize: '1.1rem' }}>
                                ¿Seguro que deseas quitar esta tecnología de la carta?
                            </p>
                        </div>
                        <div className="modal-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
                            <button className="modal-btn btn-gray" onClick={cancelRemoveTech}>
                                CANCELAR
                            </button>
                            <button className="modal-btn btn-red" onClick={confirmRemoveTech}>
                                SÍ, QUITAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="emp-form-content">
                <div className="emp-form-layout">
                    <div className="emp-col-left">
                        <div className="emp-inputs-area">
                            <div className="emp-section-title">Datos Básicos</div>
                            
                            <div className="emp-input-wrapper">
                                <label className="emp-label">Nombre y Apellido</label>
                                <input
                                    type="text"
                                    className="emp-input-clean"
                                    value={nombreApellido}
                                    onChange={(e) => setNombreApellido(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    autoFocus
                                />
                            </div>

                            <div className="emp-input-wrapper">
                                <label className="emp-label">Cédula de Identidad</label>
                                <input
                                    type="text"
                                    className="emp-input-clean"
                                    value={cedulaIdentidad}
                                    onChange={(e) => setCedulaIdentidad(e.target.value)}
                                    placeholder="Ej. 12345678"
                                />
                            </div>

                            <div className="emp-input-wrapper">
                                <label className="emp-label">Tipo de Carta</label>
                                <select
                                    className="emp-input-clean"
                                    value={tipoCarta}
                                    onChange={(e) => setTipoCarta(e.target.value)}
                                >
                                    <option value="">Selecciona Tipo</option>
                                    <option value="FrontEnd">FrontEnd</option>
                                    <option value="BackEnd">BackEnd</option>
                                    <option value="FullStack">FullStack</option>
                                </select>
                            </div>
                        </div>

                        <div className="emp-stats-area">
                            <div className="emp-section-title">Estadísticas</div>
                            
                            <div className="stepper-container">
                                <span className="stepper-label">PODER SOCIAL</span>
                                <div className="stepper-controls">
                                    <button className="stepper-btn" onClick={() => handleStatChange('poderSocial', -1)} disabled={stats.poderSocial <= 1}>-</button>
                                    <span className="stepper-value">{stats.poderSocial}</span>
                                    <button className="stepper-btn" onClick={() => handleStatChange('poderSocial', 1)} disabled={stats.poderSocial >= 10}>+</button>
                                </div>
                            </div>

                            <div className="stepper-container">
                                <span className="stepper-label">SABIDURIA</span>
                                <div className="stepper-controls">
                                    <button className="stepper-btn" onClick={() => handleStatChange('sabiduria', -1)} disabled={stats.sabiduria <= 1}>-</button>
                                    <span className="stepper-value">{stats.sabiduria}</span>
                                    <button className="stepper-btn" onClick={() => handleStatChange('sabiduria', 1)} disabled={stats.sabiduria >= 10}>+</button>
                                </div>
                            </div>

                            <div className="stepper-container">
                                <span className="stepper-label">VELOCIDAD</span>
                                <div className="stepper-controls">
                                    <button className="stepper-btn" onClick={() => handleStatChange('velocidad', -1)} disabled={stats.velocidad <= 1}>-</button>
                                    <span className="stepper-value">{stats.velocidad}</span>
                                    <button className="stepper-btn" onClick={() => handleStatChange('velocidad', 1)} disabled={stats.velocidad >= 10}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="emp-col-right">
                        <div className="emp-preview-area">
                            <div className="emp-preview-card">
                                <div className="emp-card-header">{tipoCarta || 'TIPO'}</div>
                                <div className="emp-card-image">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="emp-card-footer">
                                    {nombreApellido || 'NOMBRE'}
                                </div>
                            </div>
                        </div>

                        <div className="emp-skills-area">
                            <div className="skills-header">
                                <div className="emp-section-title" style={{ margin: 0 }}>Habilidades</div>
                                <button className="add-skill-btn" onClick={handleAddTechNavigation} title="Agregar Tecnologías">+</button>
                            </div>
                            
                            <div className="skills-list">
                                {niveles.map((nivel) => (
                                    <div key={nivel.idTecnologia} className="skill-icon-small" title={getTechName(nivel.idTecnologia)}>
                                        {getTechName(nivel.idTecnologia).substring(0, 2).toUpperCase()}
                                        <div className="level-badge">
                                            {nivel.nivelDominado}
                                        </div>
                                    </div>
                                ))}
                                {niveles.length === 0 && (
                                    <div style={{ color: '#BDC3C7', fontSize: '0.8rem', fontStyle: 'italic', padding: '10px 0' }}>
                                        Sin tecnologías seleccionadas
                                    </div>
                                )}
                            </div>
                            
                            <div className="tech-list-scroll">
                                {niveles.map(n => (
                                    <div key={n.idTecnologia} className="tech-item-row">
                                        <div className="tech-item-name">{getTechName(n.idTecnologia)}</div>
                                        
                                        <div className="stepper-controls" style={{ padding: '2px', transform: 'scale(0.9)' }}>
                                            <button className="stepper-btn" style={{ width: '24px', height: '24px' }} onClick={() => handleLevelChange(n.idTecnologia, -1)} disabled={n.nivelDominado <= 1}>-</button>
                                            <span className="stepper-value" style={{ margin: '0 5px', minWidth: '15px', fontSize: '0.9rem' }}>{n.nivelDominado}</span>
                                            <button className="stepper-btn" style={{ width: '24px', height: '24px' }} onClick={() => handleLevelChange(n.idTecnologia, 1)} disabled={n.nivelDominado >= 10}>+</button>
                                        </div>

                                        <button 
                                            className="skill-delete-btn" 
                                            onClick={() => handleRemoveTechRequest(n.idTecnologia)}
                                            title="Eliminar de la carta"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="emp-actions">
                    {initialData && (
                        <button className="emp-btn emp-btn-delete" onClick={onDelete}>
                            ELIMINAR
                        </button>
                    )}
                    <button className="emp-btn emp-btn-cancel" onClick={handleCancelForm}>
                        CANCELAR
                    </button>
                    <button className="emp-btn emp-btn-save" onClick={handleSubmit}>
                        GUARDAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;

