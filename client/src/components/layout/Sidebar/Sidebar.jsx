import React from 'react';
import styles from './Sidebar.module.css';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';

const Sidebar = ({ isOpen, toggleSidebar, setAppState, loadProject }) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? '' : styles.collapsed}`}>
      <div className={styles.sidebarInner}>
        <SidebarHeader styles={styles} toggleSidebar={toggleSidebar} />
        <SidebarNav styles={styles} setAppState={setAppState} loadProject={loadProject} />
        <SidebarFooter styles={styles} />
      </div>
    </aside>
  );
};

export default Sidebar;
