import React, { useContext } from 'react';
import Dashboard from './pages/Dashboard/Dashboard';
import AuthModal from './features/auth/AuthModal';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.module.css'; 

const AppContent = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;
  }

  return (
    <>
      <Dashboard />
      <AuthModal />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
