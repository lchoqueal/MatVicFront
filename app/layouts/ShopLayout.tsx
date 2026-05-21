import { Link, Outlet, useNavigate } from "react-router";
import { ShoppingCart, User, Smartphone, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "~/context/auth";

export default function ShopLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-[#2d3e50] text-white shadow-md px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Smartphone className="h-7 w-7 text-blue-400" />
          <span className="font-bold text-xl tracking-tight">MatVic Store</span>
        </Link>

        {/* Acciones del header */}
        <div className="flex items-center gap-5">
          {/* Si el usuario es admin/empleado, link al panel */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-500 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Panel Admin
            </Link>
          )}

          {/* Carrito */}
          <button
            type="button"
            className="hover:text-blue-400 transition-colors relative"
            aria-label="Carrito de compras"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>

          {/* Auth */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 hover:text-blue-400 font-medium text-sm transition-colors"
            >
              <User className="h-5 w-5" />
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/20 pl-5">
              <span className="text-blue-300 font-bold text-sm">
                {user?.nombre ?? user?.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        <Outlet />
      </main>

      <footer className="bg-[#2d3e50] text-slate-400 text-xs text-center py-4 mt-auto">
        © {new Date().getFullYear()} MatVic Store · Tacna, Perú
      </footer>
    </div>
  );
}