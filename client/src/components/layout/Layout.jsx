import React from 'react';
import Sidebar from './Sidebar/Sidebar';

const Layout = ({ children, isSidebarOpen, toggleSidebar, setAppState, loadProject, onNavigate }) => {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        setAppState={setAppState}
        loadProject={loadProject}
        onNavigate={onNavigate}
      />
      <div 
        style={{ 
          paddingLeft: isSidebarOpen ? 'var(--sidebar-width)' : '76px',
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
