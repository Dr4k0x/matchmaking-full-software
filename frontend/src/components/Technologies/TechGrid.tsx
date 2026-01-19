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
}

const TechGrid: React.FC<TechGridProps> = ({ 
    technologies, 
    onSelect, 
    onAdd, 
    selectedId, 
    onBack,
    isSelectionMode = false,
    selectedIds = [],
    onToggleSelect
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
                     <div style={{ flex: 1 }}></div>
                )}
                <h1 className="tech-title">{isSelectionMode ? 'SELECCIONAR' : 'TECNOLOGIAS'}</h1>
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
                        {isSelectionMode && (
                            <div className={`tech-checkbox ${selectedIds.includes(tech.idTecnologia) ? 'checked' : ''}`}>
                                {selectedIds.includes(tech.idTecnologia) && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                        )}

                        <div className="tech-circle">
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
