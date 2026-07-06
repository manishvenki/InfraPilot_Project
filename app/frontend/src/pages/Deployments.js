import React, { useState, useEffect } from 'react';
import { deploymentsService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  RefreshCw, 
  GitBranch, 
  Play, 
  RotateCcw, 
  RefreshCcw, 
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import './Deployments.css';

const Deployments = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');

  // Form State for New Deployment
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [version, setVersion] = useState('v1.2.1');
  const [branch, setBranch] = useState('main');
  const [triggeredBy, setTriggeredBy] = useState('Console Operator');

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await deploymentsService.getHistory();
      setHistory(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch deployment records. Ensure SQLite database and Flask API are reachable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
  }, []);

  const handleDeployLatest = async (e) => {
    e.preventDefault();
    setActioningId('new-deploy');
    try {
      const res = await deploymentsService.deployLatest({
        version,
        branch,
        triggered_by: triggeredBy
      });
      if (res.success) {
        setShowDeployForm(false);
        // Refresh deployment list
        await fetchHistory(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to trigger new deployment.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRollback = async (id) => {
    if (!window.confirm('Are you sure you want to trigger a rollback to this build configuration?')) return;
    setActioningId(id);
    try {
      const res = await deploymentsService.rollback(id);
      if (res.success) {
        await fetchHistory(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate rollback.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRedeploy = async (id) => {
    setActioningId(id);
    try {
      const res = await deploymentsService.redeploy(id);
      if (res.success) {
        await fetchHistory(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to trigger redeployment.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to SQLite and reading deployment_history logs..." />;
  }

  const headers = ['Build #', 'Version', 'Branch', 'Commit', 'Triggered By', 'Duration', 'Deployed Time', 'Status', 'Actions'];

  const renderRow = (build, index) => (
    <tr key={build.id || index} className="table-row">
      <td className="table-cell bold">{build.build_number}</td>
      <td className="table-cell">{build.version}</td>
      <td className="table-cell">
        <div className="branch-display">
          <GitBranch size={13} className="branch-icon" />
          <span>{build.branch}</span>
        </div>
      </td>
      <td className="table-cell code-sub">{build.commit_id}</td>
      <td className="table-cell">{build.triggered_by}</td>
      <td className="table-cell">{build.duration}</td>
      <td className="table-cell">{build.deployment_time}</td>
      <td className="table-cell">
        <StatusBadge status={build.status} />
      </td>
      <td className="table-cell">
        <div className="deployments-actions">
          <button
            onClick={() => handleRedeploy(build.id)}
            className="btn-action-dep redeploy"
            disabled={actioningId !== null}
            title="Redeploy Build"
          >
            <RefreshCcw size={12} className={actioningId === build.id ? 'spin' : ''} />
            <span>Redeploy</span>
          </button>
          
          <button
            onClick={() => handleRollback(build.id)}
            className="btn-action-dep rollback"
            disabled={actioningId !== null}
            title="Rollback to this version"
          >
            <RotateCcw size={12} className={actioningId === build.id ? 'spin' : ''} />
            <span>Rollback</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deployments Pipeline</h1>
          <p className="page-subtitle">Track continuous integration build history and manage environment releases.</p>
        </div>
        <div className="header-actions-group">
          <button 
            onClick={() => setShowDeployForm(!showDeployForm)} 
            className="btn-deploy-trigger"
            disabled={actioningId !== null}
          >
            {showDeployForm ? <X size={14} /> : <Plus size={14} />}
            <span>{showDeployForm ? 'Cancel Trigger' : 'Deploy Latest'}</span>
          </button>
          
          <button 
            onClick={() => fetchHistory(false)} 
            className="btn-refresh" 
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Sync History</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Deploy Latest Custom Form Block */}
      {showDeployForm && (
        <div className="deploy-form-drawer">
          <DashboardCard title="Trigger Manual Deployment" subtitle="Specify release version parameters.">
            <form onSubmit={handleDeployLatest} className="deploy-form">
              <div className="deploy-form-fields">
                <div className="form-group">
                  <label className="form-label" htmlFor="dep-version">Release Version</label>
                  <input
                    type="text"
                    id="dep-version"
                    className="form-input"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="dep-branch">Git Branch</label>
                  <select 
                    id="dep-branch"
                    className="form-input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                    <option value="hotfix">hotfix</option>
                    <option value="release">release</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dep-operator">Operator</label>
                  <input
                    type="text"
                    id="dep-operator"
                    className="form-input"
                    value={triggeredBy}
                    onChange={(e) => setTriggeredBy(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-submit-group">
                <button 
                  type="submit" 
                  className="btn-submit-deploy"
                  disabled={actioningId !== null}
                >
                  <Play size={14} />
                  <span>{actioningId === 'new-deploy' ? 'Starting Build...' : 'Execute Deploy'}</span>
                </button>
              </div>
            </form>
          </DashboardCard>
        </div>
      )}

      {/* Deployment History Table */}
      <div className="history-table-container">
        <DashboardCard title="Deployment Run Logs" subtitle="Query results fetched from deployment_history tables.">
          <TableComponent 
            headers={headers} 
            data={history} 
            renderRow={renderRow} 
            emptyMessage="No deployments logged in SQLite database."
          />
        </DashboardCard>
      </div>
    </div>
  );
};

export default Deployments;
