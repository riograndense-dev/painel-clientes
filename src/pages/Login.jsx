import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [numdoc, setNumdoc] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formata CPF/CNPJ enquanto digita
  function formatDoc(val) {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function handleDocChange(e) {
    setAuthError(null);
    setNumdoc(formatDoc(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove formatação antes de enviar
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-red-700 px-8 py-8 flex flex-col items-center gap-3">
            <img
              src="https://distribuidorariograndense.com.br/assets/logo-nova-B0BBOd_t.png"
              alt="Distribuidora Riograndense"
              className="h-14 object-contain drop-shadow"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="text-red-100 text-sm text-center">
              Portal do Cliente
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Acesse sua conta
            </h2>

            {authError && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="numdoc" className="block text-sm font-medium text-gray-700 mb-1">
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
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
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
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 disabled:bg-red-400
                  text-white font-semibold py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

        <p className="text-center text-xs text-gray-400 mt-6">
          Distribuidora de Alimentos Riograndense LTDA
        </p>
      </div>
    </div>
  );
}