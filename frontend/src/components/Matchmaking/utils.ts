// Helper utility for status labels

export const getProjectStatusLabel = (status: 'P' | 'E' | 'F' | string): string => {
    switch (status) {
        case 'E': return 'En Espera';
        case 'P': return 'En Proceso';
        case 'F': return 'Finalizado';
        default: return status;
    }
};

export const getProjectStatusBadgeClass = (status: 'P' | 'E' | 'F' | string): string => {
    switch (status) {
        case 'E': return '#f59e0b'; // Amber/Yellow
        case 'P': return '#3b82f6'; // Blue
        case 'F': return '#10b981'; // Green
        default: return '#94a3b8'; // Grey
    }
};
