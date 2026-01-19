import React, { useState } from 'react';
import configIcon from '../../assets/images/index/config.png';
import '../Home/Home.css';

interface SettingsMenuProps {
    onProfileClick: () => void;
    onLogoutClick: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onProfileClick, onLogoutClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`settings-menu ${isOpen ? 'open' : ''}`}>
            <button
                className="settings-toggle"
                onClick={toggleMenu}
                aria-label="Configuración"
            >
                <img src={configIcon} alt="Configuración" />
            </button>

            <div className="settings-options">
                <button
                    className="settings-option-btn profile-btn"
                    onClick={() => {
                        onProfileClick();
                        setIsOpen(false);
                    }}
                    aria-label="Perfil"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>

                <button
                    className="settings-option-btn logout-btn"
                    onClick={() => {
                        onLogoutClick();
                        setIsOpen(false);
                    }}
                    aria-label="Cerrar Sesión"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SettingsMenu;
