import { useState } from 'react';
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { apiField, decimalValue } from '../utils/portalData';

const NFE_URL = 'https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=';

function formatCurrency(val) {
  const num = decimalValue(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  // Suporte a ISO (YYYY-MM-DD) e DD/MM/YYYY direto da API
  const date = String(dateStr).slice(0, 10);
  if (date.includes('-')) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date; // já formatado
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

// Botão de copiar código de barras
function CopyBarcode({ code }) {
  const [copied, setCopied] = useState(false);

  if (!code) return <span className="text-gray-300 text-xs">—</span>;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para navegadores sem clipboard API
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="font-mono text-xs text-gray-600 truncate max-w-[120px] lg:max-w-[180px]" title={code}>
        {code}
      </span>
      <button
        onClick={handleCopy}
        title={copied ? 'Copiado!' : 'Copiar código de barras'}
        className="shrink-0 p-1 rounded transition-colors"
        style={{ color: copied ? 'var(--color-campeiro-500)' : 'var(--color-grafite-soft)', opacity: 0.7 }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <a
        href={NFE_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Verificar nota na Fazenda"
        className="shrink-0 p-1 rounded transition-colors"
        style={{ color: 'var(--color-grafite-soft)', opacity: 0.7 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <ExternalLink size={13} />
      </a>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Array}  props.faturas    - lista de PrestacaoResponse
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
                <p className="font-bold whitespace-nowrap" style={{ color: type === 'vencida' ? 'var(--color-pampa-600)' : 'var(--color-grafite)' }}>
                  {formatCurrency(apiField(f, 'VALOR'))}
                </p>
                <div className="mt-1"><StatusBadge type={type} /></div>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-xs">
              <div><dt className="text-gray-400">Emissão</dt><dd className="mt-0.5 text-gray-700">{formatDate(apiField(f, 'DTEMISSAO'))}</dd></div>
              {type === 'paga' && <div><dt className="text-gray-400">Baixa</dt><dd className="mt-0.5 text-gray-700">{formatDate(apiField(f, 'DTBAIXA'))}</dd></div>}
            </dl>
            {apiField(f, 'CODBARRA') && <div className="mt-3 border-t border-gray-100 pt-3"><CopyBarcode code={apiField(f, 'CODBARRA')} /></div>}
          </article>
        ))}
        <p className="px-1 text-right text-sm font-bold" style={{ color: 'var(--color-grafite)' }}>Total: {formatCurrency(total)}</p>
      </div>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="text-xs uppercase tracking-wider"
          style={{ background: 'var(--color-grafite)', color: 'rgb(180 200 170)' }}>
          <tr>
            <th className="px-4 py-3 text-left">Duplicata</th>
            <th className="px-4 py-3 text-left">Parcela</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Emissão</th>
            <th className="px-4 py-3 text-left">Vencimento</th>
            {type === 'paga' && <th className="px-4 py-3 text-left hidden md:table-cell">Baixa</th>}
            <th className="px-4 py-3 text-left">Status</th>
            {/* CODBARRA — campo futuro, já preparado */}
            <th className="px-4 py-3 text-left hidden lg:table-cell">Cód. Barras / NF-e</th>
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
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">
                {formatDate(apiField(f, 'DTEMISSAO'))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700">
                {formatDate(apiField(f, 'DTVENC'))}
              </td>
              {type === 'paga' && (
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden md:table-cell">
                  {formatDate(apiField(f, 'DTBAIXA'))}
                </td>
              )}
              <td className="px-4 py-3">
                <StatusBadge type={type} />
              </td>
              {/* CODBARRA — mostra quando disponível, já com botão copiar + link NFe */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <CopyBarcode code={apiField(f, 'CODBARRA') ?? null} />
              </td>
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
            <td colSpan={type === 'paga' ? 5 : 4} />
          </tr>
        </tfoot>
      </table>
      </div>
    </>
  );
}
