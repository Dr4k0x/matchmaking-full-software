import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectGrid from './ProjectGrid';
import ProjectForm from './ProjectForm';
import { type Project, type Technology, type NivelProyecto } from '../../types/index';
import './Projects.css';
import proyectoService from '../../services/proyecto.service';
import techService from '../../services/tech.service';


interface NavigationState {
    selectedTechs?: Technology[];
}

interface ProjectDraft {
    isCreating: boolean;
    project: Omit<Project, 'idProyecto'> & { idProyecto?: number };
}

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const [draftNonce] = useState(() => (location.state as any)?.draftNonce || Date.now().toString());

    // Initial Load & Rehydration
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (availableTechnologies.length > 0) {
            checkPickerReturn();
        }
    }, [availableTechnologies]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projData, techData] = await Promise.all([
                proyectoService.getAll(),
                techService.getAll()
            ]);
            setProjects(projData);
            setAvailableTechnologies(techData);
        } catch (err: any) {
            setError('Error al cargar datos de proyectos');
        } finally {
            setLoading(false);
        }
    };

    const checkPickerReturn = () => {
        const state = location.state as NavigationState & { restoredFromSelection?: boolean; selectedTechs?: Technology[] } | null;
        
        // Prepare Keys
        const currentId = selectedProject?.idProyecto || (state as any)?.idProyecto;
        const idToken = !currentId ? `new:${draftNonce}` : currentId.toString();
        const draftKey = `PROJECT_DRAFT_CONTEXT:${idToken}`;
        const selectionKey = `TECH_SELECTION:projects:${idToken}`;

        const draftStr = sessionStorage.getItem(draftKey);
        const selectionStr = sessionStorage.getItem(selectionKey);

        if (state?.selectedTechs || draftStr || selectionStr) {
            let parsedDraft: any = null;
            let selectionData: any = null;

            // Read Draft with TTL
            if (draftStr) {
                try {
                    const envelope = JSON.parse(draftStr);
                    const now = Date.now();
                    if (envelope.ts && envelope.ttlMs && (envelope.ts + envelope.ttlMs > now)) {
                        parsedDraft = envelope.data;
                    } else {
                        sessionStorage.removeItem(draftKey);
                    }
                } catch (e) {}
            }

            // Read Selection with TTL
            if (selectionStr) {
                try {
                    const envelope = JSON.parse(selectionStr);
                    const now = Date.now();
                    if (envelope.ts && envelope.ttlMs && (envelope.ts + envelope.ttlMs > now)) {
                        selectionData = envelope.data;
                    } else {
                        sessionStorage.removeItem(selectionKey);
                    }
                } catch (e) {}
            }

            if (parsedDraft) {
                const baseProject = parsedDraft.project as Project;
                
                setIsCreating(parsedDraft.isCreating);
                setShowModal(true);

                // Merge Selection (State has priority over Storage)
                const finalSelectedTechs = state?.selectedTechs || selectionData?.selectedTechs;

                if (finalSelectedTechs) {
                    const currentLevels = baseProject.nivelesProyecto || [];
                    
                    const mergedLevels: NivelProyecto[] = finalSelectedTechs.map((tech: Technology) => {
                        const existing = currentLevels.find((cl) => cl.idTecnologia === tech.idTecnologia);
                        return {
                            idTecnologia: tech.idTecnologia,
                            nivelRequerido: existing ? existing.nivelRequerido : 1,
                            tecnologia: tech 
                        };
                    });

                    const projectData: Project = {
                        ...baseProject,
                        nivelesProyecto: mergedLevels
                    };
                    
                    setSelectedProject(projectData);
                } else {
                    setSelectedProject(baseProject);
                }
                
                // Note: Cleanup is handled in handleCancel (handleClose)
                window.history.replaceState({ ...state, restoredFromSelection: true }, document.title);
            }
        }
    };

    const handleSelect = (proj: Project) => {
        setSelectedProject(proj);
        setIsCreating(false);
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedProject(null);
        setIsCreating(true);
        setShowModal(true);
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleCancel = () => {
        const idToken = isCreating ? `new:${draftNonce}` : selectedProject?.idProyecto?.toString();
        if (idToken) {
            sessionStorage.removeItem(`PROJECT_DRAFT_CONTEXT:${idToken}`);
            sessionStorage.removeItem(`TECH_SELECTION:projects:${idToken}`);
        }
        setSelectedProject(null);
        setIsCreating(false);
        setShowModal(false);
    };

    const handleManageTech = (currentData: Omit<Project, 'idProyecto'> & { idProyecto?: number }) => {
        const idToken = isCreating ? `new:${draftNonce}` : currentData.idProyecto?.toString();
        const draftKey = `PROJECT_DRAFT_CONTEXT:${idToken}`;
        const selectionKey = `TECH_SELECTION:projects:${idToken}`;

        // Save draft with TTL
        const draft: ProjectDraft = {
            isCreating,
            project: currentData
        };
        const envelope = {
            data: draft,
            ts: Date.now(),
            ttlMs: 30 * 60 * 1000 // 30 min
        };
        sessionStorage.setItem(draftKey, JSON.stringify(envelope));

        // Navigate to picker
        const selectedIds = (currentData.nivelesProyecto || []).map(s => s.idTecnologia);
        navigate('/technologies?mode=select', { 
            state: { 
                origin: 'projects',
                returnPath: '/projects',
                draftKey,
                selectionKey,
                draftNonce,
                isCreating,
                idProyecto: currentData.idProyecto,
                selectedIds 
            } 
        });
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedProject?.idProyecto) {
                const updated = await proyectoService.update(selectedProject.idProyecto, data);
                setProjects(prev => prev.map(p => p.idProyecto === selectedProject.idProyecto ? updated : p));
            } else {
                await proyectoService.create(data);
                await loadData(); 
            }
            handleCancel();
        } catch (err: any) {
            alert('Error al guardar proyecto: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async () => {
        if (!selectedProject?.idProyecto) return;
        if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;

        try {
            await proyectoService.delete(selectedProject.idProyecto);
            setProjects(prev => prev.filter(p => p.idProyecto !== selectedProject.idProyecto));
            handleCancel();
        } catch (err: any) {
            alert('Error al eliminar proyecto');
        }
    };

    // ESC Key Support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showModal) handleCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    if (loading && projects.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className="projects-page">
            {error && <div className="error-message">{error}</div>}
            
            <ProjectGrid
                projects={projects}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedProject?.idProyecto || null}
                onBack={handleBack}
            />

            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <ProjectForm
                        initialData={selectedProject}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                        onManageTech={handleManageTech}
                        availableTechnologies={availableTechnologies}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
