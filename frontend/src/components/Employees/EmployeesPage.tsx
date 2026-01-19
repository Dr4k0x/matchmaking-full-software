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
    const [isClosing, setIsClosing] = useState(false);
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

    // Selection Restoration from Picker
    useEffect(() => {
        const restore = async () => {
            if (employees.length === 0) return;

            const state = location.state as { restoredFromSelection?: boolean } | null;
            
            if (state?.restoredFromSelection) {
                const draftContextRaw = sessionStorage.getItem('EMPLOYEE_DRAFT_CONTEXT');
                if (draftContextRaw) {
                    try {
                        const context = JSON.parse(draftContextRaw);
                        if (context.mode === 'create') {
                            setIsCreating(true);
                            setSelectedId(null);
                        } else if (context.mode === 'edit' && context.employeeId) {
                            setSelectedId(context.employeeId);
                            setIsCreating(false);
                        }
                        
                        setFormInstanceKey(k => k + 1);
                    } catch (e) {
                        console.error('Error restoring selection context', e);
                    }
                }

                // Clean navigation state
                navigate(location.pathname, { replace: true, state: {} });
            }
        };

        restore();
    }, [employees, location.state, navigate, location.pathname]);

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
        sessionStorage.removeItem('EMPLOYEE_DRAFT_CONTEXT');
        // Clear selection storage for both modes to be safe
        const currentId = selectedId ?? 'new';
        sessionStorage.removeItem(`techSelection:${currentId}:create`);
        sessionStorage.removeItem(`techSelection:${currentId}:edit`);
        // If we were editing, also clear the 'new' potential draft
        if (selectedId) sessionStorage.removeItem(`techSelection:new:create`);
    };

    const handleCloseFluid = (callback?: () => void) => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedId(null);
            setIsCreating(false);
            setIsClosing(false);
            setFormInstanceKey(k => k + 1);
            if (callback) callback();
        }, 300);
    };

    const handleSelect = (emp: Employee) => {
        const returnedFromPicker = (location.state as any)?.restoredFromSelection === true;
        
        if (!returnedFromPicker) {
            sessionStorage.removeItem('EMPLOYEE_DRAFT_CONTEXT');
        }
        
        setSelectedId(emp.idCarta);
        setIsCreating(false);
        setFormInstanceKey(k => k + 1);
    };

    const handleAdd = () => {
        const returnedFromPicker = (location.state as any)?.restoredFromSelection === true;

        if (!returnedFromPicker) {
            sessionStorage.removeItem('EMPLOYEE_DRAFT_CONTEXT');
        }

        setSelectedId(null);
        setIsCreating(true);
        setFormInstanceKey(k => k + 1);
    };

    const handleBack = () => navigate('/dashboard');

    const handleCancel = () => {
        clearFormDrafts();
        handleCloseFluid();
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
            handleCloseFluid();
        } catch (err: any) {
            alert('Error al guardar empleado');
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            await cartaService.delete(selectedId);
            setEmployees(prev => prev.filter(e => e.idCarta !== selectedId));
            handleCloseFluid(() => {
            clearFormDrafts();
        });
        } catch (err: any) {
            alert('Error al eliminar empleado');
        }
    };

    const isSplitView = selectedId !== null || isCreating;

    if (loading && employees.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className={`employees-page ${isSplitView || isClosing ? 'split-view' : ''} ${isClosing ? 'closing' : ''}`}>
            {error && <div className="error-message">{error}</div>}
            <EmployeeGrid
                employees={employees}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedId}
                onBack={handleBack}
            />

            <EmployeeForm
                key={`${selectedId ?? 'new'}-${formInstanceKey}`}
                initialData={selectedEmp}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                availableTechnologies={availableTechnologies}
            />
        </div>
    );
};

export default EmployeesPage;
