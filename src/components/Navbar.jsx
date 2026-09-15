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
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'faturas', label: 'Faturas', icon: FileText },
  { id: 'pagas', label: 'Pagas', icon: CheckCircle, indent: true },
  { id: 'vencidas', label: 'Vencidas', icon: AlertTriangle, indent: true },
  { id: 'a-vencer', label: 'A Vencer', icon: Clock, indent: true },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'vendedor', label: 'Meu Vendedor', icon: User },
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
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-red-700 flex items-center justify-between px-4 h-14 shadow">
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
          className="text-white p-1.5 rounded-lg hover:bg-red-800 transition"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar (mobile drawer + desktop fixed) ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-gray-900 flex flex-col shadow-xl transition-transform duration-300
          lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-red-700 rounded-lg p-1.5">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Portal do Cliente</p>
            <p className="text-gray-400 text-xs">Riograndense</p>
          </div>
        </div>

        {/* Client name */}
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Logado como</p>
          <p className="text-white text-sm font-medium truncate">{clientName}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon, indent }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5
                ${indent ? 'ml-4 w-[calc(100%-1rem)]' : ''}
                ${active === id
                  ? 'bg-red-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
          >
            <LogOut size={17} className="shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

