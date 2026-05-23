import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './CliTutorial.css';

const CliTutorial = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [installTab, setInstallTab] = useState('uvx'); // 'uvx', 'pipx', 'pip'
  const [copyStatus, setCopyStatus] = useState('');
  
  // Interactive Terminal Simulator State
  const [terminalState, setTerminalState] = useState('idle'); // 'idle', 'running', 'active'
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'dim', text: '# Press the button below to simulate launching the agent service...' }
  ]);
  
  // Real agent ping check state
  const [pingStatus, setPingStatus] = useState('unchecked'); // 'unchecked', 'checking', 'connected', 'failed'

  // Step DOM refs for auto-scrolling on checklist click
  const stepRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null)
  };

  const handleStepClick = (stepNum) => {
    setActiveStep(stepNum);
    stepRefs[stepNum].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const completeStep = (stepNum) => {
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps(prev => [...prev, stepNum]);
    }
  };

  // Commands map
  const installCommands = {
    uvx: 'uvx dockter-agent start',
    pipx: 'pipx run dockter-agent start',
    pip: 'pip install dockter-agent && dockter-agent start'
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    completeStep(1);
    setTimeout(() => setCopyStatus(''), 1500);
  };

  // Simulated Terminal Run Code
  const runTerminalSimulation = () => {
    if (terminalState !== 'idle') return;
    setTerminalState('running');
    setTerminalLogs([]);
    completeStep(2);

    const logsList = [
      { delay: 100, type: 'info', text: '$ ' + installCommands[installTab] },
      { delay: 600, type: 'dim', text: 'Retrieving package metadata from PyPI...' },
      { delay: 1100, type: 'dim', text: 'Resolving dependencies... (fastapi v0.100.0, uvicorn v0.22.0, click v8.1.0)' },
      { delay: 1600, type: 'info', text: '[INFO] Launching DockTer Companion Agent Service...' },
      { delay: 2100, type: 'success', text: '[SUCCESS] Uvicorn server running on http://127.0.0.1:8001 (Press CTRL+C to quit)' },
      { delay: 2600, type: 'info', text: '[INFO] CORS setup enabled for trusted local origin: http://localhost:5173' },
      { delay: 3100, type: 'info', text: '[INFO] Local-first security active. Restricting external network binds.' },
      { delay: 3600, type: 'success', text: '[SUCCESS] Connected to local Docker daemon (Docker Engine v25.0.3)' },
      { delay: 4000, type: 'info', text: '[INFO] Companion Agent is ONLINE and waiting for dashboard orchestrations...' }
    ];

    logsList.forEach(log => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, { type: log.type, text: log.text }]);
        if (log.text.includes('ONLINE')) {
          setTerminalState('active');
        }
      }, log.delay);
    });
  };

  // Real Agent Health Ping Checker
  const checkAgentHealth = async () => {
    setPingStatus('checking');
    completeStep(3);
    try {
      // Companion agent binds strictly on localhost:8001
      const response = await axios.get('http://127.0.0.1:8001/health', { timeout: 3000 });
      if (response.status === 200 || response.data) {
        setPingStatus('connected');
        completeStep(4);
      } else {
        setPingStatus('failed');
      }
    } catch (err) {
      console.log("Health check fell back. Trying alternative localhost binding...", err);
      try {
        const response = await axios.get('http://localhost:8001/health', { timeout: 2000 });
        if (response.status === 200) {
          setPingStatus('connected');
          completeStep(4);
        } else {
          setPingStatus('failed');
        }
      } catch (err2) {
        setPingStatus('failed');
      }
    }
  };

  // Reset simulated terminal
  const resetTerminal = () => {
    setTerminalState('idle');
    setTerminalLogs([
      { type: 'dim', text: '# Press the button below to simulate launching the agent service...' }
    ]);
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
          Back to Home
        </button>

        <div className="nav-brand">
          <div className="nav-logo-icon" style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>🐳</div>
          <span className="nav-title">DockTer Agent Setup</span>
        </div>

        <button className="nav-btn" onClick={() => onNavigate('dashboard')}>
          Go to Dashboard
        </button>
      </nav>

      {/* Main split layout */}
      <div className="tutorial-layout">
        {/* Left Side: Dynamic Checklist */}
        <aside className="steps-checklist">
          <div className="checklist-title">Installation Steps</div>
          
          <div 
            className={`step-nav-item ${activeStep === 1 ? 'active' : ''} ${completedSteps.includes(1) ? 'completed' : ''}`}
            onClick={() => handleStepClick(1)}
          >
            <div className="step-number">
              {completedSteps.includes(1) ? '✓' : '1'}
            </div>
            <div className="step-nav-info">
              <span className="step-nav-title">Select Tooling</span>
              <span className="step-nav-desc">Install standard package agent</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 2 ? 'active' : ''} ${completedSteps.includes(2) ? 'completed' : ''}`}
            onClick={() => handleStepClick(2)}
          >
            <div className="step-number">
              {completedSteps.includes(2) ? '✓' : '2'}
            </div>
            <div className="step-nav-info">
              <span className="step-nav-title">Initialize Agent</span>
              <span className="step-nav-desc">Boot secure local loopback service</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 3 ? 'active' : ''} ${completedSteps.includes(3) ? 'completed' : ''}`}
            onClick={() => handleStepClick(3)}
          >
            <div className="step-number">
              {completedSteps.includes(3) ? '✓' : '3'}
            </div>
            <div className="step-nav-info">
              <span className="step-nav-title">Verify Connection</span>
              <span className="step-nav-desc">Ping live service response status</span>
            </div>
          </div>

          <div 
            className={`step-nav-item ${activeStep === 4 ? 'active' : ''} ${completedSteps.includes(4) ? 'completed' : ''}`}
            onClick={() => handleStepClick(4)}
          >
            <div className="step-number">
              {completedSteps.includes(4) ? '✓' : '4'}
            </div>
            <div className="step-nav-info">
              <span className="step-nav-title">Start Orchestrating</span>
              <span className="step-nav-desc">Unlock 1-click live compiler logs</span>
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
              DockTer utilizes a small local companion agent launched directly from the PyPI registry. This agent performs secure, local file writes and communicates directly with your host Docker engine. Choose your preferred environment installer below:
            </p>

            <div className="tab-manager">
              <div className="tabs-header">
                <button className={`tab-btn ${installTab === 'uvx' ? 'active' : ''}`} onClick={() => setInstallTab('uvx')}>uvx (Recommended)</button>
                <button className={`tab-btn ${installTab === 'pipx' ? 'active' : ''}`} onClick={() => setInstallTab('pipx')}>pipx</button>
                <button className={`tab-btn ${installTab === 'pip' ? 'active' : ''}`} onClick={() => setInstallTab('pip')}>pip</button>
              </div>

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
            </div>
            
            <p className="step-description" style={{ fontSize: '0.85rem', marginTop: '-0.5rem' }}>
              💡 <b>Why `uvx` or `pipx`?</b> They execute PyPI binary processes instantly in transient virtualenvs, meaning zero global system environment clutter!
            </p>
          </section>

          {/* STEP 2 */}
          <section ref={stepRefs[2]} className="step-card" onClick={() => setActiveStep(2)}>
            <div className="step-badge">Step 2</div>
            <h2 className="step-title">Initialize and Run the Agent Service</h2>
            <p className="step-description">
              Paste the copied command inside your system terminal (PowerShell, Command Prompt, or bash) to start the daemon process. The service launches a secure API endpoint on your machine.
            </p>

            {/* HIGH FIDELITY TERMINAL SIMULATOR */}
            <div className="interactive-terminal">
              <div className="terminal-topbar">
                <div className="terminal-controls">
                  <span className="control-circle control-close"></span>
                  <span className="control-circle control-minimize"></span>
                  <span className="control-circle control-expand"></span>
                </div>
                <span className="terminal-title">dockter-agent: localhost:8001</span>
                <span style={{ width: '40px' }}></span>
              </div>
              <div className="terminal-body">
                {terminalLogs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.type ? `log-${log.type}` : ''}`}>
                    {log.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="terminal-actions-bar">
              <div className="terminal-status-badge">
                <span className="status-label">Simulated Status:</span>
                <span className={`status-dot ${terminalState === 'active' ? 'active' : ''} ${terminalState === 'running' ? 'loading' : ''}`}></span>
                <span style={{ textTransform: 'capitalize', fontWeight: '600', color: terminalState === 'active' ? '#10b981' : terminalState === 'running' ? '#f59e0b' : '#64748b' }}>
                  {terminalState === 'active' ? 'Online' : terminalState === 'running' ? 'Booting...' : 'Offline'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {terminalState !== 'idle' && (
                  <button className="ping-btn" onClick={resetTerminal} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reset</button>
                )}
                <button 
                  className="simulate-btn" 
                  onClick={runTerminalSimulation}
                  disabled={terminalState !== 'idle'}
                >
                  ⚡ Simulate Launch
                </button>
              </div>
            </div>
          </section>

          {/* STEP 3 */}
          <section ref={stepRefs[3]} className="step-card" onClick={() => setActiveStep(3)}>
            <div className="step-badge">Step 3</div>
            <h2 className="step-title">Verify Local Connectivity Status</h2>
            <p className="step-description">
              Confirm that the companion service is up and running. DockTer uses standard CORS origins to talk securely to the agent running at port <code>8001</code>.
            </p>

            <div className="agent-connect-panel">
              <div className="agent-connect-info">
                <div className="agent-connect-title">Loopback Connectivity Checker</div>
                <div className="agent-connect-desc">
                  {pingStatus === 'unchecked' && "Verify if your real local agent companion has loaded correctly."}
                  {pingStatus === 'checking' && "Sending loopback ping request to http://127.0.0.1:8001/health..."}
                  {pingStatus === 'connected' && "🎉 Connected! Your local companion agent is online, secure, and ready to compile!"}
                  {pingStatus === 'failed' && "⚠️ Unreachable. Make sure you pasted and executed step 2 inside your terminal and that Docker is running."}
                </div>
              </div>

              <button 
                className="ping-btn" 
                onClick={checkAgentHealth}
                disabled={pingStatus === 'checking'}
                style={{
                  background: pingStatus === 'connected' ? 'rgba(16, 185, 129, 0.12)' : pingStatus === 'failed' ? 'rgba(239, 68, 68, 0.12)' : '',
                  borderColor: pingStatus === 'connected' ? '#10b981' : pingStatus === 'failed' ? '#ef4444' : '',
                  color: pingStatus === 'connected' ? '#10b981' : pingStatus === 'failed' ? '#ef4444' : ''
                }}
              >
                {pingStatus === 'checking' ? 'Pinging...' : pingStatus === 'connected' ? '● Connected' : pingStatus === 'failed' ? 'Retry Connection' : 'Verify Agent'}
              </button>
            </div>
          </section>

          {/* STEP 4 */}
          <section ref={stepRefs[4]} className="step-card" onClick={() => setActiveStep(4)}>
            <div className="step-badge">Step 4</div>
            <h2 className="step-title">Start Orchestrating Container Ecosystems</h2>
            <p className="step-description">
              Amazing work! You are now fully configured to use 1-click orchestration inside our visual workspace. Go to the dashboard, configure your projects, and witness your application boot directly inside our build window.
            </p>

            <div className="agent-connect-panel" style={{ background: 'rgba(53, 116, 240, 0.03)', borderStyle: 'solid', borderColor: 'rgba(53, 116, 240, 0.1)' }}>
              <div className="agent-connect-info">
                <div className="agent-connect-title" style={{ color: '#4fa1ff' }}>Locked Behind Security boundaries</div>
                <div className="agent-connect-desc">
                  The local companion agent bounds exclusively to the loopback interface (<code>127.0.0.1</code>), completely sandboxing terminal access from external domains.
                </div>
              </div>
            </div>
          </section>

          {/* Bottom navigation flow triggers */}
          <div className="tutorial-bottom-bar">
            <button className="bottom-back-btn" onClick={() => onNavigate('landing')}>
              ← Back to Main Menu
            </button>
            <button className="bottom-next-btn" onClick={() => onNavigate('dashboard')}>
              Go to Visual Dashboard
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
