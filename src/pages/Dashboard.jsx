import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NotificationBar from '../components/NotificationBar';
import InvoiceTable from '../components/InvoiceTable';
import OrderHistory from '../components/OrderHistory';
import SellerCard from '../components/SellerCard';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ShoppingBag,
  User,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SectionTitle({ icon: Icon, label, color = 'text-gray-700' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2 rounded-xl ${color === 'text-red-600' ? 'bg-red-50' : color === 'text-amber-600' ? 'bg-amber-50' : color === 'text-green-600' ? 'bg-green-50' : 'bg-gray-100'}`}>
        <Icon size={20} className={color} />
      </div>
      <h2 className="text-lg font-bold text-gray-800">{label}</h2>
    </div>
  );
}

// Card de resumo financeiro
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${colors[color]}`}>
      <div className="p-3 rounded-xl bg-white shadow-sm">
        <Icon size={20} className={`text-${color === 'red' ? 'red' : color === 'amber' ? 'amber' : color === 'green' ? 'green' : 'gray'}-600`} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-lg font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Dashboard principal
// ──────────────────────────────────────────────
export default function Dashboard() {
  const { client } = useAuth();
  const { apiFetch } = useApi();
  const [activeSection, setActiveSection] = useState('pagas');

  const [faturas, setFaturas] = useState({ pagas: [], vencidas: [], aVencer: [] });
  const [loadingFaturas, setLoadingFaturas] = useState({
    pagas: true, vencidas: true, aVencer: true,
  });

  useEffect(() => {
    async function loadAll() {
      const [pagas, vencidas, aVencer] = await Promise.allSettled([
        apiFetch('/portal/me/faturas/pagas'),
        apiFetch('/portal/me/faturas/vencidas'),
        apiFetch('/portal/me/faturas/a-vencer'),
      ]);

      setFaturas({
        pagas: pagas.status === 'fulfilled' ? (pagas.value || []) : [],
        vencidas: vencidas.status === 'fulfilled' ? (vencidas.value || []) : [],
        aVencer: aVencer.status === 'fulfilled' ? (aVencer.value || []) : [],
      });
      setLoadingFaturas({ pagas: false, vencidas: false, aVencer: false });
    }
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalVencidas = faturas.vencidas.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0);
  const totalAVencer = faturas.aVencer.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0);
  const totalPagas = faturas.pagas.reduce((s, f) => s + (parseFloat(f.VALOR) || 0), 0);

  const clientName = client?.CLIENTE || client?.nome || 'Cliente';

  // Navega até a seção e realiza scroll suave
  function handleNavigate(id) {
    if (['pagas', 'vencidas', 'a-vencer'].includes(id)) {
      setActiveSection(id);
    } else {
      setActiveSection(id);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <Navbar active={activeSection} onNavigate={handleNavigate} />

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* ── Notification bar (abaixo da topbar mobile) ── */}
        <div className="mt-14 lg:mt-0 sticky top-0 z-10">
          <NotificationBar />
        </div>

        {/* ── Page content ── */}
        <main className="flex-1 px-4 py-6 lg:px-8 max-w-7xl w-full mx-auto">

          {/* Saudação */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {clientName.split(' ')[0]}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Acompanhe seus pedidos e faturas em um só lugar.
            </p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button onClick={() => handleNavigate('vencidas')} className="text-left focus:outline-none">
              <SummaryCard
                icon={TrendingDown}
                label="Em atraso"
                value={formatCurrency(totalVencidas)}
                color="red"
              />
            </button>
            <button onClick={() => handleNavigate('a-vencer')} className="text-left focus:outline-none">
              <SummaryCard
                icon={TrendingUp}
                label="A vencer"
                value={formatCurrency(totalAVencer)}
                color="amber"
              />
            </button>
            <button onClick={() => handleNavigate('pagas')} className="text-left focus:outline-none">
              <SummaryCard
                icon={Wallet}
                label="Total pago"
                value={formatCurrency(totalPagas)}
                color="green"
              />
            </button>
          </div>

          {/* ── Seções ── */}

          {/* FATURAS PAGAS */}
          {activeSection === 'pagas' && (
            <section>
              <SectionTitle icon={CheckCircle} label="Faturas Pagas" color="text-green-600" />
              <InvoiceTable
                faturas={faturas.pagas}
                type="paga"
                loading={loadingFaturas.pagas}
                emptyText="Nenhuma fatura paga encontrada."
              />
            </section>
          )}

          {/* FATURAS VENCIDAS */}
          {activeSection === 'vencidas' && (
            <section>
              <SectionTitle icon={AlertTriangle} label="Faturas Vencidas" color="text-red-600" />
              <InvoiceTable
                faturas={faturas.vencidas}
                type="vencida"
                loading={loadingFaturas.vencidas}
                emptyText="Nenhuma fatura vencida. Parabéns! 🎉"
              />
            </section>
          )}

          {/* FATURAS A VENCER */}
          {activeSection === 'a-vencer' && (
            <section>
              <SectionTitle icon={Clock} label="Faturas a Vencer" color="text-amber-600" />
              <InvoiceTable
                faturas={faturas.aVencer}
                type="a-vencer"
                loading={loadingFaturas.aVencer}
                emptyText="Nenhuma fatura a vencer no momento."
              />
            </section>
          )}

          {/* HISTÓRICO DE PEDIDOS */}
          {activeSection === 'pedidos' && (
            <section>
              <SectionTitle icon={ShoppingBag} label="Histórico de Pedidos" color="text-gray-700" />
              <OrderHistory />
            </section>
          )}

          {/* MEU VENDEDOR */}
          {activeSection === 'vendedor' && (
            <section>
              <SectionTitle icon={User} label="Meu Vendedor" color="text-gray-700" />
              <SellerCard />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}