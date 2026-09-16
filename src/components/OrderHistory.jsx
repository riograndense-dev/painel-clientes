import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ShoppingBag, ChevronDown, ChevronUp, Package, Loader2, CalendarDays } from 'lucide-react';
import { apiField, collectionFromResponse, decimalValue } from '../utils/portalData';

const API_URL = import.meta.env.VITE_API_URL;

function formatCurrency(val) {
  const num = decimalValue(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const value = String(dateStr).slice(0, 10);
  if (value.includes('/')) return value;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const items = collectionFromResponse({ items: order.itens || order.items || order.ITENS || order.ITEMS });
  const total = items.reduce(
    (sum, item) => sum + decimalValue(apiField(item, 'PVENDA')) * Number(apiField(item, 'QTVEN') || 1),
    0,
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
      {/* Header do pedido */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-50 rounded-lg p-2">
            <ShoppingBag size={18} className="text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Pedido #{apiField(order, 'NUMPED') || '—'}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <CalendarDays size={12} />
              {formatDate(apiField(order, 'DTEMISSAO') || order.data)}
              {apiField(order, 'CODFILIAL') && (
                <span className="ml-2 text-gray-300">|</span>
              )}
              {apiField(order, 'CODFILIAL') && (
                <span>Filial {apiField(order, 'CODFILIAL')}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{formatCurrency(total || apiField(order, 'VALOR') || order.PVENDA)}</p>
            <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          </div>
          <div className="text-gray-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Itens do pedido */}
      {expanded && items.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50 p-2 sm:block sm:p-0 sm:divide-y sm:divide-gray-100">
          {items.map((rawItem, idx) => {
            const item = {
              ...rawItem,
              CODPROD: apiField(rawItem, 'CODPROD'),
              DESCRPROD: apiField(rawItem, 'DESCRPROD'),
              QTVEN: apiField(rawItem, 'QTVEN'),
              PVENDA: apiField(rawItem, 'PVENDA'),
              UNIDADE: apiField(rawItem, 'UNIDADE'),
              IMAGEM: apiField(rawItem, 'IMAGEM'),
            };
            return (
              <div key={idx} className="sm:contents">
                <div className="sm:hidden">
                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex gap-3">
                      <ProductImage item={item} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-5 text-gray-900 line-clamp-2">
                          {apiField(item, 'DESCRPROD') || `Produto ${apiField(item, 'CODPROD') || '—'}`}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">Cód. {apiField(item, 'CODPROD') || '—'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-2">
                      <p className="text-xs text-gray-500">Qtd. <strong className="text-gray-700">{apiField(item, 'QTVEN') || 1}</strong>{apiField(item, 'UNIDADE') && ` ${apiField(item, 'UNIDADE')}`}</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{formatCurrency(decimalValue(apiField(item, 'PVENDA')) * Number(apiField(item, 'QTVEN') || 1))}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(apiField(item, 'PVENDA'))}/un</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 px-5 py-3">
                {/* Imagem do produto (via iSA se disponível) */}
                <ProductImage item={item} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {apiField(item, 'DESCRPROD') || `Produto ${apiField(item, 'CODPROD') || '—'}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cód: {item.CODPROD} — Qtd: {item.QTVEN || item.quantidade || 1}
                    {apiField(item, 'UNIDADE') && ` ${apiField(item, 'UNIDADE')}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency(decimalValue(apiField(item, 'PVENDA')) * Number(apiField(item, 'QTVEN') || 1))}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(apiField(item, 'PVENDA'))}/un
                  </p>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && items.length === 0 && (
        <div className="px-5 py-4 text-sm text-gray-400 text-center bg-gray-50 border-t border-gray-100">
          Nenhum item detalhado disponível.
        </div>
      )}
    </div>
  );
}

// Componente de imagem com fallback para ícone
function ProductImage({ item }) {
  const [imgSrc] = useState(apiField(item, 'IMAGEM') || null);
  const [error, setError] = useState(false);

  if (error || !imgSrc) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
        <Package size={20} className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={apiField(item, 'DESCRPROD') || 'Produto'}
      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
      onError={() => setError(true)}
    />
  );
}

export default function OrderHistory() {
  const { apiFetch } = useApi();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  async function loadPage(p) {
    setLoading(true);
    try {
      const data = await apiFetch(`/portal/me/pedidos?limite=${LIMIT}&pagina=${p}`);
      const list = collectionFromResponse(data);
      if (p === 1) {
        setOrders(list);
      } else {
        setOrders((prev) => [...prev, ...list]);
      }
      setHasMore(list.length === LIMIT);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPage(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando pedidos...
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhum pedido encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, i) => (
        <OrderCard key={apiField(order, 'NUMPED') || i} order={order} />
      ))}

      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
