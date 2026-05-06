import React, { useEffect } from 'react';
import FloatingBackground from './FloatingBackground';

const UploadSection = ({
  styles,
  inputType, setInputType,
  inputValue, setInputValue,
  handleUrlSubmit,
  handleZipDrop,
  isDragOver, setIsDragOver,
  error, clearError
}) => {
  const fileInputRef = React.useRef(null);

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 6000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  return (
    <>
      <FloatingBackground />

      {error && (
        <div className={styles.errorBanner}>
          <svg className={styles.errorBannerIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span className={styles.errorBannerText}>{error}</span>
          <button className={styles.errorBannerClose} onClick={clearError}>&times;</button>
        </div>
      )}

      <div className={styles.uploadContainer}>
        <h1 className={styles.headline}>Generate Production-Ready<span style={{ color: '#147eef' }}> Docker Environments </span> in Seconds</h1>
        <p className={styles.subline}>Automatically containerize your codebase. Drop a GitHub link or source archive below to instantly generate optimal Docker configurations.</p>

        <div className={styles.cardsRow}>
          <div className={styles.uploadCard}>
            <div className={styles.cardLabel}>From GitHub</div>
            
            <div className={styles.dropContent} style={{ pointerEvents: 'auto', marginBottom: '-1rem' }}>
              <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              <div className={styles.dropTitle}>Link a Repository</div>
              <div className={styles.dropSub}>Paste your GitHub URL for instant analysis</div>
            </div>

            <div className={styles.urlInputWrap}>
              <input
                type="text"
                className={styles.urlInput}
                placeholder="https://github.com/username/repo"
                value={inputType === 'url' ? inputValue : (typeof inputValue === 'string' ? inputValue : '')}
                onChange={(e) => {
                  setInputType('url');
                  setInputValue(e.target.value);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit(); }}
              />
            </div>
            <button className={styles.generateBtn} onClick={handleUrlSubmit}>Analyze & Generate</button>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          <div
            className={`${styles.uploadCard} ${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleZipDrop(e); }}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".zip" 
              style={{ display: 'none' }} 
              onChange={handleZipDrop} 
            />
            <div className={styles.cardLabel}>From Source Archive</div>
            <div className={styles.dropContent}>
              <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div className={styles.dropTitle}>Drop your ZIP archive here</div>
              <div className={styles.dropSub}>or click to browse filesystem</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadSection;

