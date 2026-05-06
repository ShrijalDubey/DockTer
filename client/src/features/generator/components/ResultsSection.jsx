import React from 'react';
import Editor from '@monaco-editor/react';

const ResultsSection = ({
  styles,
  result,
  selectedFile, setSelectedFile,
  setAppState,
  handleDownloadAll,
  handleCopy,
  copied,
  getLanguageFromFilename
}) => {
  const fileContent = result.files[selectedFile] || '';
  const language = getLanguageFromFilename(selectedFile);

  return (
    <>
      <div className={styles.resultsHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => setAppState('upload')}>←</button>
          <h2 className={styles.projectName}>{result.project_name}</h2>
        </div>
      </div>

      <div className={styles.panelsContainer}>
        <div className={styles.leftPanel}>

          <div className={styles.fileTree}>
            <div className={styles.treeSectionTitle}>Project Files</div>
            <div className={styles.treeFolder}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              {result.project_name}
            </div>
            <div className={styles.treeItems}>
              {Object.keys(result.files).map(fileName => (
                <div
                  key={fileName}
                  className={`${styles.fileItem} ${selectedFile === fileName ? styles.fileItemActive : ''}`}
                  onClick={() => setSelectedFile(fileName)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  {fileName}
                </div>
              ))}
            </div>

            <div className={styles.treeSectionTitle} style={{ marginTop: '1.5rem' }}>Tech Stack</div>
            <div className={styles.stackBadges}>
              {result.languages?.map((lang, i) => (
                <span key={`lang-${i}`} className={styles.stackBadge}>{lang}</span>
              ))}
              {result.frameworks?.map((fw, i) => (
                <span key={`fw-${i}`} className={styles.stackBadge}>{fw}</span>
              ))}
              {result.analysis_context?.has_db && (
                <span className={styles.stackBadge}>Database</span>
              )}
              {result.analysis_context?.has_redis && (
                <span className={styles.stackBadge}>Redis</span>
              )}
              {result.analysis_context?.has_celery && (
                <span className={styles.stackBadge}>Celery</span>
              )}
              {result.analysis_context?.has_nginx && (
                <span className={styles.stackBadge}>Nginx</span>
              )}
              {result.analysis_context?.ci_cd?.map((cicd, i) => (
                <span key={`cicd-${i}`} className={styles.stackBadge}>{cicd}</span>
              ))}
            </div>
          </div>

          <div className={styles.panelBottom}>
            <button className={styles.downloadBtn} onClick={handleDownloadAll}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Config
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.codeHeader}>
            <div className={styles.codeTabs}>
              <div className={styles.codeTabActive}>{selectedFile}</div>
            </div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className={styles.codeContent}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={fileContent}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 18,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'all',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsSection;
