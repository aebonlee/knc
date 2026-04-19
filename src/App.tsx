import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { lazy, Suspense, type ReactNode } from 'react';

const Home = lazy(() => import('./pages/Home'));
const CompanyList = lazy(() => import('./pages/CompanyList'));
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Report = lazy(() => import('./pages/Report'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-loading"><div className="spinner" /></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
        <Route path="/companies" element={<AuthGuard><CompanyList /></AuthGuard>} />
        <Route path="/companies/:id" element={<AuthGuard><CompanyDetail /></AuthGuard>} />
        <Route path="/risk-analysis" element={<AuthGuard><RiskAnalysis /></AuthGuard>} />
        <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
        <Route path="/report" element={<AuthGuard><Report /></AuthGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
