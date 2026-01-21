import React, { useState, useEffect, useRef } from 'react';

import { type Project, type Technology, type NivelProyecto } from '../../types/index';
import './Projects.css';

interface ProjectFormProps {
    initialData?: Project | null;
    onSave: (proj: Omit<Project, 'idProyecto'>) => void;
    onCancel: () => void;
    onDelete: () => void;
    onManageTech: (currentData: Omit<Project, 'idProyecto'> & { idProyecto?: number }) => void;
    availableTechnologies: Technology[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel, onDelete, onManageTech, availableTechnologies }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [fechaFinalizacion, setFechaFinalizacion] = useState('');
    const [estado, setEstado] = useState<'P' | 'F' | 'E'>('P');

    const [nivelColaborativo, setNivelColaborativo] = useState(1);
    const [nivelOrganizativo, setNivelOrganizativo] = useState(1);
    const [nivelVelocidadDesarrollo, setNivelVelocidadDesarrollo] = useState(1);

    const [nivelesProyecto, setNivelesProyecto] = useState<NivelProyecto[]>([]);
    const [error, setError] = useState<string | null>(null);


    const fechaCreacionRef = useRef<HTMLInputElement>(null);
    const fechaFinalizacionRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setDescripcion(initialData.descripcion);
            // Handle ISO dates for input[type="date"]
            // Split by 'T' to get YYYY-MM-DD from ISO string without timezone shift
            if (initialData.fechaCreacion) {
                const dateStr = initialData.fechaCreacion;
                setFechaCreacion(dateStr.split('T')[0]);
            }
            if (initialData.fechaFinalizacion) {
                const dateStr = initialData.fechaFinalizacion;
                setFechaFinalizacion(dateStr.split('T')[0]);
            }


