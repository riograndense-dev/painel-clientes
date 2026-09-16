import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

function MaintenanceScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-marfim)' }}>
      <section className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-lg p-8 text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-marfim-soft)', color: 'var(--color-campeiro-700)' }}>
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
          Em manutenção no momento
        </h1>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--color-grafite-soft)' }}>
          Este acesso está temporariamente indisponível. Tente novamente mais tarde.
        </p>
      </section>
    </main>
  );
}

export default function PrivateRoute() {
  const { token, client, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  const allowed = client?.permissao === true || client?.['permissão'] === true;
  return allowed ? <Outlet /> : <MaintenanceScreen />;
}
