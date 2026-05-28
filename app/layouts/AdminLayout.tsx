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
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router";
import StoreSelector, { type Store } from "~/components/ui/StoreSelector";
import { useAuth } from "~/context/auth";

const menuItems = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3,   path: "/admin" },
  { id: "inventory", label: "Inventario", icon: Package,      path: "/admin/inventory" },
  { id: "sales",     label: "Ventas",     icon: ShoppingCart, path: "/admin/sales" },
];

export default function AdminLayout() {
  const { user, isAuthenticated, isHydrating, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store>({
    id: 22,
    name: "Local N° 22",
    manager: "Ana García",
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Guard de autenticación (client-side)
  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-10 w-10 rounded-full border-4 border-pickled-bluewood-200 border-t-pickled-bluewood-600 animate-spin" />
          <p className="text-sm font-medium">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/");
  };

  const activeLabel =
    menuItems.find((i) => i.path === location.pathname)?.label ?? "Panel Admin";

  // ── Sidebar (compartido entre mobile overlay y desktop fixed) ──────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <Smartphone className="h-8 w-8 text-pickled-bluewood-400 group-hover:scale-110 transition-transform duration-300" />
            <div>
              <h1 className="text-white font-semibold text-lg">MatVic</h1>
              <p className="text-sm text-slate-400">SAVI</p>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-sm font-medium group/link ${
                  isActive
                    ? "bg-slate-800 text-white border-l-2 border-pickled-bluewood-400 pl-[14px]"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-200 ${
                  isActive ? "text-pickled-bluewood-400" : "group-hover/link:scale-110"
                }`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-4">
          <p>Accesorios de Celulares</p>
          <p>Sistema de Gestión SAVI v1.0</p>
        </div>

        {/* Tarjeta de usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-pickled-bluewood-600 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user?.nombre ?? user?.username ?? "Usuario"}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.rol}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden z-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-red-400 hover:text-red-300"
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
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Overlay móvil (backdrop) ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar móvil (slide-over) ────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-pickled-bluewood-800 shadow-lg flex flex-col border-r border-pickled-bluewood-700 transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Sidebar desktop (sticky fijo) ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-pickled-bluewood-800 shadow-lg flex-col border-r border-pickled-bluewood-700 shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 shadow-sm gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — solo móvil */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 text-base lg:text-xl truncate">{activeLabel}</h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistema de Administración de Ventas e Inventario
              </p>
            </div>
          </div>

          <StoreSelector
            selectedStore={currentStore}
            onStoreChange={(store) => setCurrentStore(store)}
          />
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <Outlet context={{ currentStore, userData: user }} />
        </main>
      </div>
    </div>
  );
}