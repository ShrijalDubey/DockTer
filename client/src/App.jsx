import React, { useContext, useState } from 'react';
import Dashboard from './pages/Dashboard/Dashboard';
import LandingPage from './pages/LandingPage/LandingPage';
import CliTutorial from './pages/CliTutorial/CliTutorial';
import AuthModal from './features/auth/AuthModal';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.module.css'; 

const AppContent = () => {
  const { loading } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'tutorial'

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;
  }

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onNavigate={setCurrentView} />
      )}
      {currentView === 'tutorial' && (
        <CliTutorial onNavigate={setCurrentView} />
      )}
      {currentView === 'dashboard' && (
        <Dashboard 
          onNavigate={setCurrentView}
        />
      )}
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
