import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import SettingsMenu from '../Shared/SettingsMenu';
import ProfileModal from '../Modals/ProfileModal';
import LogoutModal from '../Modals/LogoutModal';
import './Home.css';
import authService from '../../services/auth.service';

// Images
import projectsImg from '../../assets/images/index/proyectos.png';
import employeesImg from '../../assets/images/index/carta-empleados.png';
import technologiesImg from '../../assets/images/index/tecnologias.png';
import matchmakingImg from '../../assets/images/index/matchmaking.png';

interface DashboardOption {
    id: string;
    label: string;
    color: string;
    image: string;
}

const dashboardOptions: DashboardOption[] = [
    { id: 'projects', label: 'PROYECTOS', color: 'var(--color-purple)', image: projectsImg },
    { id: 'employees', label: 'EMPLEADOS', color: 'var(--color-green)', image: employeesImg },
    { id: 'technologies', label: 'TECNOLOGIAS', color: 'var(--color-blue)', image: technologiesImg },
    { id: 'matchmaking', label: 'MATCHMAKING', color: 'var(--color-yellow)', image: matchmakingImg },
];

const DashboardGrid: React.FC = () => {
    const [activeModal, setActiveModal] = React.useState<'none' | 'profile' | 'logout'>('none');
    const navigate = useNavigate();

    const handleCardClick = (id: string) => {
        if (id === 'technologies') {
            navigate('/technologies');
        } else if (id === 'employees') {
            navigate('/employees');
        } else if (id === 'projects') {
            navigate('/projects');
        } else if (id === 'matchmaking') {
            navigate('/matchmaking');
        } else {
            console.log(`Clicked ${id}`);
        }
    };

    return (
        <div className="dashboard-container">
            <SettingsMenu
                onProfileClick={() => setActiveModal('profile')}
                onLogoutClick={() => setActiveModal('logout')}
            />

            <div className="dashboard-grid">
                {dashboardOptions.map((option) => (
                    <DashboardCard
                        key={option.id}
                        color={option.color}
                        label={option.label}
                        image={option.image}
                        onClick={() => handleCardClick(option.id)}
                    />
                ))}
            </div>

            {activeModal === 'profile' && (
                <ProfileModal onClose={() => setActiveModal('none')} />
            )}

            {activeModal === 'logout' && (
                <LogoutModal
                    onClose={() => setActiveModal('none')}
                    onLogout={() => {
                        authService.logout();
                        navigate('/');
                        setActiveModal('none');
                    }}
                />
            )}
        </div>
    );
};

export default DashboardGrid;
