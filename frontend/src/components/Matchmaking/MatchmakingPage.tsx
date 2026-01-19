import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchGrid from './MatchGrid';
import MatchForm from './MatchForm';
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

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isEditing, setIsEditing] = useState(false);
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
        } catch (err: any) {
            setError('Error al cargar datos de matchmaking');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (match: Match) => {
        setSelectedMatch(match);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setSelectedMatch(null);
        setIsEditing(true);
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleSave = async (data: Omit<Match, 'id'>) => {
        try {
            // data contains idProyecto, cartasIds, score
            const created = await matchmakingService.create({
                idProyecto: data.idProyecto,
                cartasIds: data.cartasIds
            });
            // created should be the full Match object from backend
            setMatches(prev => [...prev, created]);
            setIsEditing(false);
        } catch (e) {
            alert("Error saving match");
        }
    };

    // The MatchForm implementation I see requires:
    // onSave, onCancel
    // It removed onUpdate, onDelete in my previous refactor? 
    // Wait, let me check MatchFormProps again from Step 116.
    // I removed the duplicate interface which had onUpdate, onDelete.
    // The ACTIVE interface (first one) ONLY has onSave, onCancel.
    // So I don't need to pass onUpdate, onDelete.

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedMatch(null);
    };

    return (
        <div className="match-page">
            {loading && <div className="loading">Cargando...</div>}
            {error && <div className="error-message">{error}</div>}

            <MatchGrid
                matches={matches}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onBack={handleBack}
            />

            {isEditing && (
                <MatchForm
                    initialData={selectedMatch}
                    projects={projects}
                    employees={employees} // Passed!
                    technologies={technologies} // Passed!
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default MatchmakingPage;
