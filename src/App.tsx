import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PhaseProvider } from './contexts/PhaseContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { lazy, Suspense, type ReactNode } from 'react';
import type { KncRole } from './types';

const Home = lazy(() => import('./pages/Home'));
const CompanyList = lazy(() => import('./pages/CompanyList'));
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Report = lazy(() => import('./pages/Report'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Formulas = lazy(() => import('./pages/Formulas'));
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));

const Loading = () => <div className="page-loading"><div className="spinner" /></div>;

function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading, isPending } = useAuth();
  if (loading) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isPending) return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

function RoleGuard({ allowed, children }: { allowed: KncRole[]; children: ReactNode }) {
  const { isLoggedIn, loading, kncRole, isPending } = useAuth();
  if (loading) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isPending) return <Navigate to="/pending" replace />;
  if (!kncRole || !allowed.includes(kncRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PendingGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading, isPending } = useAuth();
  if (loading) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isPending) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { loading, isCompanyMember, companyId } = useAuth();
  if (loading) return <Loading />;
  if (isCompanyMember && companyId) {
    return <Navigate to={`/companies/${companyId}/dashboard`} replace />;
  }
  return <Home />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pending" element={<PendingGuard><PendingApproval /></PendingGuard>} />
        <Route path="/about" element={<About />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/" element={<AuthGuard><HomeRedirect /></AuthGuard>} />
        <Route path="/companies" element={<AuthGuard><CompanyList /></AuthGuard>} />
        <Route path="/companies/:id" element={<AuthGuard><CompanyDetail /></AuthGuard>} />
        <Route path="/companies/:id/dashboard" element={<AuthGuard><CompanyDashboard /></AuthGuard>} />
        <Route path="/risk-analysis" element={<AuthGuard><RiskAnalysis /></AuthGuard>} />
        <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
        <Route path="/report" element={<AuthGuard><Report /></AuthGuard>} />
        <Route path="/admin/users" element={<RoleGuard allowed={['superadmin']}><UserManagement /></RoleGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PhaseProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
        </PhaseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
