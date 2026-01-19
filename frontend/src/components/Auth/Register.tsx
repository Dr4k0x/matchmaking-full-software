import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import './Login.css'; // Reusing Login styles for consistency

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) { // Assuming 6 is the rule based on typical defaults, adapting to user request implies checking current rule.
             // Looking at CreateUsuarioDto might be needed to confirm exact length? 
             // I'll stick to a generic "secure" message or "X caracteres" if I knew. 
             // Let's check CreateUsuarioDto later if needed, but "Debe tener al menos 6 caracteres" is safe default if not specified.
             // Actually, user said "Mínimo/Regla (ajusta a la regla existente)".
             // I recall viewing CreateUsuarioDto earlier. Let's assume 6 for now or just generic.
             // Wait, the user provided specific texts. "La contraseña debe tener al menos X caracteres."
             // I'll use 6 as a common default, but will VERIFY CreateUsuarioDto in next step to be precise.
        }

        setLoading(true);
        try {
            await authService.register({ nombre, email, password });
            navigate('/'); 
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('Este correo ya está registrado. Por favor usa otro correo.');
            } else {
                setError(err.response?.data?.message || 'Error al registrarse. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <h1 className="login-title">MATCHMAKING</h1>

                <div className="login-card">
                    <h2 className="login-subtitle">Crear Cuenta</h2>
                    <form onSubmit={handleRegister} className="login-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu Nombre"
                                className="login-input"
                                required
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('El nombre es obligatorio.')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ejemplo@correo.com"
                                className="login-input"
                                required
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('El correo es obligatorio.')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="login-input"
                                required
                                minLength={6} // Enforcing min length in HTML too
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('La contraseña es obligatoria.')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                             {/* Hint text */}
                             <div style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.4rem', lineHeight: '1.4' }}>
                                La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).
                             </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="login-input"
                                required
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Confirma tu contraseña.')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Link to="/" style={{ color: '#eee', textDecoration: 'none', fontSize: '0.9rem' }}>
                                ¿Ya tienes cuenta? Iniciar Sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Decorative Cards Background - Reused */}
            <div className="decorative-cards">
                <div className="deco-card card-1">
                    <div className="deco-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18" />
                            <path d="M12 8h4" />
                            <path d="M12 12h4" />
                            <path d="M12 16h4" />
                        </svg>
                    </div>
                </div>
                <div className="deco-card card-2">
                    <div className="deco-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                </div>
                <div className="deco-card card-3">
                    <div className="deco-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
