import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchGrid from './MatchGrid';
import MatchForm from './MatchForm';
import MatchmakingDetailsModal from './MatchmakingDetailsModal';
import './Matchmaking.css';
import matchmakingService from '../../services/matchmaking.service';
import cartaService from '../../services/carta.service';
import proyectoService from '../../services/proyecto.service';
import techService from '../../services/tech.service';
import { type Employee, type Project, type Technology, type Match } from '../../types';

const MatchmakingPage: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [technologies, setTechnologies] = useState<Technology[]>([]);

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
            const [matchesData, empData, projData, techData] = await Promise.all([
                matchmakingService.findAll(),
                cartaService.getAll(),
                proyectoService.getAll(),
                techService.getAll()
            ]);
            setMatches(matchesData);
            setEmployees(empData);
            setProjects(projData);
            setTechnologies(techData);
        } catch {
            setError('Error al cargar datos de matchmaking');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar este matchmaking? No borrará las cartas ni el proyecto.')) return;
        try {
            await matchmakingService.delete(id);
            setMatches(prev => prev.filter(m => m.idMatchmaking !== id));
        } catch {
            alert('Error al eliminar matchmaking');
        }
    };

    const handleAdd = () => {
        setIsCreating(true);
    };

    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleSave = () => {
        setIsCreating(false);
        loadData(); // Refresh list to show new match
    };

    const handleCancel = () => {
        setIsCreating(false);
    };

    const handleMatchSelect = (id: number) => {
        setSelectedMatchId(id);
    };

    const handleCloseDetails = () => {
        setSelectedMatchId(null);
    };

    return (
        <div className="match-page">
            {loading && <div className="loading">Cargando...</div>}
            {error && <div className="error-message">{error}</div>}

            <MatchGrid
                matches={matches}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onBack={handleBack}
                onSelect={handleMatchSelect}
            />

            {isCreating && (
                <MatchForm
                    projects={projects}
                    employees={employees}
                    technologies={technologies}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}

            <MatchmakingDetailsModal
                isOpen={!!selectedMatchId}
                matchId={selectedMatchId}
                onClose={handleCloseDetails}
            />
        </div>
    );
};

export default MatchmakingPage;
