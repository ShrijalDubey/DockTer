import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchProjects, deleteProject } from '../../../services/api';

const SidebarNav = ({ styles, setAppState, loadProject, onNavigate }) => {
  const { user, openAuthModal } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);

  const loadProjects = () => {
    if (user) {
      fetchProjects().then(data => {
        setProjects(data);
      }).catch(err => {
        console.error("Failed to fetch projects", err);
      });
    } else {
      setProjects([]);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId)
        .then(() => {
          loadProjects();
          window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId } }));
        })
        .catch(err => {
          console.error("Failed to delete project", err);
        });
    }
  };

  // Fetch on mount / user change
  useEffect(() => {
    loadProjects();
  }, [user]);

  // Re-fetch when a new project is generated
  useEffect(() => {
    const handleNewProject = () => loadProjects();
    window.addEventListener('projectGenerated', handleNewProject);
    return () => window.removeEventListener('projectGenerated', handleNewProject);
  }, [user]);

  return (
    <div className={styles.bodySection}>
      <button className={styles.newBtn} onClick={() => {
        setAppState('upload');
      }}>
        <div className={styles.newIconBg}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span className={`${styles.navText} ${styles.navTextBold}`}>New Project</span>
      </button>

      {onNavigate && (
        <button 
          className={styles.newBtn} 
          onClick={() => onNavigate('tutorial')}
          style={{ 
            marginTop: '0.5rem', 
            background: 'rgba(139, 92, 246, 0.08)', 
            borderColor: 'rgba(139, 92, 246, 0.2)',
          }}
          title="Setup DockTer Local Companion Agent"
        >
          <div className={styles.newIconBg} style={{ background: '#8b5cf6', boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <span className={`${styles.navText} ${styles.navTextBold}`} style={{ color: '#c084fc' }}>CLI Agent Guide</span>
        </button>
      )}

      <div className={styles.recentSection}>
        <div className={styles.sectionTitle}>Recent Projects</div>
        
        {!user ? (
          <div className={styles.navItem} onClick={openAuthModal} style={{ cursor: 'pointer', opacity: 0.7 }}>
            <span className={styles.navText}>Log in to view history</span>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.navItem} style={{ opacity: 0.7 }}>
            <span className={styles.navText}>No recent projects</span>
          </div>
        ) : (
          <nav className={styles.navMenu}>
            {projects.map(project => (
              <div 
                key={project.id} 
                className={styles.navItem} 
                onClick={() => loadProject(project)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.itemIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className={styles.navText}>{project.name}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  title="Delete project"
                  aria-label="Delete project"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default SidebarNav;
