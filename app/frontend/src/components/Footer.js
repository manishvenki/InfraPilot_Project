import React from 'react';
import './Footer.css';

const Footer = ({ version = 'v0.3.0' }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-left">
        <span>&copy; {year} <strong>InfraPilot</strong>. All rights reserved.</span>
      </div>
      <div className="footer-right">
        <span className="footer-meta">Environment: <strong>Production</strong></span>
        <span className="footer-divider">|</span>
        <span className="footer-meta">API Version: <strong>{version}</strong></span>
      </div>
    </footer>
  );
};

export default Footer;
