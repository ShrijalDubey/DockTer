export const getLanguageFromFilename = (filename) => {
  if (!filename) return 'plaintext';
  if (filename.toLowerCase().includes('dockerfile')) return 'dockerfile';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.sh')) return 'shell';
  return 'plaintext';
};
