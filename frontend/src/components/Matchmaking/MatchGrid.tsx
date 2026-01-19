import React from 'react';
import type { Match } from '../../types';
import './Matchmaking.css';

interface MatchGridProps {
    matches: Match[];
    onSelect: (match: Match) => void;
    onAdd: () => void;
    onBack: () => void;
}

const MatchGrid: React.FC<MatchGridProps> = ({ matches, onSelect, onAdd, onBack }) => {
    return (
        <div className="match-grid-container">
            <div className="match-header">
                <button className="back-btn" onClick={onBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    ATRAS
                </button>
                <h1 className="match-title">MATCHMAKING</h1>
            </div>
            <div className="match-grid">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="match-diamond"
                        onClick={() => onSelect(match)}
                    >
                        <div className="match-diamond-content">
                            <div className="match-score-text">{match.score}%</div>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="match-diamond add-btn" onClick={onAdd}>
                    <div className="match-diamond-content">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchGrid;
