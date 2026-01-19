import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmployeeGrid from './EmployeeGrid';
import { type Employee, type Technology } from '../../types';
import EmployeeForm from './EmployeeForm';
import './Employees.css';
import cartaService from '../../services/carta.service';
import techService from '../../services/tech.service';

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [formInstanceKey, setFormInstanceKey] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Deriving state from the source of truth
    const selectedEmp = useMemo(() => {
        return employees.find(e => e.idCarta === selectedId) || null;
    }, [employees, selectedId]);

    useEffect(() => {
        loadData();
    }, []);

    const [draftNonce, setDraftNonce] = useState(() => (location.state as any)?.draftNonce || '');

    // Selection Restoration from Picker
    useEffect(() => {
        const restore = async () => {
            if (employees.length === 0) return;

            const state = location.state as { restoredFromSelection?: boolean, draftNonce?: string } | null;
            
            if (state?.restoredFromSelection) {
                const nonceToUse = state.draftNonce || draftNonce;
                const idToken = selectedId ? selectedId.toString() : (nonceToUse ? `new:${nonceToUse}` : '');
                
                if (idToken) {
                    const draftKey = `EMPLOYEE_DRAFT_CONTEXT:${idToken}`;
                    const draftRaw = sessionStorage.getItem(draftKey);

                    if (draftRaw) {
                        try {
                            const envelope = JSON.parse(draftRaw);
                            const now = Date.now();
                            if (envelope.ts && envelope.ttlMs && (envelope.ts + envelope.ttlMs > now)) {
                                const context = envelope.data;
                                if (context.mode === 'create') {
                                    setIsCreating(true);
                                    setSelectedId(null);
                                } else if (context.mode === 'edit' && context.employeeId) {
                                    setSelectedId(context.employeeId);
                                    setIsCreating(false);
                                }
                                if (state.draftNonce) setDraftNonce(state.draftNonce);
                                setFormInstanceKey(k => k + 1);
                            }
                        } catch (e) {
                            console.error('Error restoring selection context', e);
                        }
                    }
                }

                // Clean navigation state but preserve nonce if needed
                navigate(location.pathname, { replace: true, state: { draftNonce: state.draftNonce || draftNonce } });
            }
        };

        restore();
    }, [employees, location.state, navigate, location.pathname, selectedId]);

    // ESC Key Listener for Modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        if (selectedId !== null || isCreating) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, isCreating]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [empData, techData] = await Promise.all([
                cartaService.getAll(),
                techService.getAll()
            ]);
            setEmployees(empData);
            setAvailableTechnologies(techData);
        } catch (err: any) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const clearFormDrafts = () => {
        const idToken = isCreating ? `new:${draftNonce}` : selectedId?.toString();
        if (idToken) {
            sessionStorage.removeItem(`EMPLOYEE_DRAFT_CONTEXT:${idToken}`);
            sessionStorage.removeItem(`TECH_SELECTION:employees:${idToken}`);
        }
    };

    const handleSelect = (emp: Employee) => {
        setSelectedId(emp.idCarta);
        setIsCreating(false);
        setDraftNonce(''); // No nonce needed for edit by default
        setFormInstanceKey(k => k + 1);
    };

    const handleAdd = () => {
        setSelectedId(null);
        setIsCreating(true);
        setDraftNonce(Date.now().toString());
        setFormInstanceKey(k => k + 1);
    };

    const handleBack = () => navigate('/dashboard');

    const handleCancel = () => {
        clearFormDrafts();
        setSelectedId(null);
        setIsCreating(false);
        setFormInstanceKey(k => k + 1);
    };

    const handleSave = async (data: Omit<Employee, 'idCarta'>) => {
        try {
            if (selectedId) {
                const updated = await cartaService.update(selectedId, data);
                setEmployees(prev => prev.map(e => e.idCarta === selectedId ? updated : e));
            } else {
                await cartaService.create(data);
                await loadData(); 
            }
            clearFormDrafts();
            handleCancel();
        } catch (err: any) {
            alert('Error al guardar empleado');
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            await cartaService.delete(selectedId);
            setEmployees(prev => prev.filter(e => e.idCarta !== selectedId));
            handleCancel();
        } catch (err: any) {
            alert('Error al eliminar empleado');
        }
    };

    const showModal = selectedId !== null || isCreating;

    if (loading && employees.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className="employees-page">
            {error && <div className="error-message">{error}</div>}
            
            <EmployeeGrid
                employees={employees}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedId}
                onBack={handleBack}
            />

            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="emp-form-modal" onClick={e => e.stopPropagation()}>
                        <button className="emp-form-close" onClick={handleCancel} title="Cerrar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <EmployeeForm
                            key={`${selectedId ?? 'new'}-${formInstanceKey}`}
                            initialData={selectedEmp}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                            availableTechnologies={availableTechnologies}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeesPage;
