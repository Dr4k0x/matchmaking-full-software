import React from 'react';
import type { Technology } from '../../types';
import './Technologies.css';

interface TechGridProps {
    technologies: Technology[];
    onSelect: (tech: Technology) => void;
    onAdd: () => void;
    selectedId: number | null;
    onBack: () => void;
    // Selection Mode Props
    isSelectionMode?: boolean;
    selectedIds?: number[];
    onToggleSelect?: (id: number) => void;
    // CRUD Actions
    onEdit?: (tech: Technology) => void;
    onDelete?: (tech: Technology) => void;
}

const TechGrid: React.FC<TechGridProps> = ({ 
    technologies, 
    onSelect, 
    onAdd, 
    selectedId, 
    onBack,
    isSelectionMode = false,
    selectedIds = [],
    onToggleSelect,
    onEdit,
    onDelete
}) => {
    return (
        <div className="tech-grid-container">
            <div className="tech-header">
                {!isSelectionMode && (
                    <button className="back-btn" onClick={onBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        ATRAS
                    </button>
                )}
                {isSelectionMode && (
                     <div style={{ flex: 1 }}></div> // Spacer if back btn hidden
                )}
                <h1 className="tech-title">{isSelectionMode ? 'SELECCIONAR TECNOLOGIAS' : 'TECNOLOGIAS'}</h1>
            </div>
            <div className="tech-grid">
                {technologies.map((tech) => (
                    <div
                        key={tech.idTecnologia}
                        className={`tech-item ${selectedId === tech.idTecnologia ? 'selected' : ''} ${isSelectionMode && selectedIds.includes(tech.idTecnologia) ? 'pre-selected' : ''}`}
                        onClick={() => {
                            if (isSelectionMode && onToggleSelect) {
                                onToggleSelect(tech.idTecnologia);
                            } else {
                                onSelect(tech);
                            }
                        }}
                    >
                        {/* Checkbox overlay for selection mode */}
                        {isSelectionMode && (
                            <div className={`tech-checkbox ${selectedIds.includes(tech.idTecnologia) ? 'checked' : ''}`}>
                                {selectedIds.includes(tech.idTecnologia) && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                        )}

                        {/* Actions Overlay (Edit/Delete) - Visible on Hover even in Selection Mode */}
                        <div className="tech-actions-overlay" onClick={(e) => e.stopPropagation()}>
                            {onEdit && (
                                <div className="tech-action-icon edit" onClick={() => onEdit(tech)} title="Editar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </div>
                            )}
                            {onDelete && (
                                <div className="tech-action-icon delete" onClick={() => onDelete(tech)} title="Eliminar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="tech-circle">
                            {/* File/Code Icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <span className="tech-name">{tech.nombre}</span>
                    </div>
                ))}

                {/* Add Button */}
                <div className="tech-item add-tech-btn" onClick={onAdd}>
                    <div className="tech-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <span className="tech-name">AGREGAR</span>
                </div>
            </div>
        </div>
    );
};

export default TechGrid;
