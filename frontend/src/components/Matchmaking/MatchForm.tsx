import React, { useState, useEffect } from 'react';
import type { Project, Employee, Technology } from '../../types';
import './Matchmaking.css';
import matchmakingService from '../../services/matchmaking.service';
import { getProjectStatusLabel, getProjectStatusBadgeClass } from './utils';

interface MatchFormProps {
    projects: Project[];
    employees: Employee[];
    technologies: Technology[];
    onSave: () => void;
    onCancel: () => void;
}

// Helper: Show Name Only (Level is handled at call site)
const getTechDisplay = (id: number, techs: Technology[]) => {
    const tech = techs.find(t => t.idTecnologia === id);
    return tech ? `${tech.nombre}` : 'Unknown';
};

/* --- SUB-COMPONENTS --- */

const ProjectPanelCompact = ({ project, technologies, onSelect }: { project: Project | null, technologies: Technology[], onSelect: () => void }) => {
    if (!project) {
        return (
            <div className="project-panel-compact" onClick={onSelect} style={{ justifyContent: 'center', borderStyle: 'dashed' }}>
                <span style={{ fontWeight: 700, color: '#94a3b8' }}>+ SELECCIONAR PROYECTO</span>
            </div>
        );
    }
    return (
        <div className="project-panel-compact" onClick={onSelect} title="Cambiar Proyecto">
            <div className="proj-info-main">
                <div className="proj-name">{project.nombre}</div>
                <div className="proj-dates">
                    <span>{project.fechaCreacion.substring(0, 10)} → {project.fechaFinalizacion}</span>
                </div>
                <div style={{marginBottom: '0.5rem'}}>
                    <span style={{
                        fontSize: '0.75rem', fontWeight: 700, 
                        color: getProjectStatusBadgeClass(project.estado),
                        border: `1px solid ${getProjectStatusBadgeClass(project.estado)}`,
                        padding: '2px 8px', borderRadius: '12px'
                    }}>
                        {getProjectStatusLabel(project.estado).toUpperCase()}
                    </span>
                </div>
                <div className="proj-requirements">
                    <span className="req-badge req-colab">COLABORACIÓN Lv {project.nivelColaborativo}</span>
                    <span className="req-badge req-sab">SABIDURÍA Lv {project.nivelOrganizativo}</span>
                    <span className="req-badge req-speed">VELOCIDAD Lv {project.nivelVelocidadDesarrollo}</span>
                    
                    <div className="tech-badges-list">
                        {project.nivelesProyecto?.slice(0, 3).map(np => (
                            <span key={np.idTecnologia} className="tech-badge-mini">
                                {getTechDisplay(np.idTecnologia, technologies)} · Lv {np.nivelRequerido}
                            </span>
                        ))}
                        {(project.nivelesProyecto?.length || 0) > 3 && <span className="tech-badge-mini">...</span>}
                    </div>
                </div>
            </div>
            <div style={{ marginLeft: '1rem', color: '#cbd5e1' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
        </div>
    );
};

const YuGiOhCard = ({ employee, technologies, onRemove }: { employee: Employee, technologies: Technology[], onRemove: () => void }) => {
    const [techIdx, setTechIdx] = useState(0);
    const techList = employee.nivelesCarta || [];
    const hasTechs = techList.length > 0;

    const nextTech = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasTechs) setTechIdx((prev) => (prev + 1) % techList.length);
    };

    const prevTech = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasTechs) setTechIdx((prev) => (prev - 1 + techList.length) % techList.length);
    };

    const currentTech = hasTechs ? techList[techIdx] : null;

    return (
        <div className="yugioh-card">
            <button className="remove-card-btn" onClick={onRemove} title="Remover carta">×</button>
            <div className="card-inner">
                <div className="card-name-header" title={employee.nombreApellido}>
                    {employee.nombreApellido}
                </div>
                <div className="card-portrait">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div className="card-type-strip">{employee.tipoCarta}</div>
                </div>
                <div className="card-details">
                    <div className="card-stats-row">
                        <span>COL Lv {employee.poderSocial}</span>
                        <span>SAB Lv {employee.sabiduria}</span>
                        <span>VEL Lv {employee.velocidad}</span>
                    </div>
                    <div className="card-tech-carousel">
                        {hasTechs && techList.length > 1 && <button className="carousel-btn" onClick={prevTech}>‹</button>}
                        
                        <div className="tech-text">
                            {currentTech ? (
                                <span>
                                    {getTechDisplay(currentTech.idTecnologia, technologies)} · Lv {currentTech.nivelDominado}
                                </span>
                            ) : (
                                <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin Techs</span>
                            )}
                        </div>

                        {hasTechs && techList.length > 1 && <button className="carousel-btn" onClick={nextTech}>›</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- MODAL COMPONENTS --- */

const ProjectPickerModal = ({ 
    isOpen, 
    projects, 
    onClose, 
    onConfirm 
}: { 
    isOpen: boolean, 
    projects: Project[], 
    onClose: () => void, 
    onConfirm: (p: Project) => void 
}) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const proj = projects.find(p => p.idProyecto === selectedId);
        if (proj) onConfirm(proj);
    };

    return (
        <div className="picker-modal-overlay" onClick={onClose}>
            <div className="picker-modal" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <div>
                        <h3 className="picker-title">SELECCIONAR PROYECTO</h3>
                        <div className="picker-subtitle">Elige el proyecto para el matchmaking</div>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{padding: '0.4rem', border:'none'}}>✕</button>
                </div>
                <div className="picker-body">
                    <div className="picker-grid">
                        {projects.map(p => (
                            <div 
                                key={p.idProyecto} 
                                className={`picker-item ${selectedId === p.idProyecto ? 'selected' : ''}`}
                                onClick={() => setSelectedId(p.idProyecto)}
                            >
                                <div className="picker-item-name">{p.nombre}</div>
                                <div className="picker-item-info">
                                    {p.fechaCreacion.substring(0, 10)}
                                    <br/>
                                    <strong>{getProjectStatusLabel(p.estado)}</strong>
                                </div>
                                {/* Visual Checkmark for Selected */}
                                {selectedId === p.idProyecto && (
                                    <div style={{
                                        position:'absolute', top:'-8px', right:'-8px', 
                                        background:'var(--mm-navy)', color:'var(--mm-yellow)',
                                        borderRadius:'50%', width:'24px', height:'24px', 
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontWeight:'bold', border:'2px solid white'
                                    }}>✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="picker-footer">
                    <button className="picker-btn-cancel" onClick={onClose}>CANCELAR</button>
                    <button className="picker-btn-confirm" disabled={!selectedId} onClick={handleConfirm}>CONFIRMAR</button>
                </div>
            </div>
        </div>
    );
};

const EmployeeMultiPickerModal = ({
    isOpen,
    employees,
    currentTeamIds,
    onClose,
    onConfirm
}: {
    isOpen: boolean,
    employees: Employee[],
    currentTeamIds: number[],
    onClose: () => void,
    onConfirm: (newEmployees: Employee[]) => void
}) => {
    // Local state for selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) setSelectedIds([]); // Reset on open
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            // Limit total selection (Current Team + New Selection <= 5)
            if (currentTeamIds.length + selectedIds.length < 5) {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };

    const handleConfirm = () => {
        const newEmps = employees.filter(e => selectedIds.includes(e.idCarta));
        onConfirm(newEmps);
    };

    const slotsRemaining = 5 - currentTeamIds.length;

    return (
        <div className="picker-modal-overlay" onClick={onClose}>
            <div className="picker-modal" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <div>
                        <h3 className="picker-title">AÑADIR CARTAS</h3>
                        <div className="picker-subtitle">
                            Seleccionados: {selectedIds.length} / {slotsRemaining} disponibles
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{padding: '0.4rem', border:'none'}}>✕</button>
                </div>
                <div className="picker-body">
                    <div className="picker-grid">
                        {employees.map(e => {
                            const isAlreadyInTeam = currentTeamIds.includes(e.idCarta);
                            const isSelected = selectedIds.includes(e.idCarta);
                            
                            return (
                                <div 
                                    key={e.idCarta} 
                                    className={`picker-item ${isSelected ? 'selected' : ''} ${isAlreadyInTeam ? 'disabled' : ''}`}
                                    onClick={() => !isAlreadyInTeam && toggleSelection(e.idCarta)}
                                >
                                    <div className="picker-item-name">{e.nombreApellido}</div>
                                    <div className="picker-item-info">
                                        {e.tipoCarta} · COL {e.poderSocial}
                                        {isAlreadyInTeam && <div style={{color:'#ef4444', fontWeight:'bold', marginTop:'4px'}}>En equipo</div>}
                                    </div>
                                    
                                    {/* Visual Checkmark for Selected */}
                                    {isSelected && (
                                        <div style={{
                                            position:'absolute', top:'-8px', right:'-8px', 
                                            background:'var(--mm-navy)', color:'var(--mm-yellow)',
                                            borderRadius:'50%', width:'24px', height:'24px', 
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            fontWeight:'bold', border:'2px solid white'
                                        }}>✓</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="picker-footer">
                    <button className="picker-btn-cancel" onClick={onClose}>CANCELAR</button>
                    <button className="picker-btn-confirm" disabled={selectedIds.length === 0} onClick={handleConfirm}>
                        CONFIRMAR SELECCIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};


/* --- MAIN FORM --- */

const MatchForm: React.FC<MatchFormProps> = ({ projects, employees, technologies, onSave, onCancel }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [team, setTeam] = useState<Employee[]>([]);
    const [score, setScore] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const selectedCardsIds = team.map(e => e.idCarta);
    const isValidSelection = selectedProject !== null && selectedCardsIds.length >= 2 && selectedCardsIds.length <= 5;

    useEffect(() => {
        let isMounted = true;
        const fetchPreview = async () => {
            if (!selectedProject || selectedCardsIds.length < 2) {
                setScore(0);
                return;
            }
            setPreviewLoading(true);
            try {
                const result = await matchmakingService.preview({
                    idProyecto: selectedProject.idProyecto,
                    cartasIds: selectedCardsIds
                });
                if (isMounted) setScore(result.porcentaje);
            } catch {
                if(isMounted) setScore(0);
            } finally {
                if (isMounted) setPreviewLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchPreview, 500);
        return () => { isMounted = false; clearTimeout(timeoutId); };
    }, [selectedProject, selectedCardsIds.length, JSON.stringify(selectedCardsIds)]);

    const handleSaveClick = async () => {
        if (!isValidSelection || !selectedProject) return;
        setLoading(true);
        setError(null);
        try {
            await matchmakingService.create({
                idProyecto: selectedProject.idProyecto,
                cartasIds: selectedCardsIds
            });
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear matchmaking');
        } finally {
            setLoading(false);
        }
    };

    // Modal Handlers
    const handleProjectConfirm = (p: Project) => {
        setSelectedProject(p);
        setShowProjectModal(false);
    };

    const handleEmployeesConfirm = (newEmps: Employee[]) => {
        // Add new employees to existing team
        setTeam([...team, ...newEmps]);
        setShowEmployeeModal(false);
    };

    // Render 5 fixed slots
    const slots = Array(5).fill(null); 

    return (
        <div className="match-overlay">
            <div className="match-board-container">
                {/* Left Column: Project + Board */}
                <div className="board-left-column">
                    {error && (
                        <div style={{background: '#ef4444', color: 'white', padding: '0.5rem', borderRadius: 4, marginBottom: '1rem', textAlign: 'center', cursor: 'pointer'}} onClick={()=>setError(null)}>
                            {error} <small>(click to dismiss)</small>
                        </div>
                    )}

                    <ProjectPanelCompact 
                        project={selectedProject} 
                        technologies={technologies} 
                        onSelect={() => setShowProjectModal(true)} 
                    />

                    <div className="team-board-area">
                        <div className="cards-row">
                            {slots.map((_, index) => {
                                const member = team[index];
                                if (member) {
                                    return (
                                        <YuGiOhCard 
                                            key={member.idCarta} 
                                            employee={member} 
                                            technologies={technologies} 
                                            onRemove={() => setTeam(team.filter(t => t.idCarta !== member.idCarta))}
                                        />
                                    );
                                } else {
                                    return (
                                        <div 
                                            key={`empty-${index}`} 
                                            className="empty-slot-card"
                                            onClick={() => setShowEmployeeModal(true)}
                                            style={{ visibility: team.length >= 5 ? 'hidden' : 'visible' }}
                                        >
                                            +
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status */}
                <div className="board-right-column">
                    <div className="status-content">
                        <h3 style={{margin:0, color: '#94a3b8'}}>STATUS</h3>
                        <div className="score-circle-lg" style={{ '--progress': `${score}%` } as React.CSSProperties}>
                            <div className="score-inner">
                                {previewLoading ? (
                                    <span className="score-val" style={{fontSize: '3rem', color: '#94a3b8'}}>...</span>
                                ) : (
                                    <span className="score-val">{score}%</span>
                                )}
                                <span className="score-lbl">{previewLoading ? 'CALCULANDO' : 'MATCH'}</span>
                            </div>
                        </div>
                        <div className={`status-badge ${score > 70 ? 'ok' : 'nok'}`}>
                            {selectedCardsIds.length < 2 ? 'FALTAN CARTAS' : (score > 70 ? 'COMPATIBLE' : 'INSUFICIENTE')}
                        </div>
                    </div>

                    <div className="match-actions">
                        <button className="btn-match" onClick={handleSaveClick} disabled={loading || !isValidSelection || score <= 70}>
                            {loading ? '...' : 'CONFIRMAR MATCH'}
                        </button>
                        <button className="btn-close" onClick={onCancel}>
                            CANCELAR / ATRÁS
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <ProjectPickerModal 
                isOpen={showProjectModal}
                projects={projects}
                onClose={() => setShowProjectModal(false)}
                onConfirm={handleProjectConfirm}
            />

            <EmployeeMultiPickerModal
                isOpen={showEmployeeModal}
                employees={employees}
                currentTeamIds={selectedCardsIds}
                onClose={() => setShowEmployeeModal(false)}
                onConfirm={handleEmployeesConfirm}
            />
        </div>
    );
};

export default MatchForm;
