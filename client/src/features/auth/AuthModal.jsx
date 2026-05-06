import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

const AuthModal = () => {
  const { login, register, isAuthModalOpen, closeAuthModal } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      closeAuthModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/github/login`;
  };

  return (
    <div className={styles.modalOverlay} onClick={closeAuthModal}>
      <div className={styles.authCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeAuthModal}>&times;</button>
        
        <div className={styles.header}>
          <h1 className={styles.title}>DockerGen AI</h1>
          <p className={styles.subtitle}>
            {isLogin ? 'Welcome back. Sign in to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="developer"
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button className={styles.githubBtn} onClick={handleGithubLogin}>
          <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" data-view-component="true" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          Continue with GitHub
        </button>

        <div className={styles.toggleContainer}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            className={styles.toggleBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
