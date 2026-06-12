import { useState } from 'react';
import logoImg from '../../../assets/logo.png';

const LandingHero = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('pip install dockter-agent');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="landing-hero">
      <img src={logoImg} alt="DockTer Mascot Logo" className="hero-mascot-img" />

      <h1 className="hero-title">Local container orchestration.</h1>
      <p className="hero-subtitle">
        DockTer automatically scans local project dependencies, outputs secure, highly-optimized Docker configurations, and boots container clusters in one click.
      </p>

      {/* Action Buttons */}
      <div className="hero-ctas">
        <button className="pill-btn pill-primary" onClick={() => onNavigate('dashboard')}>
          Open Web Interface
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        
        <button className="pill-btn pill-secondary" onClick={() => onNavigate('tutorial')}>
          CLI Setup Guide
        </button>
      </div>

      {/* Minimal Terminal Command Input */}
      <div className="hero-terminal">
        <div className="terminal-cmd-wrap">
          <span className="terminal-prompt">$</span>
          <span>pip install dockter-agent</span>
        </div>
        <button 
          className={`terminal-copy ${copied ? 'copied' : ''}`} 
          onClick={handleCopy}
          title="Copy command"
        >
          {copied ? (
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>✓ Copied</span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default LandingHero;
