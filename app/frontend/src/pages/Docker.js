import React, { useState, useEffect } from 'react';
import { dockerService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  RefreshCw, 
  Terminal as ConsoleIcon, 
  RotateCw, 
  Search, 
  X, 
  FileText,
  AlertCircle
} from 'lucide-react';
import './Docker.css';

const Docker = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');

  // Modals / Panels State
  const [selectedLogs, setSelectedLogs] = useState(null); // { name, logs: [] }
  const [selectedInspect, setSelectedInspect] = useState(null); // json object
  const [panelLoading, setPanelLoading] = useState(false);

  const fetchContainers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await dockerService.getContainers();
      setContainers(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Docker containers. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContainers(true);
  }, []);

  const handleRestart = async (id) => {
    setActioningId(id);
    try {
      const res = await dockerService.restartContainer(id);
      if (res.success) {
        // Refresh containers to show updated restart_count and status
        await fetchContainers(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to restart container.');
    } finally {
      setActioningId(null);
    }
  };

  const handleViewLogs = async (id) => {
    setPanelLoading(true);
    setSelectedLogs({ name: 'Loading...', logs: [] });
    try {
      const res = await dockerService.getLogs(id);
      setSelectedLogs(res);
      setSelectedInspect(null); // Close inspect if open
    } catch (err) {
      console.error(err);
      setSelectedLogs({ name: 'Error', logs: ['Failed to load logs.'] });
    } finally {
      setPanelLoading(false);
    }
  };

  const handleInspect = async (id) => {
    setPanelLoading(true);
    setSelectedInspect({ Loading: true });
    try {
      const res = await dockerService.inspectContainer(id);
      setSelectedInspect(res);
      setSelectedLogs(null); // Close logs if open
    } catch (err) {
      console.error(err);
      setSelectedInspect({ error: 'Failed to inspect container details.' });
    } finally {
      setPanelLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Polling Docker daemon for container processes..." />;
  }

  const headers = ['Container Name', 'Image', 'Status', 'Ports', 'Restart Count', 'Created', 'Actions'];

  const renderContainerRow = (c, index) => (
    <tr key={c.id || index} className="table-row">
      <td className="table-cell bold">{c.name}</td>
      <td className="table-cell code-sub">{c.image}</td>
      <td className="table-cell">
        <StatusBadge status={c.status} />
      </td>
      <td className="table-cell code-sub">{c.ports}</td>
      <td className="table-cell font-mono">{c.restart_count}</td>
      <td className="table-cell">{c.created_time}</td>
      <td className="table-cell">
        <div className="action-buttons-group">
          <button 
            onClick={() => handleViewLogs(c.id)} 
            className="btn-action logs"
            title="View Logs"
            disabled={actioningId === c.id}
          >
            <ConsoleIcon size={14} />
            <span>Logs</span>
          </button>
          
          <button 
            onClick={() => handleRestart(c.id)} 
            className="btn-action restart"
            title="Restart Container"
            disabled={actioningId === c.id}
          >
            <RotateCw size={14} className={actioningId === c.id ? 'spin' : ''} />
            <span>Restart</span>
          </button>
          
          <button 
            onClick={() => handleInspect(c.id)} 
            className="btn-action inspect"
            title="Inspect JSON"
            disabled={actioningId === c.id}
          >
            <Search size={14} />
            <span>Inspect</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Docker Engine Control</h1>
          <p className="page-subtitle">Inspect, trigger log outputs, and perform lifecycle commands on daemon containers.</p>
        </div>
        <button 
          onClick={() => fetchContainers(false)} 
          className="btn-refresh" 
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Refresh Containers</span>
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="docker-main-grid">
        {/* Left Side: Container List */}
        <div className={`docker-list-panel ${selectedLogs || selectedInspect ? 'split-view' : ''}`}>
          <DashboardCard title="Active Containers" subtitle="Process listing matching `docker ps -a` representation.">
            <TableComponent 
              headers={headers} 
              data={containers} 
              renderRow={renderContainerRow} 
              emptyMessage="No containers running on the Docker host."
            />
          </DashboardCard>
        </div>

        {/* Right Side: Interactive Console Drawer (Logs or Inspect) */}
        {(selectedLogs || selectedInspect) && (
          <div className="docker-console-drawer">
            {selectedLogs && (
              <DashboardCard 
                title={`Logs: ${selectedLogs.container || 'Loading...'}`} 
                subtitle="Live stdout/stderr stream from container process."
                headerActions={
                  <button onClick={() => setSelectedLogs(null)} className="btn-close-drawer">
                    <X size={16} />
                  </button>
                }
                className="full-height-card"
              >
                <div className="terminal-screen">
                  {panelLoading ? (
                    <div className="terminal-loading">Fetching logs...</div>
                  ) : (
                    selectedLogs.logs?.map((logLine, idx) => (
                      <div key={idx} className="terminal-line">
                        <span className="log-index">[{idx + 1}]</span> {logLine}
                      </div>
                    ))
                  )}
                </div>
              </DashboardCard>
            )}

            {selectedInspect && (
              <DashboardCard 
                title={`Inspect Config`} 
                subtitle="Detailed system architecture configuration in JSON format."
                headerActions={
                  <button onClick={() => setSelectedInspect(null)} className="btn-close-drawer">
                    <X size={16} />
                  </button>
                }
                className="full-height-card"
              >
                <div className="inspect-screen">
                  {panelLoading ? (
                    <div className="inspect-loading">Loading configuration metadata...</div>
                  ) : (
                    <pre className="inspect-pre">
                      <code>{JSON.stringify(selectedInspect, null, 2)}</code>
                    </pre>
                  )}
                </div>
              </DashboardCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Docker;
