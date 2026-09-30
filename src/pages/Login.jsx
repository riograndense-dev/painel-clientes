import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { formatDoc } from '../utils/formatters';

export default function Login() {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [numdoc, setNumdoc] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleDocChange(e) {
    setAuthError(null);
    setNumdoc(formatDoc(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const raw = numdoc.replace(/\D/g, '');
      await login(raw, password);
      navigate('/dashboard', { replace: true });
    } catch {
      // erro já setado no AuthContext
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-marfim)' }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header com cores do site */}
          <div className="px-8 py-8 flex flex-col items-center gap-3"
            style={{ background: 'var(--color-campeiro-400)' }}>
            <img
              src="https://distribuidorariograndense.com.br/assets/logo-nova-B0BBOd_t.png"
              alt="Distribuidora Riograndense"
              className="h-14 object-contain drop-shadow"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="text-sm text-center" style={{ color: 'var(--color-marfim)' }}>
              Portal do Cliente
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-center mb-6"
              style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
              Acesse sua conta
            </h2>

            {authError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-pampa-600)' }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="numdoc" className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-grafite)' }}>
                  CPF / CNPJ
                </label>
                <input
                  id="numdoc"
                  type="text"
                  value={numdoc}
                  onChange={handleDocChange}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': 'var(--color-campeiro-500)' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium"
                    style={{ color: 'var(--color-grafite)' }}>
                    Senha
                  </label>
                  <Link
                    to="/recuperar-senha"
                    className="text-xs font-medium hover:underline transition"
                    style={{ color: 'var(--color-campeiro-700)' }}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setAuthError(null); setPassword(e.target.value); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:border-transparent transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
                style={{
                  background: loading ? 'var(--color-campeiro-400)' : 'var(--color-campeiro-700)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-600)'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-700)'; }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-grafite-soft)', opacity: 0.5 }}>
          Distribuidora de Alimentos Riograndense LTDA
        </p>
      </div>
    </div>
  );
}