import React from 'react';
import './InfoCard.css';

const InfoCard = ({ label, value, icon: Icon, className = '' }) => {
  return (
    <div className={`info-card ${className}`}>
      <div className="info-card-content">
        <span className="info-card-label">{label}</span>
        <span className="info-card-value">{value}</span>
      </div>
      {Icon && (
        <div className="info-card-icon-wrapper">
          <Icon className="info-card-icon" size={20} />
        </div>
      )}
    </div>
  );
};

export default InfoCard;
