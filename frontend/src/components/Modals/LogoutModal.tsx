import React from 'react';
import ModalWrapper from './ModalWrapper';
import '../Home/Home.css';

interface LogoutModalProps {
    onClose: () => void;
    onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, onLogout }) => {
    return (
        <ModalWrapper onClose={onClose}>
            <div className="modal-header red">
                SALIR
            </div>
            <div className="modal-body">
                <p className="modal-text">¿Quiere cerrar la sesión?</p>
                <div className="modal-actions">
                    <button className="modal-btn btn-gray" onClick={onClose}>NO</button>
                    <button className="modal-btn btn-red" onClick={onLogout}>SI</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default LogoutModal;
