import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { routesConfig } from './routes';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Guard for checking session authentication status
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout wrapping the sidebar, top navbar, main body content, and footer
const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="app-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div className="main-content">
        <Navbar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <main style={{ flexGrow: 1, position: 'relative' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {routesConfig.map((route, index) => {
        if (route.isProtected) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute>
                  <AppLayout>{route.element}</AppLayout>
                </ProtectedRoute>
              }
            />
          );
        } else {
          return (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          );
        }
      })}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
