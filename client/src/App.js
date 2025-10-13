import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardView from "./components/DashboardView";
import NeoPressDashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MainView from "./pages/MainView";
import { authService } from "./services/api";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        await authService.me(); 
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    window.location.href = '/dashboard';
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
        
          <Route path="/login" element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } />
          
          <Route path="/" element={<MainView />} />
          <Route path="/main" element={<MainView />} />
          <Route path="/website" element={<MainView />} />

         
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <NeoPressDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <NeoPressDashboard />
            </ProtectedRoute>
          } />

      
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}


export default App;
