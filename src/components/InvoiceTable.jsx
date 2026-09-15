import { Loader2 } from 'lucide-react';

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function StatusBadge({ type }) {
  if (type === 'paga') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Paga
    </span>
  );
  if (type === 'vencida') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      Vencida
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      A Vencer
    </span>
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

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Duplicata</th>
            <th className="px-4 py-3 text-left">Parcela</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3 text-left">Emissão</th>
            <th className="px-4 py-3 text-left">Vencimento</th>
            {type === 'paga' && <th className="px-4 py-3 text-left">Baixa</th>}
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {faturas.map((f, i) => (
            <tr key={`${f.DUPLIC}-${f.PREST}-${i}`} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-mono font-medium text-gray-900">{f.DUPLIC}</td>
              <td className="px-4 py-3 text-gray-500">{f.PREST || '—'}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {formatCurrency(f.VALOR)}
              </td>
              <td className="px-4 py-3">{formatDate(f.DTEMISSAO)}</td>
              <td className="px-4 py-3">{formatDate(f.DTVENC)}</td>
              {type === 'paga' && <td className="px-4 py-3">{formatDate(f.DTBAIXA)}</td>}
              <td className="px-4 py-3">
                <StatusBadge type={type === 'a-vencer' ? 'a-vencer' : type} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t border-gray-200">
          <tr>
            <td colSpan={type === 'paga' ? 2 : 2} className="px-4 py-3 text-xs text-gray-500">
              {faturas.length} registro{faturas.length !== 1 ? 's' : ''}
            </td>
            <td className="px-4 py-3 text-right font-bold text-gray-900">
              {formatCurrency(faturas.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0))}
            </td>
            <td colSpan={type === 'paga' ? 4 : 3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