            const validEstado = (['P', 'F', 'E'].includes(initialData.estado) ? initialData.estado : 'P') as 'P' | 'F' | 'E';
            setEstado(validEstado);
            setNivelColaborativo(initialData.nivelColaborativo);
            setNivelOrganizativo(initialData.nivelOrganizativo);
            setNivelVelocidadDesarrollo(initialData.nivelVelocidadDesarrollo);
            setNivelesProyecto(initialData.nivelesProyecto || []);
        } else {
            setNombre('');
            setDescripcion('');
            setFechaCreacion('');
            setFechaFinalizacion('');
            setEstado('P');
            setNivelColaborativo(1);
            setNivelOrganizativo(1);
            setNivelVelocidadDesarrollo(1);
            setNivelesProyecto([]);
        }
    }, [initialData]);

    const handleStatChange = (statSetter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
        statSetter(prev => Math.min(10, Math.max(1, prev + delta)));
    };

    const handleLevelChange = (idTecnologia: number, delta: number) => {
        setNivelesProyecto(prev => prev.map(np => {
            if (np.idTecnologia === idTecnologia) {
                return { ...np, nivelRequerido: Math.min(10, Math.max(1, np.nivelRequerido + delta)) };
            }
            return np;
        }));
    };

    const handleRemoveTech = (idTecnologia: number) => {
        setNivelesProyecto(prev => prev.filter(np => np.idTecnologia !== idTecnologia));
    };

    const handleSubmit = async () => {
        const payload = {
            nombre,
            descripcion,
            fechaCreacion,
            fechaFinalizacion,
            estado,
            nivelColaborativo,
            nivelOrganizativo,
            nivelVelocidadDesarrollo,
            nivelesProyecto: nivelesProyecto.map(np => ({
                idTecnologia: np.idTecnologia,
                nivelRequerido: np.nivelRequerido
            }))
        };

        if (import.meta.env.DEV) {
            console.log('ProjectForm Payload:', initialData ? 'UPDATE' : 'CREATE', payload);
        }

        try {
            await onSave(payload);
        } catch (err: any) {
            console.error('Error saving project:', err);
            const backendMessage = err.response?.data?.message;
            const message = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
            setError(message || 'Ocurrió un error al guardar el proyecto. Por favor, verifica los datos.');
        }
    };


    const handleClose = () => {
        onCancel();
    };

    const getTechName = (id: number) => {
        return availableTechnologies.find(t => t.idTecnologia === id)?.nombre || `Tech ${id}`;
    };

    const openCalendar = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (!ref.current) return;

        
        // Strategy: showPicker if available, fallback to focus + click
        if (typeof ref.current.showPicker === 'function') {
            try {
                ref.current.showPicker();
            } catch (error) {
                console.warn('showPicker failed, falling back', error);
                ref.current.focus();
                ref.current.click();
            }
        } else {
            ref.current.focus();
            ref.current.click();
        }
    };


    return (
        <div className="tech-form-container" onClick={e => e.stopPropagation()}>
            {/* Actions Header */}
            <div className="proj-actions">
                {initialData && (
                    <button className="proj-btn proj-btn-delete" onClick={onDelete} title="Eliminar Proyecto" type="button">
                        ELIMINAR
                    </button>
                )}
                <button className="proj-btn proj-btn-cancel" onClick={handleClose} type="button">CANCELAR</button>
                <button className="proj-btn proj-btn-save" onClick={handleSubmit} type="button">
                    {initialData ? 'ACTUALIZAR PROYECTO' : 'GUARDAR PROYECTO'}
                </button>
            </div>

            <div className="proj-form-content">
                {/* Col 1: General Info */}
                <div className="proj-col">
                    <div className="proj-col-title">Información General</div>

                    <div className="proj-input-group">
                        <div className="proj-input-label">Nombre del Proyecto</div>
                        <input type="text" className="proj-input" placeholder="Ej: Rediseño E-commerce" value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>

                    <div className="proj-general-layout">
                        <div className="proj-blueprint-img">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '60%', height: '60%' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        </div>
                        <div className="proj-inputs-stack">
                            <div className="proj-input-group">
                                <div className="proj-input-label">Fecha Inicio</div>
                                <div className="proj-date-input-wrapper">
                                    <input 
                                        ref={fechaCreacionRef}
                                        type="date" 
                                        className="proj-input" 
                                        value={fechaCreacion} 
                                        onChange={e => setFechaCreacion(e.target.value)} 
                                    />
                                    <button 
                                        type="button" 
                                        className="proj-calendar-btn"
                                        onClick={() => openCalendar(fechaCreacionRef)}
                                        aria-label="Abrir calendario de fecha inicio"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="proj-input-group">
                                <div className="proj-input-label">Fecha Fin</div>
                                <div className="proj-date-input-wrapper">
                                    <input 
                                        ref={fechaFinalizacionRef}
                                        type="date" 
                                        className="proj-input" 
                                        value={fechaFinalizacion} 
                                        onChange={e => setFechaFinalizacion(e.target.value)} 
                                    />
                                    <button 
                                        type="button" 
                                        className="proj-calendar-btn"
                                        onClick={() => openCalendar(fechaFinalizacionRef)}
                                        aria-label="Abrir calendario de fecha fin"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="proj-input-group">
                        <div className="proj-input-label">Estado</div>
                        <select className="proj-input" value={estado} onChange={e => setEstado(e.target.value as any)}>
                            <option value="P">🟠 En Proceso</option>
                            <option value="F">🟢 Finalizado</option>
                            <option value="E">⚪ En Espera</option>
                        </select>
                    </div>

                    <textarea
                        className="proj-textarea"
                        placeholder="Describe el objetivo y alcance del proyecto..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                    />
                </div>

                {/* Col 2: Exigencias (Stats) */}
                <div className="proj-col">
                    <div className="proj-col-title">Exigencias del Proyecto</div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">COLABORACIÓN</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, -1)} type="button" disabled={nivelColaborativo <= 1}>-</button>
                            <span style={{fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center'}}>Lv {nivelColaborativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, 1)} type="button" disabled={nivelColaborativo >= 10}>+</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">ORGANIZACIÓN</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, -1)} type="button" disabled={nivelOrganizativo <= 1}>-</button>
                            <span style={{fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center'}}>Lv {nivelOrganizativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, 1)} type="button" disabled={nivelOrganizativo >= 10}>+</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">VELOCIDAD DEV</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, -1)} type="button" disabled={nivelVelocidadDesarrollo <= 1}>-</button>
                            <span style={{fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center'}}>Lv {nivelVelocidadDesarrollo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, 1)} type="button" disabled={nivelVelocidadDesarrollo >= 10}>+</button>
                        </div>
                    </div>
                </div>

                {/* Col 3: Stack Tecnológico (Estilo Employees) */}
                <div className="proj-col">
                    <div className="proj-skills-header-row">
                        <div className="proj-col-title" style={{margin: 0}}>Stack Tecnológico</div>
                        <button className="proj-add-skill-btn-mini" onClick={() => onManageTech({
                            nombre,
                            descripcion,
                            fechaCreacion,
                            fechaFinalizacion,
                            estado,
                            nivelColaborativo,
                            nivelOrganizativo,
                            nivelVelocidadDesarrollo,
                            nivelesProyecto,
                            idProyecto: initialData?.idProyecto
                        })} type="button" title="Gestionar Tecnologías">+</button>
                    </div>

                    <div className="proj-tech-list-scroll">
                        {nivelesProyecto.map(np => (
                            <div key={np.idTecnologia} className="proj-tech-item-row">
                                <div className="proj-tech-item-name">{getTechName(np.idTecnologia)}</div>
                                
                                <div className="proj-stepper-controls-mini">
                                    <button className="proj-stepper-btn-small" onClick={() => handleLevelChange(np.idTecnologia, -1)} type="button" disabled={np.nivelRequerido <= 1}>-</button>
                                    <span style={{fontWeight: 800, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center'}}>{np.nivelRequerido}</span>
                                    <button className="proj-stepper-btn-small" onClick={() => handleLevelChange(np.idTecnologia, 1)} type="button" disabled={np.nivelRequerido >= 10}>+</button>
                                </div>

                                <button className="proj-skill-delete-btn" onClick={() => handleRemoveTech(np.idTecnologia)} type="button" title="Quitar tecnología">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {nivelesProyecto.length === 0 && (
                            <div className="proj-empty-tech">
                                No se han seleccionado tecnologías
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            {error && (
                <div className="proj-error-overlay" onClick={() => setError(null)}>
                    <div className="proj-error-card" onClick={e => e.stopPropagation()}>
                        <div className="proj-error-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h3 className="proj-error-title">Fechas Inválidas</h3>
                        <p className="proj-error-text">{error}</p>
                        <button className="proj-error-btn" type="button" onClick={() => setError(null)}>ENTENDIDO</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProjectForm;
