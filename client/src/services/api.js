import apiClient from './apiClient';

/**
 * Helper to format the backend responses into the structure expected by the UI.
 */
const formatResult = (project, generatedFiles) => {
  const filesMap = {};
  generatedFiles.forEach(f => {
    filesMap[f.file_name] = f.content;
  });

  return {
    project_id: project.id,
    project_name: project.name,
    languages: project.analysis_context?.languages || [],
    frameworks: project.analysis_context?.frameworks || [],
    files: filesMap,
    analysis_context: project.analysis_context,
  };
};

export async function generateFromUrl(url) {
  // 1. Analyze
  const analyzeRes = await apiClient.post('/analyze/github', { url });
  const project = analyzeRes.data;

  // 2. Generate
  const generateRes = await apiClient.post(`/generate/${project.id}`);
  const generatedFiles = generateRes.data;

  return formatResult(project, generatedFiles);
}

export async function generateFromZip(file) {
  const form = new FormData();
  form.append('file', file);
  
  // 1. Analyze
  const analyzeRes = await apiClient.post('/analyze/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const project = analyzeRes.data;

  // 2. Generate
  const generateRes = await apiClient.post(`/generate/${project.id}`);
  const generatedFiles = generateRes.data;

  return formatResult(project, generatedFiles);
}

export async function fetchProjects() {
  const res = await apiClient.get('/projects');
  return res.data;
}

export async function fetchProjectFiles(projectId) {
  const res = await apiClient.get(`/projects/${projectId}/files`);
  return res.data;
}

export async function deleteProject(projectId) {
  const res = await apiClient.delete(`/projects/${projectId}`);
  return res.data;
}

export async function regenerateFiles(projectId, preferences) {
  const res = await apiClient.post(`/generate/${projectId}`, preferences);
  return res.data;
}
