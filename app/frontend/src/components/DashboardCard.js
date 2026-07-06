import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, subtitle, headerActions, children, className = '' }) => {
  return (
    <div className={`dashboard-card ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="card-header">
          <div className="card-header-titles">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerActions && <div className="card-actions">{headerActions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
