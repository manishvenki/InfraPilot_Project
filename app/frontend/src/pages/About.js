import React, { useState, useEffect } from 'react';
import { metaService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import InfoCard from '../components/InfoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Server, Layers, Cpu, Terminal, GitBranch, CpuIcon } from 'lucide-react';
import './About.css';

const About = () => {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAboutInfo = async () => {
      try {
        const data = await metaService.getAbout();
        setAboutInfo(data);
      } catch (err) {
        console.error(err);
        setError('Could not connect to metadata API endpoints.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutInfo();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying cluster metadata descriptors..." />;
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
          <h1 className="page-title">Suite Specifications</h1>
          <p className="page-subtitle">Project framework specifications and DevOps architecture integrations.</p>
        </div>
      </div>

      <div className="about-layout">
        {/* Left Side: Summary and Description */}
        <div className="about-main">
          <DashboardCard title={aboutInfo.project_name} subtitle="DevOps Automation Suite Framework">
            <div className="about-body">
              <p className="about-desc-text">{aboutInfo.description}</p>
              
              <div className="tech-cards-row">
                <div className="tech-badge-card">
                  <Terminal className="tech-badge-icon" size={20} />
                  <div className="tech-badge-details">
                    <span>Frontend Core</span>
                    <strong>React SPA</strong>
                  </div>
                </div>

                <div className="tech-badge-card">
                  <Cpu className="tech-badge-icon" size={20} />
                  <div className="tech-badge-details">
                    <span>REST API Service</span>
                    <strong>Python Flask</strong>
                  </div>
                </div>

                <div className="tech-badge-card">
                  <Server className="tech-badge-icon" size={20} />
                  <div className="tech-badge-details">
                    <span>Storage Engine</span>
                    <strong>SQLite 3</strong>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Technology Stack & Modules" subtitle="Libraries configured in index.js and dependencies.txt.">
            <div className="tech-stack-details">
              <div className="stack-item">
                <div className="stack-title">React Client Core:</div>
                <div className="stack-value">{aboutInfo.technology_stack.frontend}</div>
              </div>
              <div className="stack-item">
                <div className="stack-title">Flask Server Engine:</div>
                <div className="stack-value">{aboutInfo.technology_stack.backend}</div>
              </div>
              <div className="stack-item">
                <div className="stack-title">Relational Database:</div>
                <div className="stack-value">{aboutInfo.technology_stack.database}</div>
              </div>
              <div className="stack-item">
                <div className="stack-title">Target Integrations:</div>
                <div className="stack-value highlight">{aboutInfo.technology_stack.future_integrations}</div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Side: Architecture info */}
        <div className="about-sidebar">
          <InfoCard label="Suite Version" value={aboutInfo.version} icon={Terminal} />
          <InfoCard label="Architecture" value={aboutInfo.architecture} icon={Layers} />
          <InfoCard label="Engineers" value={aboutInfo.developer} icon={CpuIcon} />

          <DashboardCard title="Future Roadmaps">
            <ul className="roadmap-list">
              <li>
                <div className="roadmap-num">01</div>
                <div className="roadmap-info">
                  <strong>Docker Compose Deployments</strong>
                  <span>Containerize both React & Flask and orchestrate database pools automatically.</span>
                </div>
              </li>
              <li>
                <div className="roadmap-num">02</div>
                <div className="roadmap-info">
                  <strong>Kubernetes Ingress Hooks</strong>
                  <span>Replace mock REST responses with live kubectl socket streams.</span>
                </div>
              </li>
              <li>
                <div className="roadmap-num">03</div>
                <div className="roadmap-info">
                  <strong>Prometheus Telemetry</strong>
                  <span>Replace placeholder charts with active Grafana endpoints.</span>
                </div>
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default About;
