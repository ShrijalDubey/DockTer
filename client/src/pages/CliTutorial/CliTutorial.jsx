import React, { useState, useRef, useEffect } from 'react';
import './CliTutorial.css';
import logoImg from '../../assets/logo.png';

const CliTutorial = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [installTab, setInstallTab] = useState('pip'); // Default to pip
  const [copyStatus, setCopyStatus] = useState('');

  // Step DOM refs for auto-scrolling & scroll tracking
  const stepRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null)
  };

  // Flag to temporarily disable scroll tracker when user clicks a sidebar item (smooth scroll duration)
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const handleStepClick = (stepNum) => {
    isScrollingRef.current = true;
    setActiveStep(stepNum);
    
    stepRefs[stepNum].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Re-enable scroll tracker after smooth scrolling finishes
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  // IntersectionObserver to automatically highlight sidebar links on scroll
  useEffect(() => {
    const observerOptions = {
      root: null, // defaults to browser viewport
      rootMargin: '-25% 0px -45% 0px', // triggers when the card enters the active visual center
      threshold: 0
    };

    const handleIntersection = (entries) => {
      if (isScrollingRef.current) return; // Skip if currently executing user-click smooth scroll
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stepId = Object.keys(stepRefs).find(
            (key) => stepRefs[key].current === entry.target
          );
          if (stepId) {
            setActiveStep(Number(stepId));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each step card
    Object.values(stepRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Commands map
  const installCommands = {
    pip: 'pip install dockter-agent && dockter-agent start',
    uvx: 'uvx dockter-agent start',
    pipx: 'pipx run dockter-agent start'
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(''), 1500);
  };

  return (
    <div className="tutorial-container">
      {/* Navigation bar */}
      <nav className="tutorial-nav">
        <button className="back-home-btn" onClick={() => onNavigate('landing')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="back-btn-text">Back to Home</span>
        </button>

        <div className="nav-brand" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="DockTer Logo" className="nav-logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', filter: 'drop-shadow(0 0 8px rgba(53, 116, 240, 0.3))' }} />
          <span className="nav-title">DockTer Setup</span>
        </div>

        <button className="pill-btn pill-primary" onClick={() => onNavigate('dashboard')} style={{ padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.88rem' }}>
          Go to Dashboard
        </button>
      </nav>

      {/* Main split layout */}
      <div className="tutorial-layout">
        {/* Left Side: Steps Progress */}
        <aside className="steps-checklist">
          <div className="checklist-title">Installation Guide</div>
          
          <div 
            className={`step-nav-item ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => handleStepClick(1)}
          >
            <div className="step-number">1</div>
            <div className="step-nav-info">
              <span className="step-nav-title">Select Tooling</span>
              <span className="step-nav-desc">Choose package installer</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => handleStepClick(2)}
          >
            <div className="step-number">2</div>
            <div className="step-nav-info">
              <span className="step-nav-title">Launch Service</span>
              <span className="step-nav-desc">Boot secure companion agent</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => handleStepClick(3)}
          >
            <div className="step-number">3</div>
            <div className="step-nav-info">
              <span className="step-nav-title">Connection Status</span>
              <span className="step-nav-desc">Autodetect loopback binds</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 4 ? 'active' : ''}`}
            onClick={() => handleStepClick(4)}
          >
            <div className="step-number">4</div>
            <div className="step-nav-info">
              <span className="step-nav-title">Begin Compiling</span>
              <span className="step-nav-desc">Unlock 1-click orchestration</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Step Card Components */}
        <main className="steps-content-area">
          
          {/* STEP 1 */}
          <section ref={stepRefs[1]} className="step-card" onClick={() => setActiveStep(1)}>
            <div className="step-badge">Step 1</div>
            <h2 className="step-title">Choose Package & Copy Command</h2>
            <p className="step-description">
              DockTer utilizes a secure local companion agent launched directly from the PyPI registry. This agent performs secure local file writes and interfaces directly with your machine's Docker engine. Copy the startup command below:
            </p>

            <div className="tab-manager">
              <div className="tabs-header">
                <button className={`tab-btn ${installTab === 'pip' ? 'active' : ''}`} onClick={() => setInstallTab('pip')}>pip</button>
                <button className={`tab-btn ${installTab === 'uvx' ? 'active' : ''}`} onClick={() => setInstallTab('uvx')}>uvx (Instant)</button>
                <button className={`tab-btn ${installTab === 'pipx' ? 'active' : ''}`} onClick={() => setInstallTab('pipx')}>pipx</button>
              </div>

              {installTab === 'pip' && (
                <div className="code-terminal-block">
                  <div className="code-content">
                    <span className="code-prompt">$</span>
                    <span>pip install dockter-agent && dockter-agent start</span>
                  </div>
                  <button 
                    className={`copy-btn ${copyStatus === 'pip' ? 'copied' : ''}`}
                    onClick={() => handleCopy('pip install dockter-agent && dockter-agent start', 'pip')}
                    title="Copy command"
                  >
                    {copyStatus === 'pip' ? '✓' : '📋'}
                  </button>
                </div>
              )}

              {installTab === 'uvx' && (
                <div className="code-terminal-block">
                  <div className="code-content">
                    <span className="code-prompt">$</span>
                    <span>uvx dockter-agent start</span>
                  </div>
                  <button 
                    className={`copy-btn ${copyStatus === 'uvx' ? 'copied' : ''}`}
                    onClick={() => handleCopy('uvx dockter-agent start', 'uvx')}
                    title="Copy command"
                  >
                    {copyStatus === 'uvx' ? '✓' : '📋'}
                  </button>
                </div>
              )}

              {installTab === 'pipx' && (
                <div className="code-terminal-block">
                  <div className="code-content">
                    <span className="code-prompt">$</span>
                    <span>pipx run dockter-agent start</span>
                  </div>
                  <button 
                    className={`copy-btn ${copyStatus === 'pipx' ? 'copied' : ''}`}
                    onClick={() => handleCopy('pipx run dockter-agent start', 'pipx')}
                    title="Copy command"
                  >
                    {copyStatus === 'pipx' ? '✓' : '📋'}
                  </button>
                </div>
              )}
            </div>
            
            <p className="step-description" style={{ fontSize: '0.88rem', marginTop: '-0.5rem' }}>
              💡 <b>Why `uvx` or `pipx`?</b> They download and execute the latest PyPI agent binary instantly inside an isolated virtual environment, keeping your global Python system completely clean.
            </p>
          </section>

          {/* STEP 2 */}
          <section ref={stepRefs[2]} className="step-card" onClick={() => setActiveStep(2)}>
            <div className="step-badge">Step 2</div>
            <h2 className="step-title">Initialize and Run the Agent Service</h2>
            <p className="step-description">
              Open your system terminal (PowerShell, Command Prompt, or terminal) and paste the copied command. This boots a secure background API uploader listening strictly on port <code>8001</code>.
            </p>

            {/* STATIC TERMINAL OUTPUT MOCK */}
            <div className="interactive-terminal">
              <div className="terminal-topbar">
                <div className="terminal-controls">
                  <span className="control-circle control-close"></span>
                  <span className="control-circle control-minimize"></span>
                  <span className="control-circle control-expand"></span>
                </div>
                <span className="terminal-title">terminal: dockter-agent start</span>
                <span style={{ width: '40px' }}></span>
              </div>
              
              <div className="terminal-body">
                <div className="log-entry">
                  <span className="log-prompt">$ </span>
                  <span>{installCommands[installTab]}</span>
                </div>
                <div className="log-entry log-dim">Retrieving package metadata from PyPI...</div>
                <div className="log-entry log-dim">Resolving dependencies... (fastapi v0.100.0, uvicorn v0.22.0, docker v7.0.0)</div>
                <div className="log-entry log-info">[INFO] Launching secure local companion service...</div>
                <div className="log-entry log-success">[SUCCESS] Service running on http://127.0.0.1:8001 (Press CTRL+C to stop)</div>
                <div className="log-entry log-info">[INFO] Origin CORS headers enabled for dashboard client: http://localhost:5173</div>
                <div className="log-entry log-success">[SUCCESS] Successfully verified connection to local Docker Engine</div>
                <div className="log-entry log-info" style={{ fontWeight: '600' }}>[INFO] Companion Agent is ONLINE and waiting for orchestrations...</div>
              </div>
            </div>
          </section>

          {/* STEP 3 */}
          <section ref={stepRefs[3]} className="step-card" onClick={() => setActiveStep(3)}>
            <div className="step-badge">Step 3</div>
            <h2 className="step-title">Automatic Dashboard Connection</h2>
            <p className="step-description">
              You do not need to manually configure ports. Once the agent is active inside your terminal, DockTer's visual workspace automatically senses the local connection at <code>http://localhost:8001</code>.
            </p>

            <div className="agent-connect-panel">
              <div className="agent-connect-title">Dashboard Status Indicator</div>
              <div className="agent-connect-desc">
                When active, the **Local Orchestration** status indicator on the visual workspace's left sidebar will automatically update to reflect connection success:
              </div>
              <div className="agent-status-badge">
                <span className="pulse-dot"></span>
                <span>Agent Status: Connected</span>
              </div>
            </div>
          </section>

          {/* STEP 4 */}
          <section ref={stepRefs[4]} className="step-card" onClick={() => setActiveStep(4)}>
            <div className="step-badge">Step 4</div>
            <h2 className="step-title">Orchestrate Container Ecosystems</h2>
            <p className="step-description">
              Congratulations! You are now fully configured to use 1-click orchestration inside our visual workspace. 
            </p>
            <p className="step-description" style={{ marginTop: '-0.75rem' }}>
              Whenever you scan a project inside the web dashboard, simply click **Deploy via Local Docker**:
              <br />
              1. The browser securely communicates the generated compose files to your companion agent.
              2. The agent writes these files directly into a new subdirectory on your system.
              3. It invokes your local Docker client to compile and boot the service, and streams build terminal output logs directly into your web dashboard in real time!
            </p>

            <div className="agent-connect-panel" style={{ background: 'rgba(53, 116, 240, 0.03)', borderStyle: 'solid', borderColor: 'rgba(53, 116, 240, 0.1)' }}>
              <div className="agent-connect-title" style={{ color: '#4fa1ff', fontSize: '1rem' }}>🔒 Strict Loopback Boundaries</div>
              <div className="agent-connect-desc" style={{ fontSize: '0.88rem' }}>
                For enterprise-grade security, the companion agent binds exclusively to the <code>127.0.0.1</code> interface and implements strict CORS origin checks, rejecting any incoming triggers that do not originate directly from your local browser client.
              </div>
            </div>
          </section>

          {/* Bottom navigation flow triggers */}
          <div className="tutorial-bottom-bar">
            <button className="bottom-back-btn" onClick={() => onNavigate('landing')}>
              ← Back to Home
            </button>
            <button className="bottom-next-btn" onClick={() => onNavigate('dashboard')}>
              Launch Web Interface
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default CliTutorial;
