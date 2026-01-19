import React, { useState, useEffect } from 'react';
import { type Technology } from '../../types';
import './Technologies.css';

interface TechFormProps {
    initialData?: Technology | null;
    onSave: (tech: Omit<Technology, 'idTecnologia'>) => void;
    onCancel: () => void;
    onDelete: () => void;
}

const TechForm: React.FC<TechFormProps> = ({ initialData, onSave, onCancel, onDelete }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setTipo(initialData.tipo);
        } else {
            setNombre('');
            setTipo('');
        }
    }, [initialData]);

    const handleSubmit = () => {
        if (!nombre.trim()) return; // visual feedback could be added
        onSave({ nombre, tipo });
    };

    return (
        <div className="tech-form-container">
            <div className="tech-form-content">
                {/* Preview Circle */}
                <div className="tech-preview-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>

                {/* Styled Inputs */}
                <div className="tech-input-group">
                    <div className="tech-input-label">NOMBRE</div>
                    <input
                        type="text"
                        className="tech-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: React"
                    />
                </div>

                <div className="tech-input-group">
                    <div className="tech-input-label">TIPO</div>
                    <input
                        type="text"
                        className="tech-input"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        placeholder="Ej: Frontend"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="tech-form-actions">
                <button className="tech-action-btn btn-save" onClick={handleSubmit}>
                    {initialData ? 'GUARDAR CAMBIOS' : 'CREAR TECNOLOGIA'}
                </button>
                <button className="tech-action-btn btn-cancel" onClick={onCancel}>
                    CANCELAR
                </button>
                 
                {/* Move delete here for better UX if desired or keep optional logic */}
                {/* Actually, user requested "create form polish". Delete is often strictly for "editing". */}
                {initialData && (
                     <button className="tech-action-btn tech-delete-main-btn" onClick={onDelete}>
                        ELIMINAR
                    </button>
                )}
            </div>
        </div>
    );
};

export default TechForm;
