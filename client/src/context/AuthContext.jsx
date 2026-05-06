import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check for token in URL (from GitHub OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, "/");
    }

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
          setIsAuthModalOpen(false); // Close modal if open
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    // OAuth2PasswordRequestForm expects form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token } = res.data;
    localStorage.setItem('token', access_token);
    
    // Fetch user details
    const userRes = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(userRes.data);
  };

  const register = async (username, password) => {
    await apiClient.post('/auth/register', { username, password });
    // Automatically login after registration
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, loading, 
      isAuthModalOpen, openAuthModal, closeAuthModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
