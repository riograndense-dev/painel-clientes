import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Loader2, UserCircle } from 'lucide-react';
import { apiField, collectionFromResponse } from '../utils/portalData';

export default function SellerCard() {
  const { client } = useAuth();
  const { apiFetch } = useApi();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // codusur pode vir de /portal/me como CODUSUR, codusur, ou dentro de um objeto cliente
      const clientRecord = client?.cliente || client?.client || client;
      const portalSeller = clientRecord?.vendedor || clientRecord?.seller;
      if (portalSeller) {
        setSeller(portalSeller);
        setLoading(false);
        return;
      }
      const codusur = apiField(clientRecord, 'CODUSUR');
      if (!codusur) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/user/?codusur=${codusur}`);
        const list = collectionFromResponse(data);
        if (list.length > 0) {
          setSeller(list[0]);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (client) load();
  }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: 'var(--color-grafite-soft)', opacity: 0.5 }}>
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando dados do vendedor...
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="text-center py-16 text-sm" style={{ color: 'var(--color-grafite-soft)', opacity: 0.5 }}>
        Nenhum vendedor responsável encontrado.
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
        {/* Faixa decorativa com gradiente do site */}
        <div className="h-20" style={{
          background: 'linear-gradient(135deg, var(--color-grafite) 0%, var(--color-campeiro-700) 100%)'
        }} />

        {/* Avatar + informações */}
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center"
            style={{ background: 'var(--color-campeiro-50)' }}>
            <UserCircle size={52} style={{ color: 'var(--color-campeiro-600)' }} />
          </div>

          <h3 className="mt-3 text-xl font-bold" style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
            {apiField(seller, 'NOME') || `Vendedor ${apiField(seller, 'CODUSUR')}`}
          </h3>
          <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--color-campeiro-600)' }}>
            <User size={13} />
            Representante de Vendas
          </p>

          <div className="mt-4 space-y-2 pt-4" style={{ borderTop: '1px solid var(--color-marfim-soft)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-grafite-soft)' }}>
              <span className="text-xs uppercase tracking-wide w-20 font-semibold" style={{ opacity: 0.5 }}>Código</span>
              <span className="font-mono">{apiField(seller, 'CODUSUR') || '—'}</span>
            </div>
            {apiField(seller, 'FONE') && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-grafite-soft)' }}>
                <Phone size={14} style={{ opacity: 0.5 }} />
                <span>{apiField(seller, 'FONE')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
