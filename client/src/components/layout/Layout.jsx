import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';

const Layout = ({ children, isSidebarOpen, toggleSidebar, closeSidebar, setAppState, loadProject, onNavigate }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)', position: 'relative' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        closeSidebar={closeSidebar}
        setAppState={setAppState}
        loadProject={loadProject}
        onNavigate={onNavigate}
      />

      {/* Backdrop overlay for mobile drawer */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Floating Hamburger Toggle for Mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 98,
            background: 'rgba(15, 15, 20, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'white',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      <div 
        style={{ 
          paddingLeft: isMobile ? '0' : (isSidebarOpen ? 'var(--sidebar-width)' : '76px'),
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
