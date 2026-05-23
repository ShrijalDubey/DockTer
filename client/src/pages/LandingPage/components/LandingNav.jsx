import React from 'react';
import logoImg from '../../../assets/logo.png';

const LandingNav = ({ onNavigate }) => {
  return (
    <nav className="landing-nav">
      <div className="nav-brand" onClick={() => onNavigate('landing')}>
        <span className="nav-title">DockTer</span>
      </div>
      <div className="nav-links">
        <span className="nav-link" onClick={() => onNavigate('tutorial')}>CLI Companion</span>
        <span className="nav-link" onClick={() => onNavigate('dashboard')}>Launch Dashboard</span>
      </div>
    </nav>
  );
};

export default LandingNav;
