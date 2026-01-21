import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import TechGrid from './TechGrid';
import { type Technology } from '../../types';
import TechForm from './TechForm';
import './Technologies.css';
import techService from '../../services/tech.service';

const TechnologiesPage: React.FC = () => {
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Selection Mode States
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modals
    const [techToDelete, setTechToDelete] = useState<Technology | null>(null);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        loadTechnologies();
        
        const isSelectModeSignal = searchParams.get('mode') === 'select';
        const stateMetadata = location.state as any;
        const draftKey = stateMetadata?.draftKey;

        if (isSelectModeSignal && draftKey) {
            setSelectionMode(true);
            const draftRaw = sessionStorage.getItem(draftKey);

            if (draftRaw) {
                try {
                    const envelope = JSON.parse(draftRaw);
                    const now = Date.now();
                    // TTL Check (envelope.ts + envelope.ttlMs > now)
                    if (envelope.ts && envelope.ttlMs && (envelope.ts + envelope.ttlMs > now)) {
                        const context = envelope.data;
                        if (context.selectedIds) {
                            setSelectedIds(context.selectedIds);
                        }
                    } else {
                        console.warn("Draft context expired, cleaning up...");
                        sessionStorage.removeItem(draftKey);
                    }
                } catch (e) {
                    console.error("Invalid Draft Context", e);
                }
            }
        } else {
            setSelectionMode(false);
        }
    }, [searchParams, location.state]);

    // ESC Key Listener for Modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        if (selectedTech || isCreating) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTech, isCreating]);

    const loadTechnologies = async () => {
        setLoading(true);
        try {
            const data = await techService.getAll();
            setTechnologies(data);
        } catch (err: any) {
            setError('Error al cargar tecnologías');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (tech: Technology) => {
        if (selectionMode) return; 
        handleEdit(tech);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev: number[]) => {
            if (prev.includes(id)) {
                return prev.filter((i: number) => i !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleConfirmSelection = () => {
        const stateMetadata = location.state as any;
        const returnPath = stateMetadata?.returnPath || '/employees';
        const selectionKey = stateMetadata?.selectionKey;
        const selectedTechs = technologies.filter(t => selectedIds.includes(t.idTecnologia));

        if (selectionKey) {
            const envelope = {
                data: { selectedTechs, restoredFromSelection: true },
                ts: Date.now(),
                ttlMs: 20 * 60 * 1000 // 20 min
            };
            sessionStorage.setItem(selectionKey, JSON.stringify(envelope));
        }

        navigate(returnPath, { 
            state: { 
                ...(location.state as object || {}),
                selectedTechs,
                restoredFromSelection: true 
            } 
        });
    };

    const handleCancelSelection = () => {
        const stateMetadata = location.state as any;
        const returnPath = stateMetadata?.returnPath || '/employees';
        navigate(returnPath, { 
            state: { 
                ...(location.state as object || {}),
                restoredFromSelection: true 
            } 
        });
    };

    const handleAdd = () => {
        setSelectedTech(null);
        setIsCreating(true);
    };
    
    const handleEdit = (tech: Technology) => {
        setSelectedTech(tech);
        setIsCreating(true); 
    };

    const handleRequestDelete = (tech: Technology) => {
        setTechToDelete(tech);
    };

    const confirmDelete = async () => {
        if (techToDelete) {
            try {
                await techService.delete(techToDelete.idTecnologia);
                
                if (selectedIds.includes(techToDelete.idTecnologia)) {
                    setSelectedIds((prev: number[]) => prev.filter((id: number) => id !== techToDelete.idTecnologia));
                }
                
                setTechToDelete(null);
                if (selectedTech?.idTecnologia === techToDelete.idTecnologia) {
                    handleCancel();
                }
                
                await loadTechnologies();
            } catch (err: any) {
                const message = err.response?.data?.message || 'No se puede eliminar: esta tecnología está asociada a al menos un empleado o proyecto.';
                setErrorModal({ title: 'BLOQUEADO', message });
                setTechToDelete(null); // Dismiss confirmation modal on error
            }
        }
    };

    const cancelDelete = () => {
        setTechToDelete(null);
    };

    const handleSave = async (data: Omit<Technology, 'idTecnologia'>) => {
        try {
            if (selectedTech) {
                await techService.update(selectedTech.idTecnologia, data);
            } else {
                await techService.create(data);
            }
            await loadTechnologies();
            handleCancel();
        } catch (err: any) {
            setErrorModal({ 
                title: 'ERROR', 
                message: err.response?.data?.message || 'Error al guardar tecnología' 
            });
        }
    };

    const handleCancel = () => {
        setSelectedTech(null);
        setIsCreating(false);
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const showModal = selectedTech !== null || isCreating;

    if (loading && technologies.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className="technologies-page">
            {error && <div className="error-message">{error}</div>}
            
            {/* Confirmation Modal for Deletion */}
            {techToDelete && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                    <div className="tech-form-container" style={{ textAlign: 'center' }}>
                        <div className="tech-form-content">
                            <h2 style={{ color: '#e74c3c', margin: '0 0 1rem 0', fontWeight: 800 }}>ELIMINAR</h2>
                            <p style={{ color: '#2c3e50', marginBottom: '2rem' }}>
                                ¿Estás seguro de que deseas eliminar <strong>{techToDelete.nombre}</strong>?
                            </p>
                        </div>
                        <div className="tech-form-actions">
                            <button className="tech-action-btn tech-delete-main-btn" onClick={confirmDelete}>ELIMINAR</button>
                            <button className="tech-action-btn btn-cancel" onClick={cancelDelete}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal (Elegant Replacement for alert) */}
            {errorModal && (
                <div className="modal-overlay" style={{ zIndex: 4000 }} onClick={() => setErrorModal(null)}>
                    <div className="tech-form-container" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div className="tech-form-content">
                            <div className="tech-preview-circle" style={{ background: '#e74c3c', marginBottom: '1rem' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <h2 style={{ color: '#e74c3c', margin: '0 0 1rem 0', fontWeight: 800 }}>{errorModal.title}</h2>
                            <p style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                                {errorModal.message}
                            </p>
                        </div>
                        <div className="tech-form-actions">
                            <button className="tech-action-btn btn-cancel" onClick={() => setErrorModal(null)}>
                                ENTENDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TechGrid
                technologies={technologies}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedTech?.idTecnologia || null}
                onBack={handleBack}
                isSelectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
            />

            {/* Selection Toolbar Overlay */}
            {selectionMode && (
                <div className="selection-toolbar">
                    <button className="emp-btn emp-btn-cancel" onClick={handleCancelSelection} style={{ margin: 0 }}>
                        CANCELAR
                    </button>
                    <button className="emp-btn emp-btn-save" onClick={handleConfirmSelection} style={{ margin: 0 }}>
                        CONFIRMAR ({selectedIds.length})
                    </button>
                </div>
            )}

            {/* Modal Form Overlay */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <TechForm
                        initialData={selectedTech}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onDelete={() => selectedTech && handleRequestDelete(selectedTech)}
                    />
                </div>
            )}
        </div>
    );
};

export default TechnologiesPage;
