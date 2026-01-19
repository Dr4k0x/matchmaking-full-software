import React, { type ReactNode } from 'react';
import '../Home/Home.css';

interface ModalWrapperProps {
    children: ReactNode;
    onClose?: () => void;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;
