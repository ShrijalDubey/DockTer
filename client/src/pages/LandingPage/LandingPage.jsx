import React, { useRef, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  const blueCardRef = useRef(null);
  const purpleCardRef = useRef(null);

  // Mouse move effect for premium card border glowing tracking
  const handleMouseMove = (e, cardRef) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="landing-container">
      {/* Background glow animations */}
      <div className="glow-sphere glow-blue"></div>
      <div className="glow-sphere glow-purple"></div>

      {/* Navigation bar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-logo-icon">🐳</div>
          <span className="nav-title">DockTer</span>
        </div>
        <div className="nav-links">
          <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tutorial')}>CLI Companion</span>
          <button className="nav-btn" onClick={() => onNavigate('dashboard')}>Launch App</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-badge">
          <span>✨</span> AI-Powered Docker Containerization
        </div>
        <h1 className="hero-title">
          Orchestrate Local Containers <br />
          Without the Friction
        </h1>
        <p className="hero-subtitle">
          DockTer scans your local codebase, detects architectural services, automatically writes optimized configurations, and compiles builds directly to your browser console via a secure companion agent.
        </p>
      </header>

      {/* Two Options Section */}
      <section className="options-grid">
        {/* OPTION 1: CLI TUTORIAL / AGENT SETUP */}
        <div 
          ref={purpleCardRef}
          className="option-card purple-theme"
          onMouseMove={(e) => handleMouseMove(e, purpleCardRef)}
          style={{ cursor: 'default' }}
        >
          <div className="card-top">
            <div className="card-badge">CLI Companion</div>
            <h2 className="card-title">Setup Local Agent</h2>
            <p className="card-desc">
              Boot up our zero-install developer assistant via Pip or UVX. Orchestrate containers and stream live compiler output directly from your machine.
            </p>
            
            <div className="terminal-preview-badge">
              <div className="terminal-header-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="terminal-cmd">
                <span className="cmd-prompt">$</span>
                <span>uvx dockter-agent start</span>
              </div>
              <div className="terminal-status-row">
                <span className="pulse-dot"></span>
                <span>Agent Status: Online</span>
              </div>
            </div>

            <ul className="feature-list">
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Zero manual Dockerfile compiling required
              </li>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Live compiler & runtime logs inside the web console
              </li>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Secured strictly behind local loopback port 8001
              </li>
            </ul>
          </div>
          
          <button className="card-cta-btn" onClick={() => onNavigate('tutorial')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            View CLI Setup Guide
          </button>
        </div>

        {/* OPTION 2: LAUNCH DASHBOARD / WEB INTERFACE */}
        <div 
          ref={blueCardRef}
          className="option-card blue-theme"
          onMouseMove={(e) => handleMouseMove(e, blueCardRef)}
          style={{ cursor: 'default' }}
        >
          <div className="card-top">
            <div className="card-badge">Web Suite</div>
            <h2 className="card-title">Launch Visual Generator</h2>
            <p className="card-desc">
              Analyze project structures visually. Customize container tags, toggle developer hot-reloading configurations, and download generated docker assets in seconds.
            </p>

            <ul className="feature-list" style={{ marginTop: '2.5rem', marginBottom: '3rem' }}>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Automatic multi-language codebase scanner
              </li>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Interactive sidebar visual setup tweaking panel
              </li>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Supports Docker Compose & Kubernetes manifest layouts
              </li>
              <li className="feature-item">
                <span className="feature-check">✓</span>
                Export bundle as organized zip files in one-click
              </li>
            </ul>
          </div>
          
          <button className="card-cta-btn" onClick={() => onNavigate('dashboard')}>
            Launch Web Interface
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section className="features-section">
        <div className="section-hdr">
          <h2 className="section-title">Engines Engineered for Speed</h2>
          <p className="section-desc">Designed to simplify modern backend container deployments and streamline configuration files.</p>
        </div>
        
        <div className="showcase-grid">
          <div className="showcase-card">
            <div className="showcase-icon">🔍</div>
            <h3 className="showcase-title">Stack Autodetect</h3>
            <p className="showcase-desc">Identifies PyPI packages, NodeJS modules, multi-service databases, and proxies to generate optimized orchestrations.</p>
          </div>
          
          <div className="showcase-card">
            <div className="showcase-icon">⚡</div>
            <h3 className="showcase-title">1-Click Local Run</h3>
            <p className="showcase-desc">Streams real-time compiler outputs directly into a visual console. Never jump between dashboards or terminals.</p>
          </div>
          
          <div className="showcase-card">
            <div className="showcase-icon">🛡️</div>
            <h3 className="showcase-title">Local-First Sandbox</h3>
            <p className="showcase-desc">The local agent executes exclusively on localhost origins, securing your host machine files from unauthorized requests.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="footer-text">© {new Date().getFullYear()} DockTer. Built with absolute modern standards.</span>
        <div className="footer-links">
          <span className="nav-link" style={{ cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => onNavigate('tutorial')}>Agent CLI Tutorial</span>
          <span className="nav-link" style={{ cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => onNavigate('dashboard')}>Dashboard Console</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
