import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { apiField, collectionFromResponse, decimalValue } from '../utils/portalData';

function isSameOrBefore7Days(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const value = String(dateStr).slice(0, 10);
  const isoDate = value.includes('/') ? value.split('/').reverse().join('-') : value;
  const venc = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(venc.getTime())) return false;
  const diff = (venc - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function formatCurrency(val) {
  const num = decimalValue(val);
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
        setVencidas(collectionFromResponse(v));
        setAVencer(collectionFromResponse(a).filter((f) => isSameOrBefore7Days(apiField(f, 'DTVENC'))));
      } catch {
        // silencioso
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (dismissed || (vencidas.length === 0 && aVencer.length === 0)) return null;

  const totalVencidas = vencidas.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);
  const totalAVencer = aVencer.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);

  return (
    <div className="relative">
      {vencidas.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-white"
          style={{ background: 'var(--color-pampa-600)' }}>
          <AlertTriangle size={15} className="shrink-0" />
          <span className="pr-8">
            <strong>{vencidas.length} fatura{vencidas.length > 1 ? 's' : ''} vencida{vencidas.length > 1 ? 's' : ''}</strong>
            {' '}— Total em aberto:{' '}
            <strong>{formatCurrency(totalVencidas)}</strong>
          </span>
        </div>
      )}

      {aVencer.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-white bg-amber-500">
          <Clock size={15} className="shrink-0" />
          <span className="pr-8">
            <strong>{aVencer.length} fatura{aVencer.length > 1 ? 's' : ''}</strong>
            {' '}vence{aVencer.length === 1 ? '' : 'm'} nos próximos 7 dias —{' '}
            <strong>{formatCurrency(totalAVencer)}</strong>
          </span>
        </div>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-white/70 hover:text-white transition-colors"
        aria-label="Fechar notificações"
      >
        <X size={15} />
      </button>
    </div>
  );
}
