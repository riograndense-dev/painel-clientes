import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordField from './PasswordField';
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Troca de senha do cliente logado.
 * API: PUT /portal/clientes/senha — PasswordUpdate { senha_antiga?, nova_senha }
 */
export default function ChangePassword() {
  const { updatePassword } = useAuth();

  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function validate() {
    if (!senhaAntiga.trim()) return 'Informe sua senha atual.';
    if (!novaSenha.trim()) return 'Informe a nova senha.';
    if (novaSenha === senhaAntiga) return 'A nova senha deve ser diferente da senha atual.';
    if (novaSenha !== confirmar) return 'A confirmação não confere com a nova senha.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(senhaAntiga, novaSenha);
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
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Cabeçalho do card */}
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2.5 rounded-xl shrink-0"
            style={{ background: 'var(--color-campeiro-50)', color: 'var(--color-campeiro-700)' }}>
            <KeyRound size={22} />
          </div>
          <p className="text-sm mt-1.5 leading-5" style={{ color: 'var(--color-grafite-soft)' }}>
            Atualize a senha usada para acessar o Portal do Cliente.
          </p>
        </div>

        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'var(--color-campeiro-50)', border: '1px solid var(--color-campeiro-200)', color: 'var(--color-campeiro-700)' }}>
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <span>Senha alterada com sucesso! Na próxima vez, use a nova senha para entrar.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-pampa-600)' }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
}
