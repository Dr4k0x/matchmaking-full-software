import React from 'react';
import './ErrorModal.css';

interface ErrorModalProps {
    isOpen: boolean;
    title: string;
    message: string | string[];
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, title, message, onClose }) => {
    if (!isOpen) return null;

    const messages = Array.isArray(message) ? message : [message];

    return (
        <div className="proj-error-overlay" onClick={onClose}>
            <div className="proj-error-card" onClick={e => e.stopPropagation()}>
                <div className="proj-error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 className="proj-error-title">{title}</h3>
                <div className="proj-error-text-container">
                    {messages.map((msg, idx) => (
                        <p key={idx} className="proj-error-text">{msg}</p>
                    ))}
                </div>
                <button className="proj-error-btn" type="button" onClick={onClose}>ENTENDIDO</button>
            </div>
        </div>
    );
};

export default ErrorModal;
