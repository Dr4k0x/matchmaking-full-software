import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

    // Confirm Modal for Deletion
    const [techToDelete, setTechToDelete] = useState<Technology | null>(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadTechnologies();
        
        const isSelectModeSignal = searchParams.get('mode') === 'select';
        const draftContext = sessionStorage.getItem('EMPLOYEE_DRAFT_CONTEXT');

        if (isSelectModeSignal) {
            setSelectionMode(true);
            if (draftContext) {
                try {
                    const context = JSON.parse(draftContext);
                    if (context.selectedIds) {
                        setSelectedIds(context.selectedIds);
                    }
                } catch (e) {
                    console.error("Invalid Draft Context", e);
                }
            }
        } else {
            setSelectionMode(false);
            if (draftContext) {
                sessionStorage.removeItem('EMPLOYEE_DRAFT_CONTEXT');
            }
        }
    }, [searchParams]);

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
        const draftContextRaw = sessionStorage.getItem('EMPLOYEE_DRAFT_CONTEXT');
        let returnPath = '/employees';
        let employeeId = null;
        let mode: 'edit' | 'create' = 'create';

        if (draftContextRaw) {
            try {
                const context = JSON.parse(draftContextRaw);
                if (context.returnPath) returnPath = context.returnPath;
                employeeId = context.employeeId;
                mode = context.mode || 'create';
            } catch (e) {}
        }

        const selectionPayload = {
            employeeId,
            mode,
            selected: selectedIds.map(id => ({ tecnologiaId: id, nivel: 1 })),
            ts: Date.now(),
            expiresAt: Date.now() + 20 * 60 * 1000 // 20 min TTL
        };

        const storageKey = `techSelection:${employeeId ?? 'new'}:${mode}`;
        
        sessionStorage.setItem(storageKey, JSON.stringify(selectionPayload));
        
        navigate(returnPath, { 
            state: { 
                restoredFromSelection: true, 
                selectionPayload 
            } 
        });
    };

    const handleCancelSelection = () => {
        const draftContextRaw = sessionStorage.getItem('EMPLOYEE_DRAFT_CONTEXT');
        let returnPath = '/employees';

        if (draftContextRaw) {
            try {
                const context = JSON.parse(draftContextRaw);
                if (context.returnPath) returnPath = context.returnPath;
            } catch (e) {}
        }
        
        navigate(returnPath, { state: { restoredFromSelection: true, selectionPayload: null } });
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
                alert('Error al eliminar tecnología');
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
            alert('Error al guardar tecnología');
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

            <TechGrid
                technologies={technologies}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedTech?.idTecnologia || null}
                onBack={handleBack}
                isSelectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onEdit={handleEdit}
                onDelete={handleRequestDelete}
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
