import { useState } from 'react';
import { Loader2, Loader, Printer, AlertCircle } from 'lucide-react';
import { apiField, decimalValue } from '../utils/portalData';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

function formatCurrency(val) {
  const num = decimalValue(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = String(dateStr).slice(0, 10);
  if (date.includes('-')) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date;
}

function StatusBadge({ type }) {
  if (type === 'paga') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: 'var(--color-campeiro-50)', color: 'var(--color-campeiro-700)' }}>
      Paga
    </span>
  );
  if (type === 'vencida') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: '#fef2f2', color: 'var(--color-pampa-600)' }}>
      Vencida
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
      A Vencer
    </span>
  );
}

/**
 * Garante que uma URL retornada pela API seja absoluta.
 * Se for caminho relativo (ex: "/boleto/sicredi?..."), prefixa com API_URL.
 */
function toAbsoluteUrl(url) {
  if (!url) return null;
  // Já é absoluta (http:// ou https://)
  if (/^https?:\/\//i.test(url)) return url;
  // Caminho relativo — prefixa com a base da API
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Verdadeiro quando a URL do boleto aponta para a própria API (relativa ou com a
 * mesma origem de VITE_API_URL). Nesses casos o PDF exige JWT e o parâmetro
 * download=true — abrir em nova aba sem autenticação falharia.
 */
function isOwnApiUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  // Caminho relativo (ex: "/boleto/sicredi?...") → prefixado com API_URL
  if (!/^https?:\/\//i.test(rawUrl)) return true;
  return Boolean(API_URL) && rawUrl.startsWith(API_URL);
}

/** Garante download=true na querystring de um endpoint da API. */
function withDownloadFlag(absUrl) {
  if (!absUrl) return absUrl;
  try {
    const url = new URL(absUrl);
    url.searchParams.set('download', 'true');
    return url.toString();
  } catch {
    if (absUrl.includes('download=')) return absUrl;
    return `${absUrl}${absUrl.includes('?') ? '&' : '?'}download=true`;
  }
}

/**
 * Extrai a mensagem de erro devolvida pela API.
 * "detail" pode ser string (erro de negócio) ou lista (erro de validação 422).
 */
function boletoErrorMessage(body, fallback) {
  const detail = body?.detail ?? body?.error ?? body?.message;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const msg = detail[0]?.msg;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

/**
 * Botão de impressão do boleto Sicredi.
 *
 * Prioridade:
 *  1. BOLETO_URL / url_boleto apontando para a própria API
 *     → GET (com JWT) + download=true
 *  2. LINHADIG → GET {API_URL}/boleto/sicredi?linha_digitavel=...&download=true
 *  3. BOLETO_URL externa (CDN/banco) → link direto em nova aba
 *
 * Não é renderizado em faturas pagas. Quando nenhum campo está presente,
 * renderiza "—".
 */
function BoletoButton({ fatura, type }) {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rawBoletoUrl = apiField(fatura, 'BOLETO_URL');
  const linhadigRaw  = apiField(fatura, 'LINHADIG');
  const linhadig     = linhadigRaw === undefined || linhadigRaw === null
    ? ''
    : String(linhadigRaw).trim();
  const boletoUrl    = toAbsoluteUrl(rawBoletoUrl);

  // Faturas pagas não precisam do boleto para pagamento
  if (type === 'paga') return null;

  // Sem dados para gerar boleto
  if (!boletoUrl && !linhadig) {
    return <span className="text-gray-300 text-xs select-none">—</span>;
  }

  // Endpoint autenticado que devolve o PDF (sempre com download=true)
  const endpoint = boletoUrl && isOwnApiUrl(rawBoletoUrl)
    ? withDownloadFlag(boletoUrl)
    : linhadig
      ? `${API_URL}/boleto/sicredi?linha_digitavel=${encodeURIComponent(linhadig)}&download=true`
      : null;

  // URL de terceiros (não exige JWT) → abre direto em nova aba
  const externalUrl = endpoint ? null : boletoUrl;

  // URL de terceiros (não exige JWT) — abre em nova aba
  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir boleto (PDF)"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: 'var(--color-campeiro-50)',
          color: 'var(--color-campeiro-700)',
          border: '1px solid var(--color-campeiro-200)',
        }}
      >
        <Printer size={13} />
        Imprimir
      </a>
    );
  }

  // Endpoint autenticado (sempre com download=true) → baixa o PDF via fetch
  async function handleDownload() {
    if (loading || !endpoint) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf, application/json',
        },
      });

      // Token inválido/expirado → encerra a sessão e avisa o usuário
      if (res.status === 401 || res.status === 403) {
        await logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(boletoErrorMessage(
          body,
          `Não foi possível gerar o boleto (erro ${res.status}). Tente novamente mais tarde.`,
        ));
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      if (contentType.includes('application/json')) {
        // API devolveu JSON: pode ser um erro de negócio ou a URL do PDF
        const data = await res.json().catch(() => null);
        if (data?.detail || data?.error || data?.message) {
          throw new Error(boletoErrorMessage(data, 'Não foi possível gerar o boleto.'));
        }
        const redirect = toAbsoluteUrl(data?.url || data?.boleto_url || data?.pdf_url);
        if (redirect) { window.open(redirect, '_blank', 'noopener,noreferrer'); return; }
        throw new Error('A API não retornou o PDF do boleto. Tente novamente mais tarde.');
      }

      if (contentType.includes('text/html')) {
        throw new Error('A API não retornou o PDF do boleto. Tente novamente mais tarde.');
      }

      // PDF como blob → dispara download no browser
      const blob = await res.blob();
      if (!blob.size) throw new Error('O PDF do boleto retornou vazio. Tente novamente mais tarde.');

      const prest = apiField(fatura, 'PREST');
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `boleto-${apiField(fatura, 'DUPLIC') ?? 'sicredi'}${prest ? `-${prest}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch (err) {
      console.error('[BoletoButton]', err);
      setError(err?.message || 'Não foi possível gerar o boleto. Tente novamente ou contate o suporte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        title="Baixar/imprimir boleto Sicredi (PDF)"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
        style={{
          background: 'var(--color-campeiro-50)',
          color: 'var(--color-campeiro-700)',
          border: '1px solid var(--color-campeiro-200)',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-200)'; }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-campeiro-50)'; }}
      >
        {loading ? <Loader size={13} className="animate-spin" /> : <Printer size={13} />}
        {loading ? 'Aguarde…' : 'Imprimir'}
      </button>

      {error && (
        <span
          role="alert"
          className="inline-flex items-start gap-1 max-w-[200px] text-[11px] leading-4"
          style={{ color: 'var(--color-pampa-600)' }}
        >
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}

/**
 * @param {Object}  props
 * @param {Array}   props.faturas    - lista de PrestacaoResponse
 * @param {'paga'|'vencida'|'a-vencer'} props.type
 * @param {boolean} props.loading
 * @param {string}  props.emptyText
 */
export default function InvoiceTable({ faturas = [], type, loading, emptyText }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando faturas...
      </div>
    );
  }

  if (!faturas.length) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        {emptyText || 'Nenhuma fatura encontrada.'}
      </div>
    );
  }

  const total = faturas.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);

  return (
    <>
      {/* ── Mobile: cards ── */}
      <div className="sm:hidden space-y-3">
        {faturas.map((f, i) => (
          <article key={`${apiField(f, 'DUPLIC')}-${apiField(f, 'PREST')}-${i}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-gray-900">
                  {apiField(f, 'DUPLIC') ?? '—'}{apiField(f, 'PREST') ? ` · ${apiField(f, 'PREST')}` : ''}
                </p>
                <p className="mt-1 text-xs text-gray-500">Vence em {formatDate(apiField(f, 'DTVENC'))}</p>
              </div>
              <div className="text-right">
                <p className="font-bold whitespace-nowrap"
                  style={{ color: type === 'vencida' ? 'var(--color-pampa-600)' : 'var(--color-grafite)' }}>
                  {formatCurrency(apiField(f, 'VALOR'))}
                </p>
                <div className="mt-1"><StatusBadge type={type} /></div>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-xs">
              <div><dt className="text-gray-400">Emissão</dt><dd className="mt-0.5 text-gray-700">{formatDate(apiField(f, 'DTEMISSAO'))}</dd></div>
              {type === 'paga' && <div><dt className="text-gray-400">Baixa</dt><dd className="mt-0.5 text-gray-700">{formatDate(apiField(f, 'DTBAIXA'))}</dd></div>}
            </dl>
            {/* Boleto no card mobile (oculto em faturas pagas) */}
            {type !== 'paga' && (apiField(f, 'LINHADIG') || apiField(f, 'BOLETO_URL')) && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <BoletoButton fatura={f} type={type} />
              </div>
            )}
          </article>
        ))}
        <p className="px-1 text-right text-sm font-bold" style={{ color: 'var(--color-grafite)' }}>
          Total: {formatCurrency(total)}
        </p>
      </div>

      {/* ── Desktop: tabela ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="text-xs uppercase tracking-wider"
            style={{ background: 'var(--color-grafite)', color: 'rgb(180 200 170)' }}>
            <tr>
              <th className="px-4 py-3 text-left">Duplicata</th>
              <th className="px-4 py-3 text-left">Parcela</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-left">Emissão</th>
              <th className="px-4 py-3 text-left">Vencimento</th>
              {type === 'paga' && <th className="px-4 py-3 text-left">Baixa</th>}
              <th className="px-4 py-3 text-left">Status</th>
              {/* Faturas pagas não precisam do boleto de pagamento */}
              {type !== 'paga' && <th className="px-4 py-3 text-left">Boleto</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {faturas.map((f, i) => (
              <tr key={`${apiField(f, 'DUPLIC')}-${apiField(f, 'PREST')}-${i}`}
                className="hover:bg-gray-50 transition-colors duration-100">
                <td className="px-4 py-3 font-mono font-semibold text-gray-900 whitespace-nowrap">
                  {apiField(f, 'DUPLIC') ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {apiField(f, 'PREST') ?? '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap"
                  style={{ color: type === 'vencida' ? 'var(--color-pampa-600)' : 'var(--color-grafite)' }}>
                  {formatCurrency(apiField(f, 'VALOR'))}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatDate(apiField(f, 'DTEMISSAO'))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700">
                  {formatDate(apiField(f, 'DTVENC'))}
                </td>
                {type === 'paga' && (
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(apiField(f, 'DTBAIXA'))}
                  </td>
                )}
                <td className="px-4 py-3">
                  <StatusBadge type={type} />
                </td>
                {/* ── Coluna Boleto (substitui Cód. Barras / NF-e) ── */}
                {type !== 'paga' && (
                  <td className="px-4 py-3">
                    <BoletoButton fatura={f} type={type} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200"
            style={{ background: 'var(--color-marfim-soft)' }}>
            <tr>
              <td colSpan={2} className="px-4 py-3 text-xs text-gray-500">
                {faturas.length} registro{faturas.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {formatCurrency(total)}
              </td>
              {/* Duplicata+Parcela e Valor preenchidos; restante: Vencimento, [Baixa], Status, [Boleto] */}
              <td colSpan={4} />
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
