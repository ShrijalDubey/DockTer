import React from 'react';

const LoadingSection = ({ styles }) => {
  return (
    <>
      <div className={styles.resultsHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.skeletonText} style={{ width: '120px', height: '24px' }}></div>
        </div>
      </div>
      <div className={styles.panelsContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.fileTree}>
            <div className={styles.skeletonBlock} style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
            <div className={styles.skeletonBlock} style={{ width: '90%', height: '16px', marginBottom: '8px' }}></div>
            <div className={styles.skeletonBlock} style={{ width: '60%', height: '16px', marginBottom: '24px' }}></div>

            <div className={styles.skeletonBlock} style={{ width: '40%', height: '12px', marginBottom: '12px' }}></div>
            <div className={styles.skeletonBlock} style={{ width: '70%', height: '20px', borderRadius: '12px', marginBottom: '8px' }}></div>
            <div className={styles.skeletonBlock} style={{ width: '60%', height: '20px', borderRadius: '12px' }}></div>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.codeHeader}>
            <div className={styles.skeletonText} style={{ width: '150px', height: '16px' }}></div>
          </div>
          <div className={styles.codeContent} style={{ padding: '1.5rem' }}>
            <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
      <div className={styles.debuggingOverlay}>
        <div className={styles.debuggingBox}>
          <div className={styles.waterFill}></div>
          <div className={styles.debuggingText}> Generating ....</div>
        </div>
      </div>
    </>
  );
};

export default LoadingSection;
