import {
  Package,
  ShoppingCart,
  BarChart3,
  Smartphone,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  UserCog,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router";
import StoreSelector, { type Store } from "~/components/ui/StoreSelector";
import { useAuth } from "~/core/auth";
import { useDarkMode } from "~/core/hooks/useDarkMode";

// Menú completo para admin
const adminMenuItems = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3,    path: "/admin" },
  { id: "inventory", label: "Inventario", icon: Package,       path: "/admin/inventory" },
  { id: "sales",     label: "Ventas",     icon: ShoppingCart,  path: "/admin/sales" },
  { id: "clientes",  label: "Clientes",   icon: Users,         path: "/admin/clientes" },
  { id: "empleados", label: "Personal",   icon: UserCog,       path: "/admin/empleados" },
];

// Menú limitado para empleado
const empleadoMenuItems = [
  { id: "inventory", label: "Inventario",    icon: Package,      path: "/admin/inventory" },
  { id: "sales",     label: "Caja / Ventas", icon: ShoppingCart, path: "/admin/sales" },
];

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, isEmpleado, isHydrating, logout } = useAuth();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store>({
    id: 1,
    name: "Local Central",
    manager: "Ana García",
  });

  const location = useLocation();
  const navigate  = useNavigate();

  const menuItems = isAdmin ? adminMenuItems : empleadoMenuItems;

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Cargando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isEmpleado)) return <Navigate to="/" replace />;
  if (isEmpleado && location.pathname === "/admin") return <Navigate to="/admin/sales" replace />;

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/");
  };

  const activeLabel = menuItems.find(i => i.path === location.pathname)?.label ?? "Panel Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 18 ? "👋" : "🌙";

  // ── Sidebar content ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,99,90,0.30)' }}>
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-base leading-none tracking-wide">MATVIC</h1>
              <p className="text-[10px] mt-0.5 font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>ADMIN PANEL</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Menú Principal
        </p>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={isActive
                ? { background: 'rgba(232,99,90,0.22)', color: 'white', borderLeft: '3px solid var(--primary)' }
                : { color: 'rgba(255,255,255,0.60)' }
              }
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={isActive ? { background: 'var(--primary)' } : { background: 'rgba(255,255,255,0.08)' }}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.60)' }} />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        {/* Ver Tienda */}
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.60)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(60,177,113,0.20)' }}>
            <ShoppingCart className="h-4 w-4" style={{ color: 'var(--success)' }} />
          </div>
          Ver Tienda
          <span className="ml-auto text-xs" style={{ color: 'var(--success)' }}>→</span>
        </Link>

        {/* Modo Noche */}
        <button
          type="button"
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.60)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {dark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.60)' }} />}
          </div>
          {dark ? "Modo Día" : "Modo Noche"}
          {/* Toggle pill */}
          <div className="ml-auto w-9 h-5 rounded-full relative transition-colors duration-300" style={{ background: dark ? 'var(--primary)' : 'rgba(255,255,255,0.20)' }}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform duration-300 ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} style={{ background: 'rgba(255,255,255,0.95)' }} />
          </div>
        </button>

        {/* Usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background: 'var(--primary)' }}>
              {(user?.nombre ?? user?.username ?? 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold text-white truncate leading-none">{user?.nombre ?? user?.username}</p>
              <p className="text-[11px] mt-0.5 capitalize truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.rol}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.40)' }} />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50 border" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ color: '#ff8a85' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(217,83,79,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar móvil */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden"
        style={{ background: 'var(--sidebar)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 h-screen sticky top-0 flex-col shrink-0" style={{ background: 'var(--sidebar)' }}>
        <SidebarContent />
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header
          className="h-[64px] px-4 lg:px-6 flex items-center justify-between shrink-0 gap-3 border-b"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {greeting}, {user?.nombre?.split(" ")[0] ?? user?.username} {greetingEmoji}
              </p>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                Resumen general de MATVIC
              </p>
            </div>
          </div>

          <StoreSelector selectedStore={currentStore} onStoreChange={store => setCurrentStore(store)} />
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8" style={{ background: 'var(--bg)' }}>
          <Outlet context={{ currentStore, userData: user }} />
        </main>
      </div>
    </div>
  );
}