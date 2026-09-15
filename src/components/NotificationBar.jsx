import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AlertTriangle, Clock, X } from 'lucide-react';

function isSameOrBefore7Days(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const venc = new Date(dateStr + 'T00:00:00');
  const diff = (venc - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function NotificationBar() {
  const { apiFetch } = useApi();
  const [vencidas, setVencidas] = useState([]);
  const [aVencer, setAVencer] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [v, a] = await Promise.all([
          apiFetch('/portal/me/faturas/vencidas'),
          apiFetch('/portal/me/faturas/a-vencer'),
        ]);
        setVencidas(v || []);
        // Apenas as que vencem nos próximos 7 dias
        setAVencer((a || []).filter((f) => isSameOrBefore7Days(f.DTVENC)));
      } catch {
        // silencioso — não interrompe o dashboard
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (dismissed || (vencidas.length === 0 && aVencer.length === 0)) return null;

  const totalVencidas = vencidas.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0);
  const totalAVencer = aVencer.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0);

  return (
    <div className="relative">
      {/* Vencidas */}
      {vencidas.length > 0 && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>{vencidas.length} fatura{vencidas.length > 1 ? 's' : ''} vencida{vencidas.length > 1 ? 's' : ''}</strong>
            {' '}— Total em aberto:{' '}
            <strong>{formatCurrency(totalVencidas)}</strong>
          </span>
        </div>
      )}

      {/* A vencer em 7 dias */}
      {aVencer.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-500 text-white px-4 py-3 text-sm">
          <Clock size={16} className="shrink-0" />
          <span>
            <strong>{aVencer.length} fatura{aVencer.length > 1 ? 's' : ''}</strong>
            {' '}vencem nos próximos 7 dias —{' '}
            <strong>{formatCurrency(totalAVencer)}</strong>
          </span>
        </div>
      )}

      {/* Fechar */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-white/70 hover:text-white transition"
        aria-label="Fechar notificações"
      >
        <X size={16} />
      </button>
    </div>
  );
}

