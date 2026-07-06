import React from 'react';
import './MetricCard.css';

const MetricCard = ({ title, value, percentage, unit = '%', icon: Icon }) => {
  const percentageVal = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  // Set visual color depending on value threshold
  const getColorClass = (val) => {
    if (val >= 85) return 'status-critical';
    if (val >= 70) return 'status-warning';
    return 'status-normal';
  };

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <div className="metric-card-title-group">
          <span className="metric-title">{title}</span>
        </div>
        {Icon && (
          <div className="metric-card-icon-container">
            <Icon size={16} className="metric-icon" />
          </div>
        )}
      </div>

      <div className="metric-card-body">
        <div className="metric-value-display">
          <span className="metric-number">{value}</span>
          <span className="metric-unit">{unit}</span>
        </div>

        <div className="metric-meter-container">
          <div className="meter-track">
            <div 
              className={`meter-fill ${getColorClass(percentageVal)}`} 
              style={{ width: `${percentageVal}%` }}
            ></div>
          </div>
          <div className="meter-labels">
            <span>0%</span>
            <span className="current-meter-label">{percentageVal}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
