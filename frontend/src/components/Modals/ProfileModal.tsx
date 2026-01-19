import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import '../Home/Home.css';
import usuariosService from '../../services/usuarios.service';

interface ProfileModalProps {
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

    const [userId, setUserId] = useState<number | null>(null);

    // Fetch user profile on mount/open
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length !== 3) throw new Error("Invalid Token Format");

                const payload = JSON.parse(atob(tokenParts[1]));
                // console.log("Token Payload:", payload);

                const id = payload.sub;
                if (id) {
                    setUserId(id);
                    loadProfile(id);
                } else {
                    console.error("Token missing 'sub'");
                    setStatusMessage({ type: 'error', text: 'Error de sesión: Usuario no identificado.' });
                }
            } catch (e) {
                console.error("Error decoding token:", e);
                setStatusMessage({ type: 'error', text: 'Error de sesión: Token inválido.' });
            }
        }
    }, []);


    const loadProfile = async (id: number) => {
        try {
            const user = await usuariosService.getById(id);
            if (user && user.nombre) {
                setName(user.nombre);
                setNewName(user.nombre);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            setStatusMessage({ type: 'error', text: 'No se pudo cargar el perfil.' });
        }
    };

    const handleFinish = () => {
        onClose();
    };

    const handleSaveName = async () => {
        setStatusMessage({ type: '', text: '' }); // Clear previous messages
        setNameError('');

        if (!newName.trim()) {
            setNameError('El nombre es obligatorio.');
            return;
        }
        if (newName.length < 2) {
             setNameError('El nombre debe tener al menos 2 caracteres.');
             return;
        }
        if (!userId) {
            setStatusMessage({ type: 'error', text: 'No se pudo identificar al usuario.' });
            return;
        }

        setLoading(true);
        try {
            await usuariosService.update(userId, { nombre: newName });
            setName(newName);
            setStatusMessage({ type: 'success', text: 'Nombre actualizado correctamente.' });
            
            setTimeout(() => {
                setStep(1); 
                setStatusMessage({ type: '', text: '' });
            }, 1000); 

        } catch (e) {
            console.error(e);
            setStatusMessage({ type: 'error', text: 'No se pudo actualizar el nombre. Intenta de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            {step === 1 && (
                <>
                    <div className="modal-header red">
                        DATOS PERSONALES
                    </div>
                </>
            )}
            
            {step === 4 && (
                <>
                    <div className="modal-header red">
                        CAMBIAR NOMBRE
                    </div>
                </>
            )}

            {(step === 1 || step === 4) && (
            <div className="modal-body">
                {/* Status Message Display */}
                {statusMessage.text && (
                    <div style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        width: '100%',
                        backgroundColor: statusMessage.type === 'success' ? '#fff' : '#fff',
                        color: statusMessage.type === 'success' ? '#27ae60' : '#c0392b',
                        border: `2px solid ${statusMessage.type === 'success' ? '#27ae60' : '#c0392b'}`,
                        fontWeight: '600'
                    }}>
                        {statusMessage.text}
                    </div>
                )}

                {step === 1 && (
                    <>
                         <div style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                backgroundColor: '#bdc3c7', 
                                margin: '0 auto 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem', fontWeight: '800' }}>
                                {name || 'Usuario'}
                            </h3>
                        </div>
                        
                        <div className="modal-actions" style={{ flexDirection: 'column', gap: '1rem' }}>
                             <button className="modal-btn btn-red" onClick={() => setStep(4)} style={{ width: '100%' }}>
                                CAMBIAR NOMBRE
                            </button>
                            <button className="modal-btn btn-gray" onClick={handleFinish} style={{ width: '100%' }}>
                                CERRAR
                            </button>
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        {/* Avatar small for context */}
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            backgroundColor: '#bdc3c7', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            marginBottom: '0.5rem'
                        }}>
                             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>

                        <div className="modal-input-group">
                            {/* Label removed as header says CAMBIAR NOMBRE, keeping it clean as per request "estilo simple" */}
                            <input
                                type="text"
                                className="modal-input"
                                value={newName}
                                onChange={(e) => {
                                    setNewName(e.target.value);
                                    setNameError('');
                                }}
                                placeholder="Escribe tu nuevo nombre"
                                disabled={loading}
                                style={{ textAlign: 'center', fontWeight: 'bold' }} 
                            />
                            {nameError && <span style={{ color: '#c0392b', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', textAlign: 'center' }}>{nameError}</span>}
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                className="modal-btn btn-gray" 
                                onClick={() => {
                                    setStep(1);
                                    setStatusMessage({ type: '', text: '' });
                                    setNewName(name); 
                                }}
                                disabled={loading}
                            >
                                CANCELAR
                            </button>
                            <button 
                                className="modal-btn btn-red" 
                                onClick={handleSaveName}
                                disabled={loading}
                                style={{ opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? 'GUARDANDO...' : 'GUARDAR'}
                            </button>
                        </div>
                    </>
                )}
            </div>
            )}

            {step === 2 && (
                <>
                    <div className="modal-header dark-red">
                        CAMBIO DE CLAVE
                    </div>
             
                    <div className="modal-body">
                        <p className="modal-text" style={{ fontSize: '0.9rem' }}>
                            Se le ha enviado un código a su correo electrónico
                        </p>
                        <div className="modal-input-group">
                            <label className="modal-label">CODIGO</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ingrese código"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setStep(3);
                                }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn btn-orange" onClick={() => setStep(1)}>
                                CANCELAR
                            </button>
                            <button className="modal-btn btn-dark" onClick={() => setStep(3)}>
                                VERIFICAR
                            </button>
                        </div>
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    <div className="modal-header dark-red">
                        CAMBIO DE CLAVE
                    </div>
                    <div className="modal-body">
                        <div className="modal-input-group">
                            <label className="modal-label">NUEVA CLAVE</label>
                            <input type="password" className="modal-input" />
                        </div>
                        <div className="modal-input-group">
                            <label className="modal-label">REPETIR CLAVE</label>
                            <input type="password" className="modal-input" />
                        </div>
                        <p className="modal-text" style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                            La clave debe ser alfanumérica y contener al menos un carácter especial.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn btn-orange" onClick={() => setStep(1)}>
                                CANCELAR
                            </button>
                            <button className="modal-btn btn-dark" onClick={handleFinish}>
                                TERMINAR
                            </button>
                        </div>
                    </div>
                </>
            )}
        </ModalWrapper>
    );
};

export default ProfileModal;
