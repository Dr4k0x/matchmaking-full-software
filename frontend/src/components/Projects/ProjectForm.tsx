import React, { useState, useEffect, useRef } from 'react';

import { type Project, type Technology, type NivelProyecto } from '../../types/index';
import './Projects.css';
import ErrorModal from '../Modals/ErrorModal';

interface ProjectFormProps {
    initialData?: Project | null;
    onSave: (proj: Omit<Project, 'idProyecto'> | Partial<Omit<Project, 'idProyecto'>> & { nivelesProyecto?: Array<{ idTecnologia: number; nivelRequerido: number }> }) => void;
    onCancel: () => void;
    onDelete: () => void;
    onManageTech: (currentData: Omit<Project, 'idProyecto'> & { idProyecto?: number }) => void;
    availableTechnologies: Technology[];
    onError?: (title: string, message: string | string[]) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel, onDelete, onManageTech, availableTechnologies, onError }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [fechaFinalizacion, setFechaFinalizacion] = useState('');
    const [estado, setEstado] = useState<'P' | 'F' | 'E'>('P');

    const [nivelColaborativo, setNivelColaborativo] = useState(1);
    const [nivelOrganizativo, setNivelOrganizativo] = useState(1);
    const [nivelVelocidadDesarrollo, setNivelVelocidadDesarrollo] = useState(1);

    const [nivelesProyecto, setNivelesProyecto] = useState<NivelProyecto[]>([]);
    const [error, setError] = useState<string | string[] | null>(null);
    const [errorTitle, setErrorTitle] = useState('Error');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLocked = !!initialData?.matchmaking;


    const fechaCreacionRef = useRef<HTMLInputElement>(null);
    const fechaFinalizacionRef = useRef<HTMLInputElement>(null);
    const initialValuesRef = useRef<{
        nombre: string;
        descripcion: string;
        fechaCreacion: string;
        fechaFinalizacion: string;
        estado: 'P' | 'F' | 'E';
        nivelColaborativo: number;
        nivelOrganizativo: number;
        nivelVelocidadDesarrollo: number;
        nivelesProyecto: NivelProyecto[];
    } | null>(null);

    useEffect(() => {
        if (initialData) {
            const fechaCreacionStr = initialData.fechaCreacion ? initialData.fechaCreacion.split('T')[0] : '';
            const fechaFinalizacionStr = initialData.fechaFinalizacion ? initialData.fechaFinalizacion.split('T')[0] : '';
            const validEstado = (['P', 'F', 'E'].includes(initialData.estado) ? initialData.estado : 'P') as 'P' | 'F' | 'E';

            setNombre(initialData.nombre);
            setDescripcion(initialData.descripcion);
            setFechaCreacion(fechaCreacionStr);
            setFechaFinalizacion(fechaFinalizacionStr);
            setEstado(validEstado);
            setNivelColaborativo(initialData.nivelColaborativo);
            setNivelOrganizativo(initialData.nivelOrganizativo);
            setNivelVelocidadDesarrollo(initialData.nivelVelocidadDesarrollo);
            setNivelesProyecto(initialData.nivelesProyecto || []);

            // Guardar valores iniciales para comparación
            initialValuesRef.current = {
                nombre: initialData.nombre,
                descripcion: initialData.descripcion,
                fechaCreacion: fechaCreacionStr,
                fechaFinalizacion: fechaFinalizacionStr,
                estado: validEstado,
                nivelColaborativo: initialData.nivelColaborativo,
                nivelOrganizativo: initialData.nivelOrganizativo,
                nivelVelocidadDesarrollo: initialData.nivelVelocidadDesarrollo,
                nivelesProyecto: initialData.nivelesProyecto || []
            };
        } else {
            setNombre('');
            setDescripcion('');
            setFechaCreacion('');
            setFechaFinalizacion('');
            setEstado('P');
            setNivelColaborativo(1);
            setNivelOrganizativo(1);
            setNivelVelocidadDesarrollo(1);
            setNivelesProyecto([]);
            initialValuesRef.current = null;
        }
    }, [initialData]);

    const handleStatChange = (statSetter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
        statSetter(prev => Math.min(10, Math.max(1, prev + delta)));
    };

    const handleLevelChange = (idTecnologia: number, delta: number) => {
        setNivelesProyecto(prev => prev.map(np => {
            if (np.idTecnologia === idTecnologia) {
                return { ...np, nivelRequerido: Math.min(10, Math.max(1, np.nivelRequerido + delta)) };
            }
            return np;
        }));
    };

    const handleRemoveTech = (idTecnologia: number) => {
        setNivelesProyecto(prev => prev.filter(np => np.idTecnologia !== idTecnologia));
    };

    const buildLockedPayload = () => ({ estado });

    const arraysEqual = (a: NivelProyecto[], b: NivelProyecto[]): boolean => {
        if (a.length !== b.length) return false;
        const aSorted = [...a].sort((x, y) => x.idTecnologia - y.idTecnologia);
        const bSorted = [...b].sort((x, y) => x.idTecnologia - y.idTecnologia);
        return aSorted.every((item, index) =>
            item.idTecnologia === bSorted[index].idTecnologia &&
            item.nivelRequerido === bSorted[index].nivelRequerido
        );
    };

    const getChangedFields = () => {
        if (!initialValuesRef.current) {
            // Si no hay valores iniciales, es creación, enviar todo
            return {
                nombre,
                descripcion,
                fechaCreacion: fechaCreacion || undefined,
                fechaFinalizacion: fechaFinalizacion || undefined,
                estado,
                nivelColaborativo,
                nivelOrganizativo,
                nivelVelocidadDesarrollo,
                nivelesProyecto: nivelesProyecto.map(np => ({
                    idTecnologia: np.idTecnologia,
                    nivelRequerido: np.nivelRequerido
                }))
            };
        }

        const initial = initialValuesRef.current;
        const payload: Partial<Omit<Project, 'idProyecto'>> & { nivelesProyecto?: Array<{ idTecnologia: number; nivelRequerido: number }> } = {};

        if (nombre !== initial.nombre) payload.nombre = nombre;
        if (descripcion !== initial.descripcion) payload.descripcion = descripcion;
        if (fechaCreacion !== initial.fechaCreacion) {
            payload.fechaCreacion = fechaCreacion || undefined;
        }
        if (fechaFinalizacion !== initial.fechaFinalizacion) {
            payload.fechaFinalizacion = fechaFinalizacion || undefined;
        }
        if (estado !== initial.estado) payload.estado = estado;
        if (nivelColaborativo !== initial.nivelColaborativo) payload.nivelColaborativo = nivelColaborativo;
        if (nivelOrganizativo !== initial.nivelOrganizativo) payload.nivelOrganizativo = nivelOrganizativo;
        if (nivelVelocidadDesarrollo !== initial.nivelVelocidadDesarrollo) {
            payload.nivelVelocidadDesarrollo = nivelVelocidadDesarrollo;
        }

        const currentNiveles = nivelesProyecto.map(np => ({
            idTecnologia: np.idTecnologia,
            nivelRequerido: np.nivelRequerido
        }));
        const initialNiveles = initial.nivelesProyecto.map(np => ({
            idTecnologia: np.idTecnologia,
            nivelRequerido: np.nivelRequerido
        }));

        if (!arraysEqual(currentNiveles, initialNiveles)) {
            payload.nivelesProyecto = currentNiveles;
        }

        return payload;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        let payload: Partial<Omit<Project, 'idProyecto'>> & { nivelesProyecto?: Array<{ idTecnologia: number; nivelRequerido: number }> };
        if (isLocked) {
            payload = buildLockedPayload();
        } else {
            payload = getChangedFields();
        }

        if (import.meta.env.DEV) {
            console.log('ProjectForm Payload:', initialData ? 'UPDATE' : 'CREATE', payload);
        }

        setIsSubmitting(true);
        try {
            await onSave(payload);
        } catch (err: unknown) {
            console.error('Error saving project:', err);
            const backendMessage = (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message;
            const message = backendMessage || 'Ocurrió un error al guardar el proyecto.';
            const title = (err as { response?: { status?: number } })?.response?.status === 409 ? 'ACCIÓN NO PERMITIDA' : 'ERROR AL GUARDAR';

            if (onError) {
                // If parent handles errors, let it show the modal
                onError(title, message);
            } else {
                // Fallback to local modal
                setErrorTitle(title);
                setError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleClose = () => {
        onCancel();
    };

    const getTechName = (id: number) => {
        return availableTechnologies.find(t => t.idTecnologia === id)?.nombre || `Tech ${id}`;
    };

    const openCalendar = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (!ref.current) return;


        // Strategy: showPicker if available, fallback to focus + click
        if (typeof ref.current.showPicker === 'function') {
            try {
                ref.current.showPicker();
            } catch (error) {
                console.warn('showPicker failed, falling back', error);
                ref.current.focus();
                ref.current.click();
            }
        } else {
            ref.current.focus();
            ref.current.click();
        }
    };


    return (
        <div className="tech-form-container" onClick={e => e.stopPropagation()}>
            {/* Actions Header */}
            <div className="proj-actions">
                {isLocked && (
                    <div className="proj-lock-notice" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e67e22', fontWeight: 800, fontSize: '0.8rem' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        PROYECTO EN MATCHMAKING (LIMITADO)
                    </div>
                )}
                {initialData && !isLocked && (
                    <button className="proj-btn proj-btn-delete" onClick={onDelete} title="Eliminar Proyecto" type="button">
                        ELIMINAR
                    </button>
                )}
                <button className="proj-btn proj-btn-cancel" onClick={handleClose} type="button" disabled={isSubmitting}>CANCELAR</button>
                <button className="proj-btn proj-btn-save" onClick={handleSubmit} type="button" disabled={isSubmitting}>
                    {isSubmitting ? 'GUARDANDO...' : (initialData ? 'ACTUALIZAR PROYECTO' : 'GUARDAR PROYECTO')}
                </button>
            </div>

            <div className="proj-form-content">
                {/* Col 1: General Info */}
                <div className="proj-col">
                    <div className="proj-col-title">Información General</div>

                    <div className="proj-input-group">
                        <div className="proj-input-label">Nombre del Proyecto</div>
                        <input type="text" className="proj-input" placeholder="Ej: Rediseño E-commerce" value={nombre} onChange={e => setNombre(e.target.value)} disabled={isLocked} />
                    </div>

                    <div className="proj-general-layout">
                        <div className="proj-blueprint-img">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '60%', height: '60%' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        </div>
                        <div className="proj-inputs-stack">
                            <div className="proj-input-group">
                                <div className="proj-input-label">Fecha Inicio</div>
                                <div className="proj-date-input-wrapper">
                                    <input
                                        ref={fechaCreacionRef}
                                        type="date"
                                        className="proj-input"
                                        value={fechaCreacion}
                                        onChange={e => setFechaCreacion(e.target.value)}
                                        disabled={isLocked}
                                    />
                                    <button
                                        type="button"
                                        className="proj-calendar-btn"
                                        onClick={() => openCalendar(fechaCreacionRef)}
                                        aria-label="Abrir calendario de fecha inicio"
                                        disabled={isLocked}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="proj-input-group">
                                <div className="proj-input-label">Fecha Fin</div>
                                <div className="proj-date-input-wrapper">
                                    <input
                                        ref={fechaFinalizacionRef}
                                        type="date"
                                        className="proj-input"
                                        value={fechaFinalizacion}
                                        onChange={e => setFechaFinalizacion(e.target.value)}
                                        disabled={isLocked}
                                    />
                                    <button
                                        type="button"
                                        className="proj-calendar-btn"
                                        onClick={() => openCalendar(fechaFinalizacionRef)}
                                        aria-label="Abrir calendario de fecha fin"
                                        disabled={isLocked}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="proj-input-group">
                        <div className="proj-input-label">Estado</div>
                        <select className="proj-input" value={estado} onChange={e => setEstado(e.target.value as 'P' | 'F' | 'E')}>
                            <option value="P">🟠 En Proceso</option>
                            <option value="F">🟢 Finalizado</option>
                            <option value="E">⚪ En Espera</option>
                        </select>
                    </div>

                    <textarea
                        className="proj-textarea"
                        placeholder="Describe el objetivo y alcance del proyecto..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        disabled={isLocked}
                    />
                </div>

                {/* Col 2: Exigencias (Stats) */}
                <div className="proj-col">
                    <div className="proj-col-title">Exigencias del Proyecto</div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">COLABORACIÓN</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, -1)} type="button" disabled={isLocked || nivelColaborativo <= 1}>-</button>
                            <span style={{ fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center' }}>Lv {nivelColaborativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, 1)} type="button" disabled={isLocked || nivelColaborativo >= 10}>+</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">ORGANIZACIÓN</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, -1)} type="button" disabled={isLocked || nivelOrganizativo <= 1}>-</button>
                            <span style={{ fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center' }}>Lv {nivelOrganizativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, 1)} type="button" disabled={isLocked || nivelOrganizativo >= 10}>+</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">VELOCIDAD DEV</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, -1)} type="button" disabled={isLocked || nivelVelocidadDesarrollo <= 1}>-</button>
                            <span style={{ fontWeight: 900, color: '#3498db', minWidth: '40px', textAlign: 'center' }}>Lv {nivelVelocidadDesarrollo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, 1)} type="button" disabled={isLocked || nivelVelocidadDesarrollo >= 10}>+</button>
                        </div>
                    </div>
                </div>

                {/* Col 3: Stack Tecnológico (Estilo Employees) */}
                <div className="proj-col">
                    <div className="proj-skills-header-row">
                        <div className="proj-col-title" style={{ margin: 0 }}>Stack Tecnológico</div>
                        <button className="proj-add-skill-btn-mini" onClick={() => onManageTech({
                            nombre,
                            descripcion,
                            fechaCreacion,
                            fechaFinalizacion,
                            estado,
                            nivelColaborativo,
                            nivelOrganizativo,
                            nivelVelocidadDesarrollo,
                            nivelesProyecto,
                            idProyecto: initialData?.idProyecto
                        })} type="button" title="Gestionar Tecnologías" disabled={isLocked}>+</button>
                    </div>

                    <div className="proj-tech-list-scroll">
                        {nivelesProyecto.map(np => (
                            <div key={np.idTecnologia} className="proj-tech-item-row">
                                <div className="proj-tech-item-name">{getTechName(np.idTecnologia)}</div>

                                <div className="proj-stepper-controls-mini">
                                    <button className="proj-stepper-btn-small" onClick={() => handleLevelChange(np.idTecnologia, -1)} type="button" disabled={isLocked || np.nivelRequerido <= 1}>-</button>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>{np.nivelRequerido}</span>
                                    <button className="proj-stepper-btn-small" onClick={() => handleLevelChange(np.idTecnologia, 1)} type="button" disabled={isLocked || np.nivelRequerido >= 10}>+</button>
                                </div>

                                <button className="proj-skill-delete-btn" onClick={() => handleRemoveTech(np.idTecnologia)} type="button" title="Quitar tecnología" disabled={isLocked}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {nivelesProyecto.length === 0 && (
                            <div className="proj-empty-tech">
                                No se han seleccionado tecnologías
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <ErrorModal
                isOpen={!!error}
                title={errorTitle}
                message={error || ''}
                onClose={() => setError(null)}
            />
        </div>
    );
};


export default ProjectForm;
