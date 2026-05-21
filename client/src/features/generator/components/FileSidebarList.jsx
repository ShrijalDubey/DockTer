import React, { useState } from 'react';

const FileSidebarList = ({ styles, result, selectedFile, setSelectedFile }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.sidebarSection}>
      <div 
        className={`${styles.sidebarHeader} ${styles.sidebarHeaderInteractive}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem', color: 'var(--keyword)' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          Project Files
        </div>
        <span className={`${styles.sidebarChevron} ${!isOpen ? styles.sidebarChevronCollapsed : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.sidebarCard}>
          <div className={styles.treeFolder}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--function)' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            {result.project_name}
          </div>
          <div className={styles.treeItems}>
            {Object.keys(result.files).map(fileName => (
              <div
                key={fileName}
                className={`${styles.fileItem} ${selectedFile === fileName ? styles.fileItemActive : ''}`}
                onClick={() => setSelectedFile(fileName)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                {fileName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSidebarList;
