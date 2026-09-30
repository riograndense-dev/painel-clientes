import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDoc, onlyDigits } from '../utils/formatters';
import PasswordField from '../components/PasswordField';
import { KeyRound, AlertCircle, CheckCircle, LogIn } from 'lucide-react';

/**
 * Troca de senha sem estar logado (tela "Esqueci minha senha").
 * API: PUT /portal/clientes/senha/recuperar
 *      PasswordUpdateNoLogin { numdoc, senha_antiga, nova_senha }
 */
export default function RecoverPassword() {
  const { recoverPassword } = useAuth();
  const navigate = useNavigate();

  const [numdoc, setNumdoc] = useState('');
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleDocChange(e) {
    setError(null);
    setNumdoc(formatDoc(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const raw = onlyDigits(numdoc);
    if (!raw) { setError('Informe seu CPF/CNPJ.'); return; }
    if (!senhaAntiga.trim()) { setError('Informe sua senha atual.'); return; }
    if (!novaSenha.trim()) { setError('Informe a nova senha.'); return; }
    if (novaSenha === senhaAntiga) { setError('A nova senha deve ser diferente da senha atual.'); return; }
    if (novaSenha !== confirmar) { setError('A confirmação não confere com a nova senha.'); return; }

    setLoading(true);
    try {
      await recoverPassword(raw, senhaAntiga, novaSenha);
      setSuccess(true);
      setSenhaAntiga('');
      setNovaSenha('');
      setConfirmar('');
    } catch (err) {
      setError(err?.message || 'Não foi possível alterar a senha.');
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
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-campeiro-50)', color: 'var(--color-campeiro-600)' }}>
                  <CheckCircle size={26} />
                </div>
                <h2 className="text-xl font-semibold"
                  style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
                  Senha alterada!
                </h2>
                <p className="text-sm mt-2 mb-6 leading-6" style={{ color: 'var(--color-grafite-soft)' }}>
                  Sua senha foi alterada com sucesso. Entre novamente usando a nova senha.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ background: 'var(--color-campeiro-700)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-campeiro-600)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-campeiro-700)'; }}
                >
                  <LogIn size={18} />
                  Ir para o login
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <KeyRound size={18} style={{ color: 'var(--color-campeiro-700)' }} />
                  <h2 className="text-xl font-semibold"
                    style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
                    Alterar senha
                  </h2>
                </div>
                <p className="text-sm text-center mb-6 leading-6" style={{ color: 'var(--color-grafite-soft)' }}>
                  Informe seu CPF/CNPJ, a senha atual e a nova senha desejada.
                </p>

                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-pampa-600)' }}>
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
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

                  <PasswordField
                    id="senha-atual"
                    label="Senha atual"
                    value={senhaAntiga}
                    onChange={(e) => { setError(null); setSenhaAntiga(e.target.value); }}
                    showPass={showPass}
                    onToggle={() => setShowPass((p) => !p)}
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <PasswordField
                    id="nova-senha"
                    label="Nova senha"
                    value={novaSenha}
                    onChange={(e) => { setError(null); setNovaSenha(e.target.value); }}
                    showPass={showPass}
                    onToggle={() => setShowPass((p) => !p)}
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <PasswordField
                    id="confirmar-senha"
                    label="Confirmar nova senha"
                    value={confirmar}
                    onChange={(e) => { setError(null); setConfirmar(e.target.value); }}
                    showPass={showPass}
                    onToggle={() => setShowPass((p) => !p)}
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
                    style={{ background: loading ? 'var(--color-campeiro-400)' : 'var(--color-campeiro-700)' }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-600)'; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-700)'; }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Alterar senha
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium hover:underline transition"
                    style={{ color: 'var(--color-campeiro-700)' }}
                  >
                    ← Voltar para o login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-grafite-soft)', opacity: 0.5 }}>
          Distribuidora de Alimentos Riograndense LTDA
        </p>
      </div>
    </div>
  );
}
