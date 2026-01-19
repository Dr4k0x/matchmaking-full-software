import React from 'react';
import configIcon from '../../assets/images/index/config.png';

const SettingsButton: React.FC = () => {
  return (
    <button
      className="settings-button"
      aria-label="Configuración"
    >
      <img src={configIcon} alt="Configuración" />
    </button>
  );
};

export default SettingsButton;
