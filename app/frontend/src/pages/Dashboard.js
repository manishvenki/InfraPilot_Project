import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, deploymentsService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import MetricCard from '../components/MetricCard';
import InfoCard from '../components/InfoCard';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  Play, 
  Server, 
  Container, 
  Layers, 
  Clock, 
  ArrowRight,
  GitBranch,
  Terminal,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await dashboardService.getData();
      setData(response);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not connect to Flask API backend. Please ensure the backend server is running on port 5000.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    
    // Auto-refresh metrics every 5 seconds
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleTriggerDeploy = async () => {
    setActionLoading(true);
    try {
      await deploymentsService.deployLatest({
        version: `v1.2.${Math.floor(Math.random() * 10) + 1}`,
        branch: 'main',
        triggered_by: 'Dashboard Quick Action'
      });
      // Refresh data
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Error triggering deployment:', err);
      alert('Failed to trigger deployment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying cluster telemetry and deployment records..." />;
  }

  if (error) {
    return (
      <div className="page-container dashboard-error-state">
        <div className="error-card">
          <AlertOctagon size={48} className="error-card-icon" />
          <h2>Connection Failure</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => fetchDashboardData(true)}>
              <RefreshCw size={16} />
              Retry Connection
            </button>
            <button className="btn-secondary" onClick={() => navigate('/about')}>
              View Tech Stack
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { system, latest_deployment, recent_history } = data;

  const buildHeaders = ['Build #', 'Version', 'Branch', 'Commit', 'Triggered By', 'Duration', 'Deployed At', 'Status'];

  const renderBuildRow = (build, idx) => (
    <tr key={build.id || idx} className="table-row">
      <td className="table-cell bold">{build.build_number}</td>
      <td className="table-cell">{build.version}</td>
      <td className="table-cell">
        <div className="branch-display">
          <GitBranch size={13} className="branch-icon" />
          <span>{build.branch}</span>
        </div>
      </td>
      <td className="table-cell code">{build.commit_id}</td>
      <td className="table-cell">{build.triggered_by}</td>
      <td className="table-cell">{build.duration}</td>
      <td className="table-cell">{build.deployment_time}</td>
      <td className="table-cell">
        <StatusBadge status={build.status} />
      </td>
    </tr>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Infrastructure Overview</h1>
          <p className="page-subtitle">Real-time status of connected nodes, clusters, and CI/CD pipelines.</p>
        </div>
        <button 
          onClick={() => fetchDashboardData(true)} 
          className="btn-refresh" 
          disabled={actionLoading}
        >
          <RefreshCw size={14} className={actionLoading ? 'spin' : ''} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <MetricCard 
          title="CPU Core Load" 
          value={system.cpu_usage} 
          percentage={system.cpu_usage} 
          icon={Cpu} 
        />
        <MetricCard 
          title="Memory Allocation" 
          value={system.memory_usage} 
          percentage={system.memory_usage} 
          icon={Activity} 
        />
        <MetricCard 
          title="Disk Capacity" 
          value={system.disk_usage} 
          percentage={system.disk_usage} 
          icon={HardDrive} 
        />
      </div>

      {/* Info Cards Grid */}
      <div className="info-grid">
        <InfoCard label="App Status" value={system.app_health} icon={ShieldCheck} />
        <InfoCard label="Running Containers" value={system.running_containers} icon={Container} />
        <InfoCard label="K8s Pods Active" value={system.pods_running} icon={Layers} />
        <InfoCard label="Cluster Environment" value={system.environment} icon={Server} />
        <InfoCard label="Current Version" value={system.current_version} icon={Terminal} />
        <InfoCard label="Build Number" value={system.build_number} icon={Clock} />
      </div>

      {/* Main Layout Split */}
      <div className="dashboard-layout-split">
        {/* Left Side: Recent Builds */}
        <div className="split-left">
          <DashboardCard 
            title="Recent Build History" 
            subtitle="Log of latest continuous integration pipeline outcomes."
            headerActions={
              <button onClick={() => navigate('/deployments')} className="btn-text">
                <span>View All History</span>
                <ArrowRight size={14} />
              </button>
            }
          >
            <TableComponent 
              headers={buildHeaders} 
              data={recent_history} 
              renderRow={renderBuildRow} 
              emptyMessage="No build logs available in the SQLite database."
            />
          </DashboardCard>
        </div>

        {/* Right Side: Quick Actions & Status */}
        <div className="split-right">
          <DashboardCard title="Quick Pipeline Actions" subtitle="Trigger automation scripts manually.">
            <div className="quick-actions-list">
              <button 
                onClick={handleTriggerDeploy} 
                className="action-card-btn" 
                disabled={actionLoading}
              >
                <div className="action-icon-box deploy">
                  <Play size={18} />
                </div>
                <div className="action-details">
                  <span className="action-title">Deploy Latest Code</span>
                  <span className="action-desc">Pushes the latest repository build.</span>
                </div>
              </button>

              <button onClick={() => navigate('/docker')} className="action-card-btn">
                <div className="action-icon-box docker">
                  <Container size={18} />
                </div>
                <div className="action-details">
                  <span className="action-title">Inspect Docker Engine</span>
                  <span className="action-desc">Inspect list of running containers.</span>
                </div>
              </button>

              <button onClick={() => navigate('/kubernetes')} className="action-card-btn">
                <div className="action-icon-box k8s">
                  <Layers size={18} />
                </div>
                <div className="action-details">
                  <span className="action-title">Manage Kubernetes Pods</span>
                  <span className="action-desc">Check active namespaces and cluster nodes.</span>
                </div>
              </button>
            </div>
          </DashboardCard>

          {/* Latest Deployment Summary Card */}
          <DashboardCard title="Active Version State">
            {latest_deployment ? (
              <div className="active-state-summary">
                <div className="state-row">
                  <span className="state-label">Release Build:</span>
                  <span className="state-value highlight">{latest_deployment.build_number}</span>
                </div>
                <div className="state-row">
                  <span className="state-label">Version Target:</span>
                  <span className="state-value">{latest_deployment.version}</span>
                </div>
                <div className="state-row">
                  <span className="state-label">Commit Hash:</span>
                  <span className="state-value code">{latest_deployment.commit_id}</span>
                </div>
                <div className="state-row">
                  <span className="state-label">Release Time:</span>
                  <span className="state-value">{latest_deployment.deployment_time}</span>
                </div>
                <div className="state-row">
                  <span className="state-label">Build Result:</span>
                  <StatusBadge status={latest_deployment.status} />
                </div>
              </div>
            ) : (
              <p className="no-state-text">No active deployments detected.</p>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
