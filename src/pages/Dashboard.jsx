import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NotificationBar from '../components/NotificationBar';
import InvoiceTable from '../components/InvoiceTable';
import OrderHistory from '../components/OrderHistory';
import SellerCard from '../components/SellerCard';
import { apiField, collectionFromResponse, decimalValue } from '../utils/portalData';
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
  const num = decimalValue(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SectionTitle({ icon: Icon, label, color }) {
  const styles = {
    red: { bg: '#fef2f2', ico: 'var(--color-pampa-300)' },
    amber: { bg: '#fffbeb', ico: '#d97706' },
    green: { bg: 'var(--color-campeiro-50)', ico: 'var(--color-campeiro-600)' },
    gray: { bg: 'var(--color-marfim-soft)', ico: 'var(--color-grafite-soft)' },
  };
  const s = styles[color] || styles.gray;
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl" style={{ background: s.bg }}>
        <Icon size={20} style={{ color: s.ico }} />
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-grafite)' }}>{label}</h2>
    </div>
  );
}

// Card de resumo financeiro
function SummaryCard({ icon: Icon, label, value, color, onClick }) {
  const styles = {
    red: {
      wrap: { background: '#fef2f2', borderColor: '#fecaca', color: 'var(--color-pampa-600)' },
      ico: 'var(--color-pampa-600)',
    },
    amber: {
      wrap: { background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' },
      ico: '#d97706',
    },
    green: {
      wrap: { background: 'var(--color-campeiro-50)', borderColor: 'var(--color-campeiro-200)', color: 'var(--color-campeiro-700)' },
      ico: 'var(--color-campeiro-600)',
    },
  };
  const s = styles[color] || styles.green;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none"
      style={s.wrap}
    >
      <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
        <Icon size={20} style={{ color: s.ico }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-xl font-bold mt-0.5 truncate">{value}</p>
      </div>
    </button>
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
        pagas: pagas.status === 'fulfilled' ? collectionFromResponse(pagas.value) : [],
        vencidas: vencidas.status === 'fulfilled' ? collectionFromResponse(vencidas.value) : [],
        aVencer: aVencer.status === 'fulfilled' ? collectionFromResponse(aVencer.value) : [],
      });
      setLoadingFaturas({ pagas: false, vencidas: false, aVencer: false });
    }
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalVencidas = faturas.vencidas.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);
  const totalAVencer = faturas.aVencer.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);
  const totalPagas = faturas.pagas.reduce((s, f) => s + decimalValue(apiField(f, 'VALOR')), 0);

  // Primeiro nome do cliente
  const firstName = (client?.CLIENTE || client?.nome || 'Cliente').split(' ')[0];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-marfim)' }}>
      {/* ── Sidebar ── */}
      <Navbar active={activeSection} onNavigate={setActiveSection} />

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* ── Barra de notificações — sticky abaixo da topbar mobile ── */}
        <div className="mt-14 lg:mt-0 sticky top-0 z-10">
          <NotificationBar />
        </div>

        {/* ── Conteúdo da página ── */}
        {/* pb-20 = espaço para a bottom nav no mobile */}
        <main className="flex-1 px-4 py-6 lg:px-8 pb-20 lg:pb-8 max-w-5xl w-full mx-auto">

          {/* Saudação */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-grafite)', fontFamily: 'var(--font-display)' }}>
              Olá, {firstName}!
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-grafite-soft)', opacity: 0.7 }}>
              Acompanhe seus pedidos e faturas em um só lugar.
            </p>
          </div>

          {/* Cards de resumo — clicáveis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <SummaryCard
              icon={TrendingDown}
              label="Em atraso"
              value={formatCurrency(totalVencidas)}
              color="red"
              onClick={() => setActiveSection('vencidas')}
            />
            <SummaryCard
              icon={TrendingUp}
              label="A vencer"
              value={formatCurrency(totalAVencer)}
              color="amber"
              onClick={() => setActiveSection('a-vencer')}
            />
            <SummaryCard
              icon={Wallet}
              label="Total pago"
              value={formatCurrency(totalPagas)}
              color="green"
              onClick={() => setActiveSection('pagas')}
            />
          </div>

          {/* ── Seções ── */}

          {activeSection === 'pagas' && (
            <section>
              <SectionTitle icon={CheckCircle} label="Faturas Pagas" color="green" />
              <InvoiceTable
                faturas={faturas.pagas}
                type="paga"
                loading={loadingFaturas.pagas}
                emptyText="Nenhuma fatura paga encontrada."
              />
            </section>
          )}

          {activeSection === 'vencidas' && (
            <section>
              <SectionTitle icon={AlertTriangle} label="Faturas Vencidas" color="red" />
              <InvoiceTable
                faturas={faturas.vencidas}
                type="vencida"
                loading={loadingFaturas.vencidas}
                emptyText="Nenhuma fatura vencida. Parabéns! 🎉"
              />
            </section>
          )}

          {activeSection === 'a-vencer' && (
            <section>
              <SectionTitle icon={Clock} label="Faturas a Vencer" color="amber" />
              <InvoiceTable
                faturas={faturas.aVencer}
                type="a-vencer"
                loading={loadingFaturas.aVencer}
                emptyText="Nenhuma fatura a vencer no momento."
              />
            </section>
          )}

          {activeSection === 'pedidos' && (
            <section>
              <SectionTitle icon={ShoppingBag} label="Histórico de Pedidos" color="gray" />
              <OrderHistory />
            </section>
          )}

          {activeSection === 'vendedor' && (
            <section>
              <SectionTitle icon={User} label="Meu Vendedor" color="gray" />
              <SellerCard />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
