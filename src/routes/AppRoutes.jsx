import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoutes';
import Login from '../pages/Login';
import RecoverPassword from '../pages/RecoverPassword';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

// Redireciona / → /dashboard se autenticado, /login se não
function HomeRedirect() {
  const { token, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecoverPassword />} />

          {/* Rotas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
