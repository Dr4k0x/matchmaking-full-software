import React from 'react';
import { type Employee } from '../../types';
import './Employees.css';

interface EmployeeGridProps {
    employees: Employee[];
    onSelect: (emp: Employee) => void;
    onAdd: () => void;
    selectedId: number | null;
    onBack: () => void;
}

const EmployeeGrid: React.FC<EmployeeGridProps> = ({ employees, onSelect, onAdd, selectedId, onBack }) => {
    return (
        <div className="emp-grid-container">
            <div className="emp-header">
                <button className="back-btn" onClick={onBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    ATRAS
                </button>
                <h1 className="emp-title">EMPLEADOS</h1>
            </div>

            <div className="emp-grid">
                {employees.map((emp) => (
                    <div
                        key={emp.idCarta}
                        className={`emp-card ${selectedId === emp.idCarta ? 'selected' : ''}`}
                        onClick={() => onSelect(emp)}
                    >
                        <div className="emp-card-header">
                            {emp.nombreApellido}
                        </div>
                        <div className="emp-card-image">
                            {/* Placeholder User Icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div className="emp-card-footer">
                            {emp.tipoCarta || 'Sin Rol'}
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="emp-card add-btn" onClick={onAdd}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default EmployeeGrid;
