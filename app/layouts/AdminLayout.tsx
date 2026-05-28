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
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router";
import StoreSelector, { type Store } from "~/components/ui/StoreSelector";
import { useAuth } from "~/context/auth";

// ── Dark mode hook ─────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Leer preferencia guardada (el script inline ya aplicó la clase, solo sincronizamos el estado)
    const saved = localStorage.getItem("theme");
    setDark(saved === "dark" || (!saved && document.documentElement.classList.contains("dark")));
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}

// ── Menú de navegación ─────────────────────────────────────────────────────

const menuItems = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3,   path: "/admin" },
  { id: "inventory", label: "Inventario", icon: Package,      path: "/admin/inventory" },
  { id: "sales",     label: "Ventas",     icon: ShoppingCart, path: "/admin/sales" },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function AdminLayout() {
  const { user, isAuthenticated, isHydrating, logout } = useAuth();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store>({
    id: 22,
    name: "Local N° 22",
    manager: "Ana García",
  });

  const location  = useLocation();
  const navigate  = useNavigate();

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-pickled-bluewood-200 border-t-pickled-bluewood-600 animate-spin" />
          <p className="text-sm font-medium text-secondary">Cargando sesión…</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/");
  };

  const activeLabel = menuItems.find((i) => i.path === location.pathname)?.label ?? "Panel Admin";

  // Saludo según la hora
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  // ── Sidebar content ───────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border-main)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-pickled-bluewood-600 flex items-center justify-center shadow-sm group-hover:bg-pickled-bluewood-500 transition-colors">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">MatVic</h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-sidebar)" }}>SAVI · Panel</p>
            </div>
          </div>
          {/* Cerrar sidebar en móvil */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: "var(--text-muted)" }}>
          Menú Principal
        </p>
        {menuItems.map((item) => {
          const Icon  = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group/link ${
                isActive
                  ? "bg-pickled-bluewood-600 text-white shadow-sm"
                  : "hover:bg-white/8 hover:translate-x-0.5"
              }`}
              style={!isActive ? { color: "var(--text-sidebar)" } : {}}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "bg-white/20 text-white"
                  : "group-hover/link:bg-white/10"
              }`}
                style={!isActive ? { color: "var(--text-sidebar)" } : {}}
              >
                <Icon className="h-4 w-4" />
              </div>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-3 py-4 space-y-2 border-t" style={{ borderColor: "var(--border-main)" }}>

        {/* Toggle oscuro/claro */}
        <button
          type="button"
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/8"
          style={{ color: "var(--text-sidebar)" }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-sidebar-item)" }}>
            {dark
              ? <Sun  className="h-4 w-4 text-yellow-400" />
              : <Moon className="h-4 w-4 text-pickled-bluewood-400" />
            }
          </div>
          {dark ? "Modo Día" : "Modo Noche"}
          {/* Indicador visual */}
          <div className={`ml-auto w-9 h-5 rounded-full transition-colors duration-300 relative ${dark ? "bg-pickled-bluewood-500" : "bg-white/20"}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${dark ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
        </button>

        {/* Tarjeta de usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/8 group"
          >
            <div className="w-8 h-8 rounded-full bg-pickled-bluewood-600 flex items-center justify-center shrink-0 ring-2 ring-white/10">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold text-white truncate leading-none">
                {user?.nombre ?? user?.username}
              </p>
              <p className="text-[11px] mt-0.5 capitalize truncate" style={{ color: "var(--text-sidebar)" }}>
                {user?.rol}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg overflow-hidden z-50 border"
              style={{ background: "var(--bg-sidebar-item)", borderColor: "var(--border-main)" }}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-red-500/10 text-red-400 hover:text-red-300"
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
    <div className="flex min-h-screen bg-canvas">

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden`}
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-main)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex w-64 h-screen sticky top-0 flex-col shrink-0"
        style={{ background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-main)" }}
      >
        <SidebarContent />
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header
          className="h-16 lg:h-[72px] px-4 lg:px-8 flex items-center justify-between shrink-0 gap-3"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-main)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger móvil */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium hidden sm:block" style={{ color: "var(--text-muted)" }}>
                  {greeting},
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {user?.nombre?.split(" ")[0] ?? user?.username}
                </span>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
                {activeLabel} · {currentStore.name}
              </p>
            </div>
          </div>

          <StoreSelector
            selectedStore={currentStore}
            onStoreChange={(store) => setCurrentStore(store)}
          />
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet context={{ currentStore, userData: user }} />
        </main>
      </div>
    </div>
  );
}