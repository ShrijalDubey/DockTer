import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const SidebarFooter = ({ styles }) => {
  const { user, logout, openAuthModal } = useContext(AuthContext);

  return (
    <div className={styles.bottomSection}>


      {user ? (
        <div className={styles.userProfile}>
          <div className={styles.userInfo} title={user.email || user.username}>
            <div className={styles.itemIconWrap}>
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className={styles.userAvatar}
                />
              ) : (
                <div className={styles.avatar}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              )}
            </div>
            <span className={`${styles.navText} ${styles.navTextBold}`}>{user.username}</span>
          </div>
          <button 
            className={styles.logoutBtn} 
            onClick={logout}
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      ) : (
        <div 
          className={styles.navItem} 
          onClick={openAuthModal} 
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.itemIconWrap}>
            <div className={styles.avatar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          <span className={`${styles.navText} ${styles.navTextBold}`}>Sign in</span>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
