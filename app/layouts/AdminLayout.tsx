import {
  Package,
  ShoppingCart,
  BarChart3,
  Smartphone,
  ChevronDown,
  LogOut,
  User,
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
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store>({
    id: 22,
    name: "Local N° 22",
    manager: "Ana García",
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Guard de autenticación (client-side)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login");
  };

  const activeLabel =
    menuItems.find((i) => i.path === location.pathname)?.label ?? "Panel Admin";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 h-screen sticky top-0 bg-pickled-bluewood-800 shadow-lg flex flex-col border-r border-pickled-bluewood-700">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-pickled-bluewood-400" />
            <div>
              <h1 className="text-white font-semibold text-lg">MatVic</h1>
              <p className="text-sm text-slate-400">SAVI</p>
            </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-150 text-sm font-medium ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
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
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-pickled-bluewood-600 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nombre ?? user?.username ?? "Usuario"}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
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
      </aside>

      {/* ── Contenido principal ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header con StoreSelector */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h2 className="font-bold text-slate-800 text-xl">{activeLabel}</h2>
            <p className="text-xs text-slate-500">
              Sistema de Administración de Ventas e Inventario
            </p>
          </div>
          <StoreSelector
            selectedStore={currentStore}
            onStoreChange={(store) => setCurrentStore(store)}
          />
        </header>

        {/* Área de contenido de la ruta */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet context={{ currentStore, userData: user }} />
        </main>
      </div>
    </div>
  );
}