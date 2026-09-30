import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

// "detail" da API pode ser uma string ou uma lista de erros de validação (422)
function apiErrorMessage(body, fallback) {
  const detail = body?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const msg = detail[0]?.msg;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('portal_token'));
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchMe = useCallback(async (tok) => {
    try {
      const res = await fetch(`${API_URL}/portal/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) throw new Error('Sessão expirada');
      const data = await res.json();
      setClient(data);
    } catch {
      // Token inválido — limpar estado
      localStorage.removeItem('portal_token');
      setToken(null);
      setClient(null);
    }
  }, []);

  // Na montagem, validar token salvo
  useEffect(() => {
    if (token) {
      fetchMe(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function login(numdoc, password) {
    setAuthError(null);
    const formData = new URLSearchParams();
    formData.append('numdoc', numdoc);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/portal/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.detail || 'CPF/CNPJ ou senha inválidos.';
      setAuthError(msg);
      throw new Error(msg);
    }

    const data = await res.json();
    const tok = data.access_token;
    localStorage.setItem('portal_token', tok);
    setToken(tok);
    await fetchMe(tok);
  }

  async function logout() {
    if (token) {
      await fetch(`${API_URL}/portal/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('portal_token');
    setToken(null);
    setClient(null);
  }

  // ── Troca de senha do cliente logado ──
  // PUT /portal/clientes/senha — PasswordUpdate { senha_antiga?, nova_senha }
  async function updatePassword(senhaAntiga, novaSenha) {
    const res = await fetch(`${API_URL}/portal/clientes/senha`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ senha_antiga: senhaAntiga, nova_senha: novaSenha }),
    });

    if (res.status === 401) {
      await logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(apiErrorMessage(body, 'Não foi possível alterar a senha.'));
    }

    return res.json().catch(() => true);
  }

  // ── Troca de senha sem estar logado ──
  // PUT /portal/clientes/senha/recuperar — PasswordUpdateNoLogin { numdoc, senha_antiga, nova_senha }
  async function recoverPassword(numdoc, senhaAntiga, novaSenha) {
    const res = await fetch(`${API_URL}/portal/clientes/senha/recuperar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numdoc, senha_antiga: senhaAntiga, nova_senha: novaSenha }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(apiErrorMessage(body, 'Não foi possível alterar a senha. Verifique os dados informados.'));
    }

    return res.json().catch(() => true);
  }

  return (
    <AuthContext.Provider value={{ token, client, loading, authError, login, logout, updatePassword, recoverPassword, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

