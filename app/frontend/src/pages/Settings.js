import React, { useState, useEffect } from 'react';
import { metaService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import InfoCard from '../components/InfoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Settings as SettingsIcon, 
  Layers, 
  Sun, 
  Moon, 
  Terminal, 
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Simulated form states
  const [localTheme, setLocalTheme] = useState('dark');
  const [refreshInterval, setRefreshInterval] = useState('5000');
  const [logLevel, setLogLevel] = useState('INFO');
  const [dockerControl, setDockerControl] = useState(true);
  const [k8sControl, setK8sControl] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await metaService.getSettings();
        setSettings(data);
        // Sync local states
        setRefreshInterval(String(data.auto_refresh_interval_ms));
        setLogLevel(data.log_level);
        setDockerControl(data.features.docker_control);
        setK8sControl(data.features.kubernetes_observability);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch settings from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  if (loading) {
    return <LoadingSpinner message="Checking client configurations..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suite Configuration</h1>
          <p className="page-subtitle">Configure environmental parameters and telemetry refresh thresholds.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Side: Form Controls */}
        <div className="settings-main">
          <form onSubmit={handleSave}>
            <DashboardCard 
              title="System Variables" 
              subtitle="Tweak API behavior and daemon refresh logs."
              headerActions={
                saveSuccess && (
                  <span className="save-toast-success">
                    <Check size={14} /> Saved Successfully
                  </span>
                )
              }
            >
              <div className="settings-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Active Theme</label>
                    <div className="theme-toggle-group">
                      <button 
                        type="button" 
                        className={`theme-btn ${localTheme === 'dark' ? 'active' : ''}`}
                        onClick={() => setLocalTheme('dark')}
                      >
                        <Moon size={14} />
                        <span>Dark Theme</span>
                      </button>
                      <button 
                        type="button" 
                        className={`theme-btn ${localTheme === 'light' ? 'active' : ''}`}
                        onClick={() => {
                          alert('Light theme placeholder. System locked to Grafana Dark UI.');
                          setLocalTheme('dark');
                        }}
                      >
                        <Sun size={14} />
                        <span>Light Theme</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="refresh-time">Auto Sync Interval</label>
                    <select 
                      id="refresh-time"
                      className="form-input" 
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(e.target.value)}
                    >
                      <option value="1000">1s (Real-time)</option>
                      <option value="3000">3s (Fast)</option>
                      <option value="5000">5s (Normal)</option>
                      <option value="10000">10s (Relaxed)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="log-lvl">Server Log Level</label>
                    <select 
                      id="log-lvl"
                      className="form-input"
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                    >
                      <option value="DEBUG">DEBUG</option>
                      <option value="INFO">INFO</option>
                      <option value="WARN">WARN</option>
                      <option value="ERROR">ERROR</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cluster Environment</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settings.environment} 
                      disabled 
                      title="Locked in production config."
                    />
                  </div>
                </div>

                <h4 className="settings-section-title">
                  <Sliders size={14} /> Feature Flags
                </h4>
                
                <div className="toggles-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <span className="toggle-label">Enable Docker Socket Controls</span>
                      <span className="toggle-desc">Allow restart/inspections on mock containers.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={dockerControl} 
                        onChange={(e) => setDockerControl(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <span className="toggle-label">Enable Kubernetes Observability</span>
                      <span className="toggle-desc">Expose tabbed data panels.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={k8sControl} 
                        onChange={(e) => setK8sControl(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-submit-btn-row">
                  <button type="submit" className="btn-save-settings">
                    Save Modifications
                  </button>
                </div>
              </div>
            </DashboardCard>
          </form>
        </div>

        {/* Right Side: Read-Only Info */}
        <div className="settings-sidebar">
          <InfoCard label="App Version" value={settings.version} icon={Terminal} />
          <InfoCard label="UI Theme" value={settings.theme} icon={Moon} />
          
          <DashboardCard title="Application Metadata" subtitle="Host hardware configurations.">
            <div className="metadata-specs">
              <div className="meta-spec-row">
                <span className="meta-spec-label">Host Port binding:</span>
                <span className="meta-spec-val font-mono">5000 (Flask) / 3000 (React)</span>
              </div>
              <div className="meta-spec-row">
                <span className="meta-spec-label">Database driver:</span>
                <span className="meta-spec-val font-mono">SQLite 3 (sqlite3.Row)</span>
              </div>
              <div className="meta-spec-row">
                <span className="meta-spec-label">CORS policy:</span>
                <span className="meta-spec-val highlight text-success font-mono">Access-Control-Allow-Origin: *</span>
              </div>
              <div className="meta-spec-row">
                <span className="meta-spec-label">Telemetry sockets:</span>
                <span className="meta-spec-val font-mono">HTTP Polling</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
