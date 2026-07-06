import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <AlertCircle size={64} className="not-found-icon" />
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Endpoint Not Found</h2>
        <p className="not-found-text">
          The requested DevOps console page does not exist or has been moved in the route manager.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-back-home">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
