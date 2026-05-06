import { useState, useContext } from 'react';
import { generateFromUrl, generateFromZip, fetchProjectFiles } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import JSZip from 'jszip';

const extractErrorMessage = (err) => {
  return err?.response?.data?.detail
    || err?.message
    || 'Something went wrong. Please try again.';
};

export const useGenerator = () => {
  const { user, openAuthModal } = useContext(AuthContext);
  const [appState, setAppState] = useState('upload'); // 'upload' | 'loading' | 'results'
  const [inputType, setInputType] = useState(null);   // 'url' | 'zip'
  const [inputValue, setInputValue] = useState('');   // url string or File object
  const [result, setResult] = useState(null);         // API response object
  const [selectedFile, setSelectedFile] = useState(null); // currently previewed file
  const [error, setError] = useState(null);           // user-visible error message

  const clearError = () => setError(null);

  const handleUrlSubmit = async () => {
    if (!user) return openAuthModal();
    if (!inputValue || typeof inputValue !== 'string') return;
    clearError();
    setInputType('url');
    setAppState('loading');
    try {
      const res = await generateFromUrl(inputValue);
      setResult(res);
      setSelectedFile(Object.keys(res.files)[0]);
      setAppState('results');
      window.dispatchEvent(new Event('projectGenerated'));
    } catch (e) {
      console.error(e);
      setError(extractErrorMessage(e));
      setAppState('upload');
    }
  };

  const handleZipDrop = async (e) => {
    if (e.preventDefault) e.preventDefault();
    if (!user) return openAuthModal();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      clearError();
      setInputType('zip');
      setInputValue(file);
      setAppState('loading');
      try {
        const res = await generateFromZip(file);
        setResult(res);
        setSelectedFile(Object.keys(res.files)[0]);
        setAppState('results');
        window.dispatchEvent(new Event('projectGenerated'));
      } catch (err) {
        console.error(err);
        setError(extractErrorMessage(err));
        setAppState('upload');
      }
    }
  };

  const loadProject = async (project) => {
    clearError();
    setAppState('loading');
    try {
      const generatedFiles = await fetchProjectFiles(project.id);
      
      const filesMap = {};
      generatedFiles.forEach(f => {
        filesMap[f.file_name] = f.content;
      });

      const res = {
        project_id: project.id,
        project_name: project.name,
        languages: project.analysis_context?.languages || [],
        frameworks: project.analysis_context?.frameworks || [],
        files: filesMap,
        analysis_context: project.analysis_context,
      };

      setResult(res);
      setSelectedFile(Object.keys(res.files)[0]);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err));
      setAppState('upload');
    }
  };

  const handleDownloadAll = async () => {
    if (!result) return;
    const zip = new JSZip();
    Object.entries(result.files).forEach(([name, content]) => {
      zip.file(name, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.project_name}-docker.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
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
  };
};
