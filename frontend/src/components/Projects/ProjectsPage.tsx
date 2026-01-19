import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectGrid from './ProjectGrid';
import ProjectForm from './ProjectForm';
import { type Project, type Technology } from '../../types';
import './Projects.css';
import proyectoService from '../../services/proyecto.service';
import techService from '../../services/tech.service';

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

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

    const handleSelect = (proj: Project) => {
        setSelectedProject(proj);
        setIsCreating(false);
    };

    const handleAdd = () => {
        setSelectedProject(null);
        setIsCreating(true);
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleSave = async (data: Omit<Project, 'idProyecto'>) => {
        try {
            if (selectedProject) {
                const updated = await proyectoService.update(selectedProject.idProyecto, data);
                setProjects(prev => prev.map(p => p.idProyecto === selectedProject.idProyecto ? updated : p));
            } else {
                const created = await proyectoService.create(data);
                setProjects(prev => [...prev, created]);
            }
            handleCancel();
        } catch (err: any) {
            alert('Error al guardar proyecto');
        }
    };

    const handleCancel = () => {
        setSelectedProject(null);
        setIsCreating(false);
    };

    const handleDelete = async () => {
        if (selectedProject) {
            try {
                await proyectoService.delete(selectedProject.idProyecto);
                setProjects(prev => prev.filter(p => p.idProyecto !== selectedProject.idProyecto));
                handleCancel();
            } catch (err: any) {
                alert('Error al eliminar proyecto');
            }
        }
    };

    const isSplitView = selectedProject !== null || isCreating;

    if (loading && projects.length === 0) return <div className="loading">Cargando...</div>;

    return (
        <div className={`projects-page ${isSplitView ? 'split-view' : ''}`}>
            {error && <div className="error-message">{error}</div>}
            <ProjectGrid
                projects={projects}
                onSelect={handleSelect}
                onAdd={handleAdd}
                selectedId={selectedProject?.idProyecto || null}
                onBack={handleBack}
                isSplitView={isSplitView}
            />

            {(isCreating || selectedProject) && (
                <ProjectForm
                    initialData={selectedProject}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    availableTechnologies={availableTechnologies}
                />
            )}
        </div>
    );
};

export default ProjectsPage;
