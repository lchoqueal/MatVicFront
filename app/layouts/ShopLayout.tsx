import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { ShoppingCart, User, Smartphone, LogOut, LayoutDashboard, Menu, X, Plus, Minus, Trash2, Search } from "lucide-react";
import { useAuth } from "~/core/auth";
import CheckoutModal from "~/components/ui/CheckoutModal";
import { formatCLP } from "~/lib/utils";
import { useCart } from "~/context/CartContext";

export default function ShopLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'inicio' | 'catalogo'>('inicio');

  // Detecta si el catálogo está visible en pantalla
  useEffect(() => {
    if (location.pathname !== '/') return;
    const el = document.getElementById('catalogo');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActiveNav(entry.isIntersecting ? 'catalogo' : 'inicio'),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const { cartItems, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* HEADER TIPO FIGMA */}
      <header className="bg-white shadow-xs px-4 sm:px-6 h-20 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-xl tracking-tight text-[#2d3e50]">MatVic</span>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">STORE</span>
          </div>
        </Link>

        {/* Navegación Central (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" onClick={() => setActiveNav('inicio')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${activeNav === 'inicio' && location.pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            Inicio
          </Link>
          <a href="#catalogo" onClick={(e) => {
             if (location.pathname !== '/') {
               navigate('/');
               setTimeout(() => { document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); setActiveNav('catalogo'); }, 300);
             } else {
               e.preventDefault();
               document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
             }
          }} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${activeNav === 'catalogo' && location.pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            Catálogo
          </a>
        </nav>

        {/* Acciones Derecha */}
        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-[#2d3e50] px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
          
          <button className="p-2 text-slate-400 hover:text-[#2d3e50] transition-colors rounded-full hover:bg-slate-100">
            <Search className="h-5 w-5" />
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {!isAuthenticated ? (
            <Link to="/login" className="p-2 text-slate-400 hover:text-[#2d3e50] transition-colors rounded-full hover:bg-slate-100">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[#2d3e50] font-bold text-sm truncate max-w-[100px]">
                {user?.nombre ?? user?.username}
              </span>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 group"
          >
            <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Carrito</span>
            {cartCount > 0 && (
              <span className="bg-white text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Menú Móvil Toggle */}
        <div className="flex sm:hidden items-center gap-3">
          <button onClick={() => setCartOpen(true)} className="p-2 text-[#2d3e50] relative">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[#2d3e50]">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Menú Móvil */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 top-20 bg-white animate-in slide-in-from-top p-4 space-y-4 shadow-xl">
           <Link to="/" onClick={() => setMenuOpen(false)} className="block py-3 font-bold text-[#2d3e50] border-b border-slate-100">Inicio</Link>
           <a href="#catalogo" onClick={() => setMenuOpen(false)} className="block py-3 font-bold text-[#2d3e50] border-b border-slate-100">Catálogo</a>
           
           {!isAuthenticated ? (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 font-bold text-[#2d3e50]">
              <User className="h-5 w-5" /> Iniciar Sesión
            </Link>
          ) : (
            <div className="pt-2">
              <p className="text-blue-600 font-bold mb-3">{user?.nombre ?? user?.username}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold">
                <LogOut className="h-5 w-5" /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sidebar del Carrito (Drawer) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#2d3e50]" />
                <h2 className="font-bold text-[#2d3e50] text-lg">Mi Carrito</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 text-slate-400 hover:text-[#2d3e50] bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <ShoppingCart className="h-12 w-12 text-slate-300" />
                  <p className="text-slate-500 font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-white shadow-xs">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-slate-50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-[#2d3e50] leading-tight">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-blue-600">{formatCLP(item.price)}</span>
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-500 hover:bg-white rounded-md transition-colors shadow-sm"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-sm font-bold text-[#2d3e50]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-500 hover:bg-white rounded-md transition-colors shadow-sm"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-slate-500 font-medium text-sm">Subtotal</span>
                  <span className="text-2xl font-black text-[#2d3e50]">{formatCLP(cartTotal)}</span>
                </div>
                <button 
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  Proceder al Pago <span className="text-xl leading-none">›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          total={cartTotal} 
        />
      )}

      <main className="flex-1 w-full bg-[#f8f9fa]">
        <Outlet />
      </main>

      <footer className="bg-[#1a2530] text-slate-400 py-12 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="bg-slate-700 p-1.5 rounded-lg">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-lg tracking-tight text-white">MatVic</span>
              <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">STORE</span>
            </div>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} MatVic Store - Arica, Chile. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}