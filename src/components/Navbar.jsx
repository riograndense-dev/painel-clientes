import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShoppingBag,
  User,
  KeyRound,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'pagas', label: 'Faturas Pagas', icon: CheckCircle },
  { id: 'vencidas', label: 'Faturas Vencidas', icon: AlertTriangle },
  { id: 'a-vencer', label: 'A Vencer', icon: Clock },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'vendedor', label: 'Meu Vendedor', icon: User },
  { id: 'senha', label: 'Alterar Senha', icon: KeyRound },
];

export default function Navbar({ active, onNavigate }) {
  const { client, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleNav(id) {
    onNavigate(id);
    setOpen(false);
  }

  const clientName = client?.CLIENTE || client?.nome || 'Cliente';

  return (
    <>
      {/* ── Mobile topbar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 shadow-md"
        style={{ background: 'var(--color-grafite)' }}>
        <div className="flex items-center gap-2">
          <img
            src="https://distribuidorariograndense.com.br/assets/logo-nova-B0BBOd_t.png"
            alt="Rio"
            className="h-7 object-contain brightness-200"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-white p-2 rounded-lg transition"
          style={{ background: open ? 'var(--color-grafite-card)' : 'transparent' }}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--color-grafite)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 shrink-0"
          style={{ borderBottom: '1px solid var(--color-grafite-card)' }}>
          <div className="rounded-lg p-1.5">
            <img
              src="./image.png"
              alt="Rio"
              className="h-7 object-contain brightness-200"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Portal do Cliente</p>
            <p className="text-xs" style={{ color: 'var(--color-campeiro-300)' }}>Riograndense</p>
          </div>
        </div>

        {/* Client name */}
        <div className="px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-grafite-card)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-campeiro-400)' }}>
            Logado como
          </p>
          <p className="text-white text-sm font-medium truncate">{clientName}</p>
        </div>

        {/* Nav items — sem overflow horizontal */}
        <nav className="flex-1 sidebar-scroll py-3 px-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 mb-1"
                style={isActive ? {
                  background: 'var(--color-campeiro-700)',
                  color: 'white',
                } : {
                  color: 'rgb(203 213 202)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-grafite-card)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--color-grafite-card)' }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: 'rgb(180 190 180)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-grafite-card)';
              e.currentTarget.style.color = 'var(--color-pampa-300)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgb(180 190 180)';
            }}
          >
            <LogOut size={16} className="shrink-0" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav (alternativa rápida para mobile) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 shadow-lg border-t"
        style={{ background: 'var(--color-grafite)', borderColor: 'var(--color-grafite-card)' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-0"
              style={{ color: isActive ? 'var(--color-erva-400)' : 'rgb(150 160 150)' }}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-12 leading-tight text-center">
                {label.split(' ').slice(-1)[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
