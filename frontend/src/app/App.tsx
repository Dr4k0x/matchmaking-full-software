import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardGrid from '../components/Home/DashboardGrid';
import TechnologiesPage from '../components/Technologies/TechnologiesPage';
import EmployeesPage from '../components/Employees/EmployeesPage';
import ProjectsPage from '../components/Projects/ProjectsPage';
import MatchmakingPage from '../components/Matchmaking/MatchmakingPage';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardGrid />} />
        <Route path="/technologies" element={<TechnologiesPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/matchmaking" element={<MatchmakingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
