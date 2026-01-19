import React from 'react';
import type { Project } from '../../types';
import './Projects.css';

interface ProjectGridProps {
    projects: Project[];
    onSelect: (proj: Project) => void;
    onAdd: () => void;
    selectedId: number | null;
    onBack: () => void;
    isSplitView: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelect, onAdd, selectedId, onBack, isSplitView }) => {
    return (
        <div className="proj-grid-container">
            {!isSplitView && (
                <div className="proj-header">
                    <button className="back-btn" onClick={onBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        ATRAS
                    </button>
                    <h1 className="proj-title">PROYECTOS</h1>
                </div>
            )}

            <div className="proj-grid">
                {projects.map((proj) => (
                    <div
                        key={proj.idProyecto}
                        className={`proj-card ${selectedId === proj.idProyecto ? 'selected' : ''}`}
                        onClick={() => onSelect(proj)}
                    >
                        <div className="proj-card-image">
                            {/* Blueprint Icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        </div>
                        <div className="proj-card-footer">
                            <div className="proj-card-title">{proj.nombre}</div>
                            <div className="proj-card-desc">{proj.descripcion || 'Sin descripción'}</div>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="proj-card add-btn" onClick={onAdd}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ProjectGrid;
