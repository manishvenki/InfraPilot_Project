import React from 'react';
import { Menu, MenuOpen, Bell, Shield, Cloud, Server } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isCollapsed, toggleSidebar }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          onClick={toggleSidebar} 
          className="sidebar-toggle-btn"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="env-badge">
          <Cloud size={14} className="env-icon" />
          <span>PRODUCTION CLUSTER</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="system-status-indicator">
          <Server size={14} className="status-icon success" />
          <span className="status-text text-success">API Connected</span>
        </div>

        <div className="navbar-time">{currentDate}</div>

        <button className="nav-action-btn" title="Alert Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="system-security-badge">
          <Shield size={16} className="security-icon" />
          <span>SECURE</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
