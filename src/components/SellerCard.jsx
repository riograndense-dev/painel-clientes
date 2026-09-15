import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Loader2, UserCircle } from 'lucide-react';

export default function SellerCard() {
  const { client } = useAuth();
  const { apiFetch } = useApi();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // codusur pode vir diretamente de /portal/me como CODUSUR ou codusur
      const codusur = client?.CODUSUR || client?.codusur;
      if (!codusur) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/user/?codusur=${codusur}`);
        const list = Array.isArray(data) ? data : [];
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
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando dados do vendedor...
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhum vendedor responsável encontrado.
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
        {/* Header decorativo */}
        <div className="h-20 bg-gradient-to-r from-red-700 to-red-500" />

        {/* Avatar + nome */}
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow flex items-center justify-center">
            <UserCircle size={52} className="text-red-600" />
          </div>

          <h3 className="mt-3 text-xl font-bold text-gray-900">
            {seller.NOME || seller.nome || `Vendedor ${seller.CODUSUR}`}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
            <User size={13} />
            Representante de Vendas
          </p>

          {/* Info adicional se disponível */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-400 text-xs uppercase tracking-wide w-20">Código</span>
              <span>{seller.CODUSUR}</span>
            </div>
            {(seller.FONE || seller.telefone) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{seller.FONE || seller.telefone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

