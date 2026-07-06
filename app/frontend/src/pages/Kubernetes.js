import React, { useState, useEffect } from 'react';
import { kubernetesService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import InfoCard from '../components/InfoCard';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  RefreshCw, 
  Layers, 
  Cpu, 
  Network, 
  ShieldCheck, 
  HardDrive, 
  Grid,
  FileText,
  AlertCircle
} from 'lucide-react';
import './Kubernetes.css';

const Kubernetes = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pods');

  const fetchK8sData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await kubernetesService.getData();
      setData(response);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Kubernetes cluster resources. Please verify Flask backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchK8sData(true);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying Kubernetes API server for cluster objects..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { namespaces, pods, deployments, replica_sets, services, nodes, cluster_status } = data;

  const tabs = [
    { id: 'pods', label: 'Pods', count: pods.length },
    { id: 'deployments', label: 'Deployments', count: deployments.length },
    { id: 'replica_sets', label: 'Replica Sets', count: replica_sets.length },
    { id: 'services', label: 'Services', count: services.length },
    { id: 'namespaces', label: 'Namespaces', count: namespaces.length },
    { id: 'nodes', label: 'Nodes', count: nodes.length }
  ];

  // Helper renderers for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'pods':
        return (
          <TableComponent 
            headers={['Pod Name', 'Namespace', 'IP Address', 'Node', 'Age', 'Restarts', 'Status']}
            data={pods}
            renderRow={(pod, idx) => (
              <tr key={pod.name || idx} className="table-row">
                <td className="table-cell bold">{pod.name}</td>
                <td className="table-cell font-mono">{pod.namespace}</td>
                <td className="table-cell font-mono">{pod.ip}</td>
                <td className="table-cell">{pod.node}</td>
                <td className="table-cell">{pod.age}</td>
                <td className="table-cell text-center font-mono">{pod.restarts}</td>
                <td className="table-cell">
                  <StatusBadge status={pod.status} />
                </td>
              </tr>
            )}
          />
        );
      case 'deployments':
        return (
          <TableComponent
            headers={['Deployment Name', 'Namespace', 'Ready Pods', 'Up to Date', 'Available', 'Age']}
            data={deployments}
            renderRow={(dep, idx) => (
              <tr key={dep.name || idx} className="table-row">
                <td className="table-cell bold">{dep.name}</td>
                <td className="table-cell font-mono">{dep.namespace}</td>
                <td className="table-cell text-center font-mono bold">{dep.ready}</td>
                <td className="table-cell text-center font-mono">{dep.up_to_date}</td>
                <td className="table-cell text-center font-mono">{dep.available}</td>
                <td className="table-cell">{dep.age}</td>
              </tr>
            )}
          />
        );
      case 'replica_sets':
        return (
          <TableComponent
            headers={['ReplicaSet Name', 'Namespace', 'Desired', 'Current', 'Ready', 'Age']}
            data={replica_sets}
            renderRow={(rs, idx) => (
              <tr key={rs.name || idx} className="table-row">
                <td className="table-cell bold">{rs.name}</td>
                <td className="table-cell font-mono">{rs.namespace}</td>
                <td className="table-cell text-center font-mono">{rs.desired}</td>
                <td className="table-cell text-center font-mono">{rs.current}</td>
                <td className="table-cell text-center font-mono bold">{rs.ready}</td>
                <td className="table-cell">{rs.age}</td>
              </tr>
            )}
          />
        );
      case 'services':
        return (
          <TableComponent
            headers={['Service Name', 'Namespace', 'Type', 'Cluster IP', 'External IP', 'Ports', 'Age']}
            data={services}
            renderRow={(svc, idx) => (
              <tr key={svc.name || idx} className="table-row">
                <td className="table-cell bold">{svc.name}</td>
                <td className="table-cell font-mono">{svc.namespace}</td>
                <td className="table-cell text-success font-semibold">{svc.type}</td>
                <td className="table-cell font-mono">{svc.cluster_ip}</td>
                <td className="table-cell font-mono">{svc.external_ip}</td>
                <td className="table-cell font-mono">{svc.ports}</td>
                <td className="table-cell">{svc.age}</td>
              </tr>
            )}
          />
        );
      case 'namespaces':
        return (
          <TableComponent
            headers={['Namespace Name', 'Age', 'Status']}
            data={namespaces}
            renderRow={(ns, idx) => (
              <tr key={ns.name || idx} className="table-row">
                <td className="table-cell bold">{ns.name}</td>
                <td className="table-cell">{ns.age}</td>
                <td className="table-cell">
                  <StatusBadge status={ns.status} />
                </td>
              </tr>
            )}
          />
        );
      case 'nodes':
        return (
          <TableComponent
            headers={['Node Name', 'Role', 'IP Address', 'Kubelet Version', 'Age', 'Status']}
            data={nodes}
            renderRow={(node, idx) => (
              <tr key={node.name || idx} className="table-row">
                <td className="table-cell bold">{node.name}</td>
                <td className="table-cell text-info font-semibold">{node.roles}</td>
                <td className="table-cell font-mono">{node.internal_ip}</td>
                <td className="table-cell font-mono">{node.version}</td>
                <td className="table-cell">{node.age}</td>
                <td className="table-cell">
                  <StatusBadge status={node.status} />
                </td>
              </tr>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kubernetes Cluster Explorer</h1>
          <p className="page-subtitle">Inspect namespaces, nodes, deployments, and running pod configurations on the control plane.</p>
        </div>
        <button 
          onClick={() => fetchK8sData(false)} 
          className="btn-refresh" 
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Sync API Objects</span>
        </button>
      </div>

      {/* Cluster Status Summary cards */}
      <div className="k8s-summary-grid">
        <InfoCard label="API Server" value={cluster_status.api_server} icon={ShieldCheck} />
        <InfoCard label="Scheduler" value={cluster_status.scheduler} icon={Grid} />
        <InfoCard label="Controller Manager" value={cluster_status.controller_manager} icon={Cpu} />
        <InfoCard label="Cluster Health" value={cluster_status.status} icon={Layers} />
      </div>

      {/* Tab bar navigation */}
      <div className="k8s-tabs-container">
        <div className="tabs-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <div className="tab-content-panel">
          <DashboardCard 
            title={`${activeTab.replace('_', ' ').toUpperCase()} RESOURCE GRID`}
            subtitle={`Live telemetry queries from Kubernetes controller-manager namespaces.`}
          >
            {renderTabContent()}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Kubernetes;
