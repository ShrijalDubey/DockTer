import React, { useEffect, useContext } from 'react';
import FloatingBackground from './FloatingBackground';
import { AuthContext } from '../../../context/AuthContext';

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
  const { user } = useContext(AuthContext);

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/github/login`;
  };

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
        <h1 className={styles.headline}>Generate Production-Ready<span style={{ color: '#147eef' }}> Docker Environments </span>in Seconds</h1>
        <p className={styles.subline}>
          <span className={styles.desktopText}>Automatically containerize your codebase. Drop a GitHub link or source archive below to instantly generate optimal Docker configurations.</span>
          <span className={styles.mobileText}>Containerize codebases instantly. Drop a link or ZIP archive below to generate optimal Docker configurations.</span>
        </p>

        <div className={styles.greetingSection}>
          {!user ? (
            <button className={styles.githubLoginBtn} onClick={handleGithubLogin}>
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              Login with GitHub
            </button>
          ) : (
            <div className={styles.userGreeting}>
              {user.avatar_url && (
                <img src={user.avatar_url} alt={user.username} className={styles.userGreetingAvatar} />
              )}
              <span>Welcome back, <strong>{user.username}</strong></span>
            </div>
          )}
        </div>

        <div className={styles.cardsRow}>
          <div className={styles.uploadCard}>
            <div className={styles.cardLabel}>From GitHub</div>
            
            <div className={styles.dropContent} style={{ pointerEvents: 'auto', marginBottom: '-1rem' }}>
              <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              <div className={styles.dropTitle}>Link a Repository</div>
              <div className={styles.dropSub}>
                <span className={styles.desktopText}>Paste your GitHub URL for instant analysis</span>
                <span className={styles.mobileText}>Paste a GitHub URL to start</span>
              </div>
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
              <div className={styles.dropTitle}>
                <span className={styles.desktopText}>Drop your ZIP archive here</span>
                <span className={styles.mobileText}>Upload a ZIP Archive</span>
              </div>
              <div className={styles.dropSub}>
                <span className={styles.desktopText}>or click to browse filesystem</span>
                <span className={styles.mobileText}>or tap to select archive</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default UploadSection;

