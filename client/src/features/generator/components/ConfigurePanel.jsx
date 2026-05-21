import React, { useState } from 'react';

const ConfigurePanel = ({
  styles,
  preferences,
  setPreferences,
  isRegenerating,
  handleRegenerate,
  regenError
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.sidebarSection}>
      <div 
        className={`${styles.sidebarHeader} ${styles.sidebarHeaderInteractive}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem', color: 'var(--keyword)' }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Configure & Tweak
        </div>
        <span className={`${styles.sidebarChevron} ${!isOpen ? styles.sidebarChevronCollapsed : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.sidebarCard}>
          <div className={styles.tweakField}>
            <label className={styles.tweakLabel}>Orchestration Target</label>
            <select 
              className={styles.tweakSelect}
              value={preferences.orchestration_target}
              onChange={(e) => setPreferences(prev => ({ ...prev, orchestration_target: e.target.value }))}
              disabled={isRegenerating}
            >
              <option value="compose">Docker Compose (Local/VPS)</option>
              <option value="kubernetes">Kubernetes (Production Cluster)</option>
            </select>
          </div>

          <div className={styles.tweakField}>
            <label className={styles.tweakLabel}>Base Image Type</label>
            <select 
              className={styles.tweakSelect}
              value={preferences.base_image_type}
              onChange={(e) => setPreferences(prev => ({ ...prev, base_image_type: e.target.value }))}
              disabled={isRegenerating}
            >
              <option value="default">Default / Recommended</option>
              <option value="alpine">Alpine-based (Ultra-light)</option>
              <option value="slim">Slim-based (Lightweight)</option>
            </select>
          </div>

          <div className={styles.tweakFieldRow}>
            <label className={styles.tweakSwitchLabel}>
              <input 
                type="checkbox"
                checked={preferences.enable_hot_reload}
                onChange={(e) => setPreferences(prev => ({ ...prev, enable_hot_reload: e.target.checked }))}
                disabled={isRegenerating}
              />
              <span className={styles.tweakSwitchText}>Dev Hot-Reloading</span>
            </label>
          </div>

          <div className={styles.tweakFieldRow}>
            <label className={styles.tweakSwitchLabel}>
              <input 
                type="checkbox"
                checked={preferences.pin_versions}
                onChange={(e) => setPreferences(prev => ({ ...prev, pin_versions: e.target.checked }))}
                disabled={isRegenerating}
              />
              <span className={styles.tweakSwitchText}>Pin Exact Versions</span>
            </label>
          </div>

          <button 
            className={styles.tweakBtn} 
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <span className={styles.tweakLoader}></span>
            ) : 'Apply & Regenerate'}
          </button>

          {regenError && (
            <div className={styles.tweakError}>{regenError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurePanel;
