import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import styles from '../../features/generator/generator.module.css';
import { useGenerator } from '../../hooks/useGenerator';
import UploadSection from '../../features/generator/components/UploadSection';
import LoadingSection from '../../features/generator/components/LoadingSection';
import ResultsSection from '../../features/generator/components/ResultsSection';
import { getLanguageFromFilename } from '../../utils/fileHelpers';

const Dashboard = () => {
  const {
    appState, setAppState,
    inputType, setInputType,
    inputValue, setInputValue,
    result, setResult,
    selectedFile, setSelectedFile,
    error, clearError,
    handleUrlSubmit,
    handleZipDrop,
    handleDownloadAll,
    loadProject
  } = useGenerator();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result && selectedFile) {
      navigator.clipboard.writeText(result.files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (appState === 'loading') {
    return (
      <Layout 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        setAppState={setAppState}
        loadProject={loadProject}
      >
        <main className={styles.resultsArea}>
          <LoadingSection styles={styles} />
        </main>
      </Layout>
    );
  }

  if (appState === 'results' && result) {
    return (
      <Layout 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        setAppState={setAppState}
        loadProject={loadProject}
      >
        <main className={styles.resultsArea}>
          <ResultsSection 
            styles={styles}
            result={result}
            setResult={setResult}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setAppState={setAppState}
            handleDownloadAll={handleDownloadAll}
            handleCopy={handleCopy}
            copied={copied}
            getLanguageFromFilename={getLanguageFromFilename}
          />
        </main>
      </Layout>
    );
  }

  return (
    <Layout 
      isSidebarOpen={isSidebarOpen} 
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      setAppState={setAppState}
      loadProject={loadProject}
    >
      <main className={styles.mainArea}>
        <UploadSection 
          styles={styles}
          inputType={inputType}
          setInputType={setInputType}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleUrlSubmit={handleUrlSubmit}
          handleZipDrop={handleZipDrop}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          error={error}
          clearError={clearError}
        />
      </main>
    </Layout>
  );
};

export default Dashboard;
