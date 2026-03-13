// src/App.jsx — Root with route structure + error boundary
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PatientLookup from './components/PatientLookup';
import FraudResults from './components/FraudResults';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PatientLookup />} />
            <Route path="/results" element={<FraudResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
