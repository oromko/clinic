import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/index.css';

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1) || '/dashboard';
      setCurrentPath(path);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading FMCS...</p>
      </div>
    );
  }

  if (!user) {
    return currentPath === '/register' ? <Register /> : <Login />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      default:
        return (
          <div className="main-content">
            <div className="card">
              <h2 className="page-title">Page Under Construction</h2>
              <p>The {currentPath} page is being developed.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        {renderPage()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
