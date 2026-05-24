import React, { useState } from 'react';

const LandingNav = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="landing-nav" style={{ position: 'relative' }}>
      <div className="nav-brand" onClick={() => onNavigate('landing')}>
        <span className="nav-title">DockTer</span>
      </div>

      {/* Mobile hamburger button */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {mobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
        <span className="nav-link" onClick={() => { onNavigate('tutorial'); setMobileMenuOpen(false); }}>CLI Companion</span>
        <span className="nav-link" onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}>Launch Dashboard</span>
      </div>
    </nav>
  );
};

export default LandingNav;
