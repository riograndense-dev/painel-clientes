import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ShoppingBag, ChevronDown, ChevronUp, Package, Loader2, CalendarDays } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const items = order.itens || order.items || [];
  const total = items.reduce((s, i) => s + (parseFloat(i.PVENDA || i.preco || 0) * (i.QTVEN || i.quantidade || 1)), 0);

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
            <p className="text-sm font-semibold text-gray-900">Pedido #{order.NUMPED || order.numped}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <CalendarDays size={12} />
              {formatDate(order.DTEMISSAO || order.data)}
              {order.CODFILIAL && (
                <span className="ml-2 text-gray-300">|</span>
              )}
              {order.CODFILIAL && (
                <span>Filial {order.CODFILIAL}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{formatCurrency(total || order.PVENDA)}</p>
            <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          </div>
          <div className="text-gray-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Itens do pedido */}
      {expanded && items.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
          {items.map((item, idx) => {
            const imgUrl = item.CODPROD
              ? `${API_URL}/catalog?busca=${item.CODPROD}&page_size=1`
              : null;

            return (
              <div key={idx} className="flex items-center gap-4 px-5 py-3">
                {/* Imagem do produto (via iSA se disponível) */}
                <ProductImage item={item} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.DESCRPROD || item.descricao || `Produto ${item.CODPROD}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cód: {item.CODPROD} — Qtd: {item.QTVEN || item.quantidade || 1}
                    {item.UNIDADE && ` ${item.UNIDADE}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency((parseFloat(item.PVENDA || 0)) * (item.QTVEN || 1))}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.PVENDA || 0)}/un
                  </p>
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
  const [imgSrc, setImgSrc] = useState(item.IMAGEM || item.imagem || null);
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
      alt={item.DESCRPROD || 'Produto'}
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
      const list = Array.isArray(data) ? data : (data?.items || data?.pedidos || []);
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
        <OrderCard key={order.NUMPED || order.numped || i} order={order} />
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

