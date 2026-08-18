import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';

function Application() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <LoginPage />;
}

export default function App() {
  return <AuthProvider><Application /></AuthProvider>;
}
