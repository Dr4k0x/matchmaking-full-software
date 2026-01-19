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
            // NORMAL MODE entry: Always force normal and clear stale contexts
            setSelectionMode(false);
            if (draftContext) {
                sessionStorage.removeItem('EMPLOYEE_DRAFT_CONTEXT');
            }
        }
    }, [searchParams]);

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
        setIsCreating(true); // Re-using isCreating to show form side-panel
    };

    const handleRequestDelete = (tech: Technology) => {
        setTechToDelete(tech);
    };

    const confirmDelete = async () => {
        if (techToDelete) {
            try {
                await techService.delete(techToDelete.idTecnologia);
                
                // If deleted tech was selected, remove it from selection
                if (selectedIds.includes(techToDelete.idTecnologia)) {
                    setSelectedIds((prev: number[]) => prev.filter((id: number) => id !== techToDelete.idTecnologia));
                }
                
                setTechToDelete(null);
                // If we were editing this tech, close form
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
                // Edit
                await techService.update(selectedTech.idTecnologia, data);
            } else {
                // Create
                await techService.create(data);
                // Optionally auto-select logic can be added here if needed in future
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

    const isSplitView = selectedTech !== null || isCreating;

    if (loading && technologies.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className={`technologies-page ${isSplitView ? 'split-view' : ''}`}>
            {error && <div className="error-message">{error}</div>}
            
            {/* Confirmation Modal */}
            {techToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <h2 style={{ color: '#e74c3c', margin: '0 0 1rem 0' }}>ELIMINAR</h2>
                        <p style={{ color: '#2c3e50', marginBottom: '2rem' }}>¿Estás seguro de que deseas eliminar <strong>{techToDelete.nombre}</strong>?</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={cancelDelete} style={{ background: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>CANCELAR</button>
                            <button onClick={confirmDelete} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>ELIMINAR</button>
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

            <TechForm
                initialData={selectedTech}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={() => selectedTech && handleRequestDelete(selectedTech)}
            />
        </div>
    );
};

export default TechnologiesPage;
