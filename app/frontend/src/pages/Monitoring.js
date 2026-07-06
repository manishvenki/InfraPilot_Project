import React, { useState, useEffect, useCallback } from 'react';
import { monitoringService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import MetricCard from '../components/MetricCard';
import InfoCard from '../components/InfoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  RefreshCw, 
  Activity, 
  Cpu, 
  HardDrive, 
  TrendingUp, 
  Wifi, 
  Clock, 
  AlertTriangle,
  Server
} from 'lucide-react';
import './Monitoring.css';

const Monitoring = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Historical data arrays for live chart drawing
  const [cpuHistory, setCpuHistory] = useState(Array(15).fill(40));
  const [memHistory, setMemHistory] = useState(Array(15).fill(65));
  const [reqHistory, setReqHistory] = useState(Array(15).fill(200));

  const fetchMetrics = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await monitoringService.getMetrics();
      setMetrics(data);
      
      // Update history arrays (push new value and remove oldest)
      setCpuHistory(prev => [...prev.slice(1), data.cpu_usage]);
      setMemHistory(prev => [...prev.slice(1), data.memory_usage]);
      setReqHistory(prev => [...prev.slice(1), data.requests_per_sec]);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not connect to telemetry API. Verify Flask status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(true);

    // Live update charts every 3 seconds
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return <LoadingSpinner message="Draining live cluster telemetry streams..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Node Telemetry</h1>
          <p className="page-subtitle">Real-time system telemetry and application request traffic logging.</p>
        </div>
        <button 
          onClick={() => fetchMetrics(false)} 
          className="btn-refresh" 
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Force Refresh</span>
        </button>
      </div>

      {/* Telemetry Core Grid */}
      <div className="monitoring-metrics-grid">
        <MetricCard title="CPU Core" value={metrics.cpu_usage} percentage={metrics.cpu_usage} icon={Cpu} />
        <MetricCard title="Memory RSS" value={metrics.memory_usage} percentage={metrics.memory_usage} icon={Activity} />
        <MetricCard title="Disk Volumes" value={metrics.disk_usage} percentage={metrics.disk_usage} icon={HardDrive} />
      </div>

      {/* Mini Stats Info Cards */}
      <div className="monitoring-info-grid">
        <InfoCard label="Requests/sec" value={`${metrics.requests_per_sec} rps`} icon={TrendingUp} />
        <InfoCard label="Avg Response Time" value={`${metrics.response_time_ms} ms`} icon={Clock} />
        <InfoCard label="Error Rate" value={`${metrics.error_rate_percent}%`} icon={AlertTriangle} />
        <InfoCard label="Inbound Network" value={`${metrics.network.inbound_mbps} Mbps`} icon={Wifi} />
        <InfoCard label="Outbound Network" value={`${metrics.network.outbound_mbps} Mbps`} icon={Wifi} />
      </div>

      {/* CSS Graphical Placeholders - Grafana Inspirations */}
      <div className="charts-board-grid">
        {/* CPU Load Chart */}
        <DashboardCard 
          title="CPU Utilization History (Live)" 
          subtitle="Fluctuations logged over 45s interval."
          headerActions={<span className="pulse-dot"></span>}
        >
          <div className="grafana-placeholder-chart">
            <div className="chart-bars-container">
              {cpuHistory.map((val, idx) => (
                <div key={idx} className="chart-bar-column">
                  <div 
                    className="chart-bar-fill cpu" 
                    style={{ height: `${val}%` }}
                    title={`CPU Load: ${val}%`}
                  ></div>
                  <span className="chart-bar-time">{idx * 3}s</span>
                </div>
              ))}
            </div>
            <div className="chart-y-axis">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
          </div>
        </DashboardCard>

        {/* Memory RSS Allocation Chart */}
        <DashboardCard 
          title="Memory Consumption (Live)" 
          subtitle="System RAM allocations."
          headerActions={<span className="pulse-dot"></span>}
        >
          <div className="grafana-placeholder-chart">
            <div className="chart-bars-container">
              {memHistory.map((val, idx) => (
                <div key={idx} className="chart-bar-column">
                  <div 
                    className="chart-bar-fill memory" 
                    style={{ height: `${val}%` }}
                    title={`RAM: ${val}%`}
                  ></div>
                  <span className="chart-bar-time">{idx * 3}s</span>
                </div>
              ))}
            </div>
            <div className="chart-y-axis">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
          </div>
        </DashboardCard>

        {/* Network Requests Sec Chart */}
        <DashboardCard 
          title="HTTP Ingress Traffic (Live)" 
          subtitle="Requests per second telemetry."
          headerActions={<span className="pulse-dot"></span>}
        >
          <div className="grafana-placeholder-chart">
            <div className="chart-bars-container">
              {reqHistory.map((val, idx) => {
                // Map max rps to 100% height limit
                const heightPercentage = Math.min((val / 500) * 100, 100);
                return (
                  <div key={idx} className="chart-bar-column">
                    <div 
                      className="chart-bar-fill traffic" 
                      style={{ height: `${heightPercentage}%` }}
                      title={`Traffic: ${val} rps`}
                    ></div>
                    <span className="chart-bar-time">{idx * 3}s</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-y-axis">
              <span>500 rps</span>
              <span>250 rps</span>
              <span>0 rps</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Monitoring;
