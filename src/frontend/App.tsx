import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home';
import { Dashboard } from './pages/dashboard';
import { BoostPage } from './pages/boost';
import { BecomeBoosterPage } from './pages/become-booster';
import { useAuth } from './lib/auth-context';
import { ScrollToTop } from './components/scroll-to-top';
import { ScrollToTopButton } from './components/scroll-to-top-button';

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // While checking authentication status, show nothing
  if (isLoading) return null;
  
  // If not authenticated, redirect to homepage
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  // If authenticated, render the children
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/boost" element={
        <ProtectedRoute>
          <BoostPage />
        </ProtectedRoute>
      } />
      <Route path="/become-booster" element={
        <ProtectedRoute>
          <BecomeBoosterPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Router>
        <ScrollToTop />
        <AppRoutes />
        <ScrollToTopButton />
      </Router>
    </div>
  );
}

export default App;
