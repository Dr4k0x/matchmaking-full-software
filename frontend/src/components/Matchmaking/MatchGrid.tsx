import React from 'react';
import type { Match } from '../../types';
import './Matchmaking.css';
import { getProjectStatusLabel, getProjectStatusBadgeClass } from './utils';

interface MatchGridProps {
    matches: Match[];
    onDelete: (id: number) => void;
    onAdd: () => void;
    onBack: () => void;
    onSelect: (id: number) => void;
}

const MatchGrid: React.FC<MatchGridProps> = ({ matches, onDelete, onAdd, onBack, onSelect }) => {
    return (
        <div className="match-grid-container">
            <div className="match-header">
                <button style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold', color: 'var(--mm-navy)'}} onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    ATRAS
                </button>
                <h1 className="match-title">MATCHMAKING</h1>
                <div style={{width: 60}}></div> {/* Spacer for symmetry */}
            </div>

            <div className="match-grid">
                {/* Add Button as First Card */}
                <div className="match-card-premium add-btn" onClick={onAdd}>
                    <div className="mm-diamond-inner">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span style={{marginTop: '0.5rem', fontWeight: 600, fontSize: '0.9rem'}}>CREAR NUEVO</span>
                    </div>
                </div>

                {matches.map((match) => (
                    <div key={match.idMatchmaking} className="match-card-premium" onClick={() => onSelect(match.idMatchmaking)} style={{cursor: 'pointer'}}>
                        <button className="match-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(match.idMatchmaking); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        
                        <div className="mm-diamond-inner">
                            <div className="match-grid-proj-name" title={match.proyecto?.nombre}>{match.proyecto?.nombre || <em style={{color:'#cbd5e1'}}>Sin Nombre</em>}</div>
                            <div className="match-grid-score">{match.resultadoPorcentaje}%</div>
                            <div style={{fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem', fontWeight: 800}}>COMPATIBILIDAD</div>
                            
                            {match.proyecto && (
                                <div style={{
                                    marginTop: '0.4rem', 
                                    fontSize: '0.6rem', 
                                    padding: '2px 8px', 
                                    borderRadius: '10px',
                                    background: getProjectStatusBadgeClass(match.proyecto.estado),
                                    color: 'white',
                                    fontWeight: 800,
                                    textTransform: 'uppercase'
                                }}>
                                    {getProjectStatusLabel(match.proyecto.estado)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchGrid;
