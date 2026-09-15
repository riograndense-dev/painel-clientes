import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Hook que retorna uma função `apiFetch` para chamadas autenticadas à API.
 * Usa o token JWT do contexto de auth automaticamente.
 */
export function useApi() {
  const { token, logout } = useAuth();

  async function apiFetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
      await logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail || `Erro ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return null;

    return res.json();
  }

  return { apiFetch };
}

