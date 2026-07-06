import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (statusStr) => {
    if (!statusStr) return 'badge-info';
    const s = statusStr.toUpperCase();
    
    switch (s) {
      case 'SUCCESS':
      case 'RUNNING':
      case 'HEALTHY':
      case 'ACTIVE':
      case 'READY':
      case 'ONLINE':
        return 'badge-success';
      case 'FAILED':
      case 'EXITED':
      case 'DANGER':
      case 'ERROR':
      case 'OFFLINE':
      case 'UNHEALTHY':
        return 'badge-danger';
      case 'WARNING':
      case 'PENDING':
      case 'RESTARTING':
      case 'DEGRADED':
        return 'badge-warning';
      case 'IN_PROGRESS':
      case 'INFO':
      default:
        return 'badge-info';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      <span className="badge-dot"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
