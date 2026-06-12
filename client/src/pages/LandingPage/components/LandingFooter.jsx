import logoImg from '../../../assets/logo.png';

const LandingFooter = ({ onNavigate }) => {
  return (
    <footer className="landing-footer">
      <div className="footer-top-grid">
        {/* Column 1: Brand Group */}
        <div className="footer-col">
          <div className="footer-brand">
            <img src={logoImg} alt="DockTer Logo" className="footer-logo-img" />
            <span className="footer-brand-title">DockTer</span>
          </div>
          <p className="footer-brand-desc">
            AI-powered Dockerfile generator and one-click container orchestrator running locally.
          </p>
        </div>

        {/* Column 2: Product */}
        <div className="footer-col">
          <span className="footer-col-title">Product</span>
          <div className="footer-col-links">
            <span className="footer-col-link" onClick={() => onNavigate('dashboard')}>Visual Dashboard</span>
            <span className="footer-col-link" onClick={() => onNavigate('tutorial')}>CLI Companion</span>
            <span className="footer-col-link" onClick={() => onNavigate('tutorial')}>Local REST API</span>
          </div>
        </div>

        {/* Column 3: Resources */}
        <div className="footer-col">
          <span className="footer-col-title">Resources</span>
          <div className="footer-col-links">
            <a href="https://github.com/ShrijalDubey/DockTer" target="_blank" rel="noopener noreferrer" className="footer-col-link">GitHub Repository</a>
            <a href="https://pypi.org/project/dockter-agent/" target="_blank" rel="noopener noreferrer" className="footer-col-link">PyPI Agent Registry</a>
            <a href="https://github.com/ShrijalDubey/DockTer/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="footer-col-link">README Guide</a>
          </div>
        </div>

        {/* Column 4: Community */}
        <div className="footer-col">
          <span className="footer-col-title">Community</span>
          <div className="footer-col-links">
            <a href="https://github.com/ShrijalDubey/DockTer" target="_blank" rel="noopener noreferrer" className="footer-col-link">GitHub</a>
            <a href="https://github.com/ShrijalDubey/DockTer/issues" target="_blank" rel="noopener noreferrer" className="footer-col-link">Bug Tracker</a>
            <span className="footer-col-link" onClick={() => onNavigate('tutorial')}>Security sandbox</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <span className="footer-text">© {new Date().getFullYear()} DockTer. Built with absolute modern standards.</span>
        <div className="footer-bottom-links">
          <span className="nav-link" style={{ fontSize: '0.82rem' }} onClick={() => onNavigate('landing')}>Privacy Policy</span>
          <span className="nav-link" style={{ fontSize: '0.82rem' }} onClick={() => onNavigate('landing')}>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
