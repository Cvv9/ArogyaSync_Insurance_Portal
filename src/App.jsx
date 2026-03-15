// src/App.jsx — Root with auth-protected routes
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import VerifyEmail from './components/VerifyEmail';
import PatientLookup from './components/PatientLookup';
import ScanResults from './components/ScanResults';
import FraudResults from './components/FraudResults';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<PatientLookup />} />
              <Route path="/patient-lookup" element={<PatientLookup />} />
              <Route path="/scan-results" element={<ScanResults />} />
              <Route path="/results" element={<FraudResults />} />
              {/* Redirect old dashboard to patient lookup */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
