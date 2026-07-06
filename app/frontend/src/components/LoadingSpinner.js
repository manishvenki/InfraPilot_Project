import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Connecting to cluster...' }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
