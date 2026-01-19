import React, { useState, useEffect } from 'react';
import { type Project, type Technology, type NivelProyecto } from '../../types';
import './Projects.css';

interface ProjectFormProps {
    initialData?: Project | null;
    onSave: (proj: Omit<Project, 'idProyecto'>) => void;
    onCancel: () => void;
    onDelete: () => void;
    availableTechnologies: Technology[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel, onDelete, availableTechnologies }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [fechaFinalizacion, setFechaFinalizacion] = useState('');
    const [estado, setEstado] = useState<'P' | 'F' | 'E'>('P');

    // Flattened stats
    const [nivelColaborativo, setNivelColaborativo] = useState(1);
    const [nivelOrganizativo, setNivelOrganizativo] = useState(1);
    const [nivelVelocidadDesarrollo, setNivelVelocidadDesarrollo] = useState(1);

    const [nivelesProyecto, setNivelesProyecto] = useState<NivelProyecto[]>([]);

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setDescripcion(initialData.descripcion);
            setFechaCreacion(initialData.fechaCreacion);
            setFechaFinalizacion(initialData.fechaFinalizacion);
            setEstado(initialData.estado);
            setNivelColaborativo(initialData.nivelColaborativo);
            setNivelOrganizativo(initialData.nivelOrganizativo);
            setNivelVelocidadDesarrollo(initialData.nivelVelocidadDesarrollo);
            setNivelesProyecto(initialData.nivelesProyecto || []);
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
        }
    }, [initialData]);

    const handleStatChange = (statSetter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
        statSetter(prev => Math.min(10, Math.max(1, prev + delta)));
    };

    const handleAddTech = () => {
        // Find a tech that is not yet added
        const currentIds = nivelesProyecto.map(np => np.idTecnologia);
        const available = availableTechnologies.find(t => !currentIds.includes(t.idTecnologia));

        if (available) {
            setNivelesProyecto(prev => [...prev, { idTecnologia: available.idTecnologia, nivelRequerido: 1 }]);
        } else {
            alert("No hay más tecnologías disponibles.");
        }
    };

    const handleRemoveTech = (idTecnologia: number) => {
        setNivelesProyecto(prev => prev.filter(np => np.idTecnologia !== idTecnologia));
    };

    const handleSubmit = () => {
        onSave({
            nombre,
            descripcion,
            fechaCreacion,
            fechaFinalizacion,
            estado,
            nivelColaborativo,
            nivelOrganizativo,
            nivelVelocidadDesarrollo,
            nivelesProyecto
        });
    };

    return (
        <div className="proj-form-container">
            {/* Actions (Top Right) */}
            <div className="proj-actions">
                <button className="proj-btn proj-btn-save" onClick={handleSubmit}>GUARDAR</button>
                <button className="proj-btn proj-btn-cancel" onClick={onCancel}>CANCELAR</button>
                {initialData && (
                    <button className="proj-btn proj-btn-delete" onClick={onDelete} title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                )}
            </div>

            <div className="proj-form-content">
                {/* Col 1: General Info */}
                <div className="proj-col">
                    <div className="proj-col-title">INFORMACION</div>

                    <div className="proj-input-group">
                        <div className="proj-input-label">NOMBRE</div>
                        <input type="text" className="proj-input" value={nombre} onChange={e => setNombre(e.target.value)} />
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
                                <div className="proj-input-label">INICIO</div>
                                <input type="text" className="proj-input" value={fechaCreacion} onChange={e => setFechaCreacion(e.target.value)} placeholder="YYYY-MM-DD" />
                            </div>
                            <div className="proj-input-group">
                                <div className="proj-input-label">FINAL</div>
                                <input type="text" className="proj-input" value={fechaFinalizacion} onChange={e => setFechaFinalizacion(e.target.value)} placeholder="YYYY-MM-DD" />
                            </div>
                            <div className="proj-input-group">
                                <div className="proj-input-label">ESTADO</div>
                                <select className="proj-input" value={estado} onChange={e => setEstado(e.target.value as any)}>
                                    <option value="P">En Proceso</option>
                                    <option value="F">Finalizado</option>
                                    <option value="E">En Espera</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <textarea
                        className="proj-textarea"
                        placeholder="Descripción del proyecto..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                    />
                </div>

                {/* Col 2: Stats */}
                <div className="proj-col">
                    <div className="proj-col-title">ESTADISTICAS</div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">COLABORACION</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, -1)}>&lt;</button>
                            <span>Lv {nivelColaborativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelColaborativo, 1)}>&gt;</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">ORGANIZACION</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, -1)}>&lt;</button>
                            <span>Lv {nivelOrganizativo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelOrganizativo, 1)}>&gt;</button>
                        </div>
                    </div>

                    <div className="proj-stepper-container">
                        <div className="proj-stepper-label">VELOCIDAD DEV</div>
                        <div className="proj-stepper-controls">
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, -1)}>&lt;</button>
                            <span>Lv {nivelVelocidadDesarrollo}</span>
                            <button className="proj-stepper-btn" onClick={() => handleStatChange(setNivelVelocidadDesarrollo, 1)}>&gt;</button>
                        </div>
                    </div>
                </div>

                {/* Col 3: Stack */}
                <div className="proj-col">
                    <div className="proj-col-title">STACK TECNOLOGICO</div>
                    <div className="proj-skills-list">
                        {nivelesProyecto.map(np => (
                            <div key={np.idTecnologia} className="proj-skill-icon" title={`Tech ID: ${np.idTecnologia}`} onClick={() => handleRemoveTech(np.idTecnologia)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '60%', height: '60%' }}>
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                            </div>
                        ))}
                        <button className="proj-stepper-btn" onClick={handleAddTech} style={{ width: '40px', height: '40px' }}>+</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;
