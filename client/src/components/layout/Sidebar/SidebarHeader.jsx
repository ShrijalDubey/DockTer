import React from 'react';

const SidebarHeader = ({ styles, toggleSidebar }) => {
  return (
    <div className={styles.header}>
      <button onClick={toggleSidebar} className={styles.toggleBtn} title="Toggle Sidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
      </button>

      <div className={styles.logoWrap}>
        <span className={styles.logoText}>DockTer</span>
      </div>
    </div>
  );
};

export default SidebarHeader;
