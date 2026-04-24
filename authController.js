import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><div className="splash-spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><div className="splash-spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
