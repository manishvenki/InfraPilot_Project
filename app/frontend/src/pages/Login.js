import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, User, AlertTriangle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Short timeout to simulate authentication request latency
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        <div className="login-card-header">
          <div className="login-logo-circle">
            <Terminal size={32} className="login-logo-icon" />
          </div>
          <h1 className="login-title">InfraPilot</h1>
          <p className="login-subtitle">DevOps Automation Suite</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertTriangle size={16} className="error-alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User className="input-field-icon" size={16} />
              <input
                type="text"
                id="username"
                className="form-input has-icon"
                placeholder="Enter your username (admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-field-icon" size={16} />
              <input
                type="password"
                id="password"
                className="form-input has-icon"
                placeholder="Enter your password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-card-footer">
          <span>Enterprise Secure Connection</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
