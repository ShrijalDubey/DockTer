import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { regenerateFiles } from '../../../services/api';

import FileSidebarList from './FileSidebarList';
import TechStackBadges from './TechStackBadges';
import ConfigurePanel from './ConfigurePanel';
import LocalOrchestrationPanel from './LocalOrchestrationPanel';


const ResultsSection = ({
  styles,
  result,
  setResult,
  selectedFile, setSelectedFile,
  setAppState,
  handleDownloadAll,
  handleCopy,
  copied,
  getLanguageFromFilename
}) => {
  const [preferences, setPreferences] = useState({
    base_image_type: 'default',
    enable_hot_reload: false,
    pin_versions: false,
    orchestration_target: 'compose'
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState(null);

  const [agentConnected, setAgentConnected] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState([]);
  const [activeEventSource, setActiveEventSource] = useState(null);
  const [showQuickstart, setShowQuickstart] = useState(false);

  const consoleEndRef = useRef(null);

  // Probes local agent every 5s in the background
  useEffect(() => {
    let intervalId;
    const checkAgent = async () => {
      try {
        const res = await fetch('http://localhost:8001/health');
        if (res.ok) {
          const data = await res.json();
          setAgentConnected(data.status === 'ok');
        } else {
          setAgentConnected(false);
        }
      } catch (err) {
        setAgentConnected(false);
      }
    };

    checkAgent();
    intervalId = setInterval(checkAgent, 5000);
    return () => {
      clearInterval(intervalId);
      if (activeEventSource) {
        activeEventSource.close();
      }
    };
  }, [activeEventSource]);

  // Auto-scrolls console output when logs arrive
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deployLogs]);

  const handleLocalDeploy = async () => {
    if (isDeploying) return;
    
    setIsDeploying(true);
    setDeployLogs(['🐳 Writing files and triggering local container orchestration...']);

    try {
      const response = await fetch('http://localhost:8001/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: result.files,
          project_name: result.project_name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to deploy project.');
      }

      const data = await response.json();
      setDeployLogs(prev => [
        ...prev,
        `📂 Workspace: ${data.workspace}`,
        '🚀 Initializing docker-compose environment in the background...',
        '📡 Connecting to log stream...',
      ]);

      // Connect to Live logs streaming using Server-Sent Events (SSE)
      if (activeEventSource) {
        activeEventSource.close();
      }

      const eventSource = new EventSource(`http://localhost:8001/logs/${result.project_name}`);
      setActiveEventSource(eventSource);

      eventSource.onmessage = (event) => {
        setDeployLogs((prev) => [...prev, event.data]);
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsDeploying(false);
      };
    } catch (err) {
      setDeployLogs((prev) => [...prev, `❌ Deployment failed: ${err.message}`]);
      setIsDeploying(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const generatedFiles = await regenerateFiles(result.project_id, preferences);
      
      const filesMap = {};
      generatedFiles.forEach(f => {
        filesMap[f.file_name] = f.content;
      });

      setResult(prev => ({
        ...prev,
        files: filesMap
      }));

      // Keep active file selection if it exists in the new generated files; otherwise, select the first
      const fileNames = Object.keys(filesMap);
      if (fileNames.length > 0) {
        if (!fileNames.includes(selectedFile)) {
          setSelectedFile(fileNames[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setRegenError(err?.response?.data?.detail || err?.message || 'Regeneration failed. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

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
            <FileSidebarList
              styles={styles}
              result={result}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />

            <TechStackBadges
              styles={styles}
              result={result}
            />

            <ConfigurePanel
              styles={styles}
              preferences={preferences}
              setPreferences={setPreferences}
              isRegenerating={isRegenerating}
              handleRegenerate={handleRegenerate}
              regenError={regenError}
            />

            <LocalOrchestrationPanel
              styles={styles}
              agentConnected={agentConnected}
              showQuickstart={showQuickstart}
              setShowQuickstart={setShowQuickstart}
              handleLocalDeploy={handleLocalDeploy}
              isDeploying={isDeploying}
              preferences={preferences}
              deployLogs={deployLogs}
              setDeployLogs={setDeployLogs}
              consoleEndRef={consoleEndRef}
            />
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
