import React from 'react';

interface DashboardCardProps {
    color: string;
    label: string;
    image?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ color, label, image, icon, onClick }) => {
    return (
        <div
            className="dashboard-card"
            style={{ '--card-color': color } as React.CSSProperties}
            onClick={onClick}
        >
            <div className="card-content">
                <div className="card-icon">
                    {image ? (
                        <img src={image} alt={label} className="dashboard-card-image" />
                    ) : (
                        icon || <span>ICON</span>
                    )}
                </div>
                <span className="card-label">{label}</span>
            </div>
        </div>
    );
};

export default DashboardCard;
