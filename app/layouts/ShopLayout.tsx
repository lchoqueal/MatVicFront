import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { ShoppingCart, User, Smartphone, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "~/context/auth";

export default function ShopLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-[#2d3e50] text-white shadow-md px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <Smartphone className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
          <span className="font-bold text-lg sm:text-xl tracking-tight">MatVic Store</span>
        </Link>

        {/* Acciones desktop */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-5">
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-500 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Panel Admin
            </Link>
          )}

          <button
            type="button"
            className="hover:text-blue-400 transition-colors relative"
            aria-label="Carrito de compras"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 hover:text-blue-400 font-medium text-sm transition-colors"
            >
              <User className="h-5 w-5" />
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <span className="text-blue-300 font-bold text-sm truncate max-w-[100px]">
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

        {/* Botones móvil */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            type="button"
            className="hover:text-blue-400 transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:text-blue-400 transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-30 bg-[#2d3e50] border-t border-white/10 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold bg-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-500 transition-colors text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Panel Admin
              </Link>
            )}

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-400 transition-colors py-2"
              >
                <User className="h-4 w-4" />
                Iniciar Sesión
              </Link>
            ) : (
              <div className="border-t border-white/10 pt-3">
                <p className="text-blue-300 font-bold text-sm mb-2">
                  {user?.nombre ?? user?.username}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <Outlet />
      </main>

      <footer className="bg-[#2d3e50] text-slate-400 text-xs text-center py-4 mt-auto">
        © {new Date().getFullYear()} MatVic Store · Tacna, Perú
      </footer>
    </div>
  );
}