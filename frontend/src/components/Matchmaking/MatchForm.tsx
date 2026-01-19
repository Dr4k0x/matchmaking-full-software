import React, { useState, useEffect } from 'react';
import type { Match } from '../../types';
import type { Project } from '../../types'; // Import NivelProyecto if needed, or just rely on Project
import type { Employee } from '../../types';
import type { Technology } from '../../types';
import './Matchmaking.css';
import matchmakingService from '../../services/matchmaking.service';

interface MatchFormProps {
    initialData?: Match | null;
    projects: Project[];
    employees: Employee[];
    technologies: Technology[];
    onSave: (match: Omit<Match, 'id'>) => void;
    onCancel: () => void;
}

// Helper to find tech name by ID
const getTechName = (id: number, techs: Technology[]) => {
    return techs.find(t => t.idTecnologia === id)?.nombre || 'Unknown';
};

const MatchForm: React.FC<MatchFormProps> = ({ initialData, projects, employees, technologies, onSave, onCancel }) => {
    // State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [team, setTeam] = useState<any[]>(Array(5).fill(null)); // Initialize with 5 nulls
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

    useEffect(() => {
        if (initialData) {
            const proj = projects.find(p => p.idProyecto === initialData.idProyecto) || null;
            setSelectedProject(proj);

            const newTeam = Array(5).fill(null);
            initialData.cartasIds.forEach((id, index) => {
                const emp = employees.find(e => e.idCarta === id);
                if (emp && index < 5) newTeam[index] = emp;
            });
            setTeam(newTeam);

            setScore(initialData.score);
        } else {
            setSelectedProject(null);
            setTeam(Array(5).fill(null));
            setScore(0);
        }
    }, [initialData, projects, employees]);

    const handleRandomScore = () => {
        const randomScore = Math.floor(Math.random() * 101);
        setScore(randomScore);
    };

    const handleMatchTeam = async () => {
        if (!selectedProject) return alert('Seleccione un proyecto primero');
        setLoading(true);
        try {
            // Note: Update backend service to accept idProyecto naming if needed, 
            // but DTOs usually map properties. 
            // Checking createRandom DTO might be needed, assuming it expects idProyecto.
            const result = await matchmakingService.createRandom({
                idProyecto: selectedProject.idProyecto,
                maxCards: 5,
                threshold: 80
            });

            // Map result IDs back to employee objects
            // Assuming result holds employeeIds (or cartasIds)
            const resultIds = result.cartasIds || result.employeeIds || [];

            const newTeam = Array(5).fill(null);
            resultIds.forEach((id: number, idx: number) => {
                const emp = employees.find(e => e.idCarta === id);
                if (emp) newTeam[idx] = emp;
            });
            setTeam(newTeam);
            setScore(result.score);
        } catch (err) {
            alert('Error al generar equipo aleatorio');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClick = () => {
        const matchData = {
            idProyecto: selectedProject?.idProyecto || 0,
            cartasIds: team.filter(e => e !== null).map(e => e.idCarta),
            score
        };
        onSave(matchData);
    };

    // Project Selection Handlers
    const openProjectModal = () => setShowProjectModal(true);
    const selectProject = (proj: Project) => {
        setSelectedProject(proj);
        setShowProjectModal(false);
    };

    // Employee Selection Handlers
    const openEmployeeModal = (index: number) => {
        setActiveSlotIndex(index);
        setShowEmployeeModal(true);
    };
    const selectEmployee = (emp: any) => {
        if (activeSlotIndex !== null) {
            const newTeam = [...team];
            newTeam[activeSlotIndex] = emp;
            setTeam(newTeam);
            setShowEmployeeModal(false);
            setActiveSlotIndex(null);
        }
    };

    return (
        <div className="match-overlay">
            <div className="match-panel">
                {/* Left: Data */}
                <div className="match-panel-left">
                    {/* Top: Project */}
                    <div className="match-project-section centered-section">
                        {selectedProject ? (
                            <div className="match-project-card" onClick={openProjectModal}>
                                <div className="match-proj-img">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '60%', height: '60%' }}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                </div>
                                <div className="match-proj-details">
                                    <div className="match-proj-name">{selectedProject.nombre}</div>
                                    <div className="match-stat-display">
                                        <div className="match-stat-item">
                                            <span className="match-stat-label">COLAB</span>
                                            <span className="match-stat-value">{selectedProject.nivelColaborativo}</span>
                                        </div>
                                        <div className="match-stat-item">
                                            <span className="match-stat-label">ORG</span>
                                            <span className="match-stat-value">{selectedProject.nivelOrganizativo}</span>
                                        </div>
                                        <div className="match-stat-item">
                                            <span className="match-stat-label">SPEED</span>
                                            <span className="match-stat-value">{selectedProject.nivelVelocidadDesarrollo}</span>
                                        </div>
                                    </div>
                                    <div className="match-skills-title">HABILIDADES</div>
                                    <div className="match-tech-list">
                                        {selectedProject.nivelesProyecto && selectedProject.nivelesProyecto.map(np => {
                                            const techName = getTechName(np.idTecnologia, technologies);
                                            return (
                                                <div key={np.idTecnologia} className="match-tech-icon" title={`${techName} (Lv ${np.nivelRequerido})`}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                                        <polyline points="16 18 22 12 16 6"></polyline>
                                                        <polyline points="8 6 2 12 8 18"></polyline>
                                                    </svg>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="match-slot large-slot" onClick={openProjectModal}>
                                ?
                                <div className="match-slot-label">SELECCIONAR PROYECTO</div>
                            </div>
                        )}
                    </div>

                    {/* Bottom: Team */}
                    <div className="match-team-section">
                        <div className="match-team-title">EQUIPO SELECCIONADO</div>
                        <div className="match-team-slots">
                            {team.map((member, index) => (
                                <div key={index} className="match-slot-wrapper" onClick={() => openEmployeeModal(index)}>
                                    {member ? (
                                        <div className="match-mini-card clickable">
                                            <div className="match-mini-img">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '50%', height: '50%' }}>
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </div>
                                            <div className="match-mini-info">
                                                <div className="match-mini-name">{member.nombreApellido}</div>
                                                <div className="match-mini-role">{member.tipoCarta}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="match-slot clickable">?</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Score */}
                <div className="match-panel-right">
                    <button className="match-btn-random" onClick={handleRandomScore}>RANDOM</button>
                    <div className="match-score-circle">{score}%</div>
                    <button className="match-btn-match" onClick={handleMatchTeam} disabled={loading}>
                        {loading ? '...' : 'MATCH'}
                    </button>

                    <div className="match-controls">
                        <button className="match-ctrl-btn btn-save" onClick={handleSaveClick} title="Guardar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        <button className="match-ctrl-btn btn-cancel" onClick={onCancel} title="Cancelar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Selection Modal */}
            {showProjectModal && (
                <div className="selection-modal-overlay">
                    <div className="selection-modal">
                        <h3>Seleccionar Proyecto</h3>
                        <div className="selection-list">
                            {projects.map(p => (
                                <div key={p.idProyecto} className="selection-item" onClick={() => selectProject(p)}>
                                    <div className="selection-name">{p.nombre}</div>
                                    <div className="selection-desc">{p.descripcion}</div>
                                </div>
                            ))}
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowProjectModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Employee Selection Modal */}
            {showEmployeeModal && (
                <div className="selection-modal-overlay">
                    <div className="selection-modal">
                        <h3>Seleccionar Empleado</h3>
                        <div className="selection-list">
                            {employees.map(e => (
                                <div key={e.idCarta} className="selection-item" onClick={() => selectEmployee(e)}>
                                    <div className="selection-name">{e.nombreApellido}</div>
                                    <div className="selection-desc">{e.tipoCarta}</div>
                                </div>
                            ))}
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowEmployeeModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchForm;
