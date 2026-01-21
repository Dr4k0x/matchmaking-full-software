import React, { useEffect, useState } from 'react';
import type { Match, Employee, NivelCarta } from '../../types';
import matchmakingService from '../../services/matchmaking.service';
import './Matchmaking.css';
import { getProjectStatusBadgeClass, getProjectStatusLabel } from './utils';

interface MatchmakingDetailsModalProps {
    isOpen: boolean;
    matchId: number | null;
    onClose: () => void;
}

/* --- VIEW ONLY COMPONENTS --- */

// Project Details Panel (Matches MatchForm style but Read-Only)
const ProjectDetailsPanel = ({ match }: { match: Match }) => {
    const project = match.proyecto;
    if (!project) return null;

    const formatDate = (d: string) => d ? d.substring(0, 10) : 'N/A';
    
    // Techs logic
    const techs = project.nivelesProyecto || [];

    return (
        <div className="project-panel-compact" style={{cursor: 'default', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                    <div className="proj-name" style={{fontSize: '1.8rem'}}>{project.nombre}</div>
                    <div className="proj-dates">
                        <span>Creado: {formatDate(project.fechaCreacion)}</span>
                        <span>•</span>
                        <span>Fin: {formatDate(project.fechaFinalizacion)}</span>
                    </div>
                </div>
                <div style={{
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    background: getProjectStatusBadgeClass(project.estado),
                    color: 'white', fontWeight: 700, fontSize: '0.8rem'
                }}>
                    {getProjectStatusLabel(project.estado).toUpperCase()}
                </div>
            </div>

            <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {/* Requirements Row */}
                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                    <span className="req-badge req-colab">COLABORACIÓN Lv {project.nivelColaborativo}</span>
                    <span className="req-badge req-sab">SABIDURÍA Lv {project.nivelOrganizativo}</span>
                    <span className="req-badge req-speed">VELOCIDAD Lv {project.nivelVelocidadDesarrollo}</span>
                </div>

                {/* Techs Row */}
                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
                    <span style={{fontSize: '0.8rem', fontWeight: 700, color: '#64748b'}}>TECNOLOGÍAS:</span>
                    {techs.length === 0 ? (
                        <span style={{fontSize: '0.8rem', fontStyle: 'italic', color: '#94a3b8'}}>Sin tecnologías requeridas</span>
                    ) : (
                        techs.map((np, idx) => (
                            <span key={idx} className="tech-badge-mini" style={{fontSize: '0.8rem', padding: '4px 8px'}}>
                                {np.tecnologia?.nombre || `Tech #${np.idTecnologia}`} · Lv {np.nivelRequerido}
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Employee Card (Yu-Gi-Oh Style with Tech Carousel)
const EmployeeYuGiCard = ({ employee }: { employee: Employee }) => {
    const techs = employee.nivelesCarta || [];
    const [idx, setIdx] = useState(0);
    const hasTechs = techs.length > 0;

    const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((idx + 1) % techs.length); };
    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((idx - 1 + techs.length) % techs.length); };
    
    const currentTech = hasTechs ? techs[idx] : null;
    const getTechName = (nc: NivelCarta) => nc.tecnologia?.nombre || `Tech #${nc.idTecnologia}`;

    return (
        <div className="mm-yugi-card">
            <div className="mm-yugi-header" title={employee.nombreApellido}>{employee.nombreApellido}</div>
            <div className="mm-yugi-portrait">
                {/* User Icon */}
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div className="mm-yugi-type">{employee.tipoCarta}</div>
            </div>
            <div className="mm-yugi-stats">
                <span>COL {employee.poderSocial}</span>
                <span>SAB {employee.sabiduria}</span>
                <span>VEL {employee.velocidad}</span>
            </div>
            <div className="mm-yugi-techbar">
                 {!hasTechs ? (
                    <span className="mm-tech-chip" style={{fontStyle:'italic', color:'#94a3b8'}}>Sin tecnologías</span>
                 ) : (
                    <div className="mm-tech-carousel">
                         {techs.length > 1 && <button className="mm-carousel-btn" onClick={prev}>‹</button>}
                        <span className="mm-tech-chip">
                            {getTechName(currentTech!)} · Lv {currentTech!.nivelDominado}
                        </span>
                        {techs.length > 1 && <button className="mm-carousel-btn" onClick={next}>›</button>}
                    </div>
                 )}
            </div>
        </div>
    );
};


/* --- MAIN MODAL --- */

const MatchmakingDetailsModal: React.FC<MatchmakingDetailsModalProps> = ({ isOpen, matchId, onClose }) => {
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Logic
    useEffect(() => {
        if (!isOpen) {
            setMatch(null); setError(null); setLoading(false);
            return;
        }

        let isMounted = true;
        
        const fetchDetails = async () => {
            if (matchId === null || typeof matchId !== 'number') return;
            setLoading(true); setError(null); setMatch(null); 

            try {
                const data = await matchmakingService.findOne(matchId);
                if (isMounted) setMatch(data);
            } catch (err: any) {
                if (isMounted) {
                    console.error("Failed to load details", err);
                    setError("No se pudo cargar la información.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetails();
        return () => { isMounted = false; };
    }, [isOpen, matchId]);

    // Esc & Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleEsc);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Formatting
    const rawScore = match?.resultadoPorcentaje ?? 0;
    const safeScore = isNaN(Number(rawScore)) ? 0 : Math.min(100, Math.max(0, Number(rawScore)));
    const formattedScore = safeScore.toFixed(2); 

    interface CircleCSS extends React.CSSProperties { '--progress'?: string; }

    return (
        <div className="picker-modal-overlay" onClick={onClose}>
            <div className="picker-modal" 
                 onClick={e => e.stopPropagation()} 
                 style={{ 
                     maxWidth: '1100px', 
                     width: '95vw',
                     height: 'auto', 
                     maxHeight: '92vh', 
                     border: '4px solid var(--mm-navy)',
                     borderRadius: '20px'
                 }}>
                
                <div className="picker-header">
                    <div>
                        <h3 className="picker-title">DETALLES DEL MATCHMAKING</h3>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{padding: '0.4rem', border:'none'}}>✕</button>
                </div>

                <div className="picker-body" style={{ background: 'var(--mm-yellow-pale)', overflowY: 'auto' }}>
                    {loading && (
                        <div style={{padding: '4rem', textAlign: 'center', color: '#64748b'}}>
                            <div className="loading-spinner"></div>
                            <p style={{marginTop: '1rem', fontWeight: 600}}>Cargando detalles...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{padding: '2rem', textAlign: 'center', color: '#ef4444', background: '#fee2e2', borderRadius: '8px'}}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {match && !loading && (
                        <div className="mm-details-modal-content">
                            
                            {/* TOP SECTION: Project Panel (Left) & Score (Right) */}
                            <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch'}}>
                                
                                <div style={{flex: 2, minWidth: '300px'}}>
                                    <div style={{fontSize:'0.8rem', fontWeight:800, color:'var(--mm-navy)', textTransform:'uppercase', marginBottom:'0.5rem'}}>PROYECTO OBJETIVO</div>
                                    <ProjectDetailsPanel match={match} />
                                </div>

                                <div style={{flex: 1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:'220px'}}>
                                     <div className="score-circle-details" 
                                          style={{ 
                                              '--progress': `${formattedScore}%`
                                          } as CircleCSS}>
                                         <div className="score-inner">
                                             <span className="score-val">{formattedScore}%</span>
                                             <span className="score-lbl" style={{ color: '#16a34a', fontWeight: 700 }} >
                                                COMPATIBILIDAD
                                             </span>
                                         </div>
                                     </div>
                                </div>

                            </div>

                            <hr style={{margin: 0, borderColor: '#cbd5e1', borderStyle:'dashed'}} />

                            {/* TEAM SECTION */}
                            <div>
                                <div style={{textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 800, color: 'var(--mm-navy)', marginBottom: '0.5rem'}}>
                                    EQUIPO SELECCIONADO ({match.cartas?.length || 0})
                                </div>
                                
                                <div className="mm-team-row">
                                    {match.cartas?.map(carta => (
                                        <div key={carta.idCarta} className="mm-card-wrapper">
                                            <EmployeeYuGiCard employee={carta} />
                                        </div>
                                    ))}
                                    {(!match.cartas || match.cartas.length === 0) && (
                                        <div style={{width:'100%', textAlign:'center', padding:'2rem', color:'#94a3b8', fontStyle:'italic'}}>
                                            No hay cartas asignadas
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="picker-footer">
                    <button className="picker-btn-confirm" onClick={onClose} style={{width: '100%'}}>
                        CERRAR VISTA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchmakingDetailsModal;
