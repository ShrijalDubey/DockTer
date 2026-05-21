import React, { useState } from 'react';

const LocalOrchestrationPanel = ({
  styles,
  agentConnected,
  showQuickstart,
  setShowQuickstart,
  handleLocalDeploy,
  isDeploying,
  preferences,
  deployLogs,
  setDeployLogs,
  consoleEndRef
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.sidebarSection}>
      <div 
        className={`${styles.sidebarHeader} ${styles.sidebarHeaderInteractive}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem', color: 'var(--keyword)' }}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
          Local Orchestration
        </div>
        <span className={`${styles.sidebarChevron} ${!isOpen ? styles.sidebarChevronCollapsed : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.sidebarCard}>
          <div className={styles.orchestrateStatusRow}>
            <span className={styles.orchestrateLabel}>Agent Connection</span>
            {agentConnected ? (
              <span className={styles.statusConnected}>● Connected</span>
            ) : (
              <span className={styles.statusOffline}>○ Offline</span>
            )}
          </div>

          <div 
            className={styles.quickstartToggle} 
            onClick={() => setShowQuickstart(!showQuickstart)}
          >
            <span className={styles.quickstartToggleText}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem', color: 'var(--keyword)', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Quickstart & Setup Guide
            </span>
            <span className={styles.quickstartArrow}>{showQuickstart ? '▼' : '▶'}</span>
          </div>

          {showQuickstart && (
            <div className={styles.quickstartBody}>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepText}>
                  <strong>Docker Desktop:</strong> Ensure Docker is running in the background.
                </div>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepText}>
                  <strong>Start Local Companion:</strong> Launch the agent in your terminal to activate loopback container bindings:
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.75rem' }}>Option A: PyPI Registry</div>
                  <div className={styles.agentCodeBlock}>
                    uvx --from dockter-agent dockter-agent start
                  </div>
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.75rem' }}>Option B: Cloned Local Repository</div>
                  <div className={styles.agentCodeBlock}>
                    uvx --from ./agent dockter-agent start
                  </div>
                </div>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepText}>
                  <strong>One-Click Deploy:</strong> Once the status above glows <span className={styles.inlineConnected}>● Connected</span>, click the deploy button to orchestrate and stream container compilation logs live!
                </div>
              </div>
            </div>
          )}

          <button
            className={styles.orchestrateBtn}
            onClick={handleLocalDeploy}
            disabled={!agentConnected || isDeploying || preferences.orchestration_target === 'kubernetes'}
            title={preferences.orchestration_target === 'kubernetes' ? "Local Kubernetes orchestration is planned for future agent releases. Please select Docker Compose to deploy locally." : ""}
          >
            {isDeploying ? (
              <span className={styles.tweakLoader}></span>
            ) : 'Deploy via Local Docker'}
          </button>
          {preferences.orchestration_target === 'kubernetes' && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center', fontStyle: 'italic', lineHeight: '1.4' }}>
              Note: Local K8s orchestration is planned for future agent releases. Use Docker Compose for local testing.
            </div>
          )}

          {deployLogs.length > 0 && (
            <div className={styles.consoleContainer}>
              <div className={styles.consoleHeader}>
                <span>Build Console</span>
                <button 
                  className={styles.consoleClearBtn} 
                  onClick={() => setDeployLogs([])}
                  disabled={isDeploying}
                >
                  Clear
                </button>
              </div>
              <div className={styles.consoleOutput}>
                {deployLogs.map((log, index) => (
                  <div key={index} className={styles.consoleLine}>
                    {log}
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalOrchestrationPanel;
