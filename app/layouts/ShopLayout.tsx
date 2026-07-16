import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { ShoppingCart, User, Smartphone, LogOut, LayoutDashboard, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
import { useAuth } from "~/core/auth";
import CheckoutModal from "~/components/ui/CheckoutModal";
import { formatCLP } from "~/lib/utils";
import { useCart } from "~/context/CartContext";

export default function ShopLayout() {
  const { user, isAuthenticated, isAdmin, isEmpleado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'inicio' | 'catalogo'>('inicio');

  // Solo renderizar badge del carrito en el cliente (evita hydration mismatch)
  useEffect(() => { setMounted(true); }, []);

  // Detecta qué sección está visible
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

  // Abrir carrito desde evento global
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('openCart', handler);
    return () => window.removeEventListener('openCart', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const { cartItems, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  const navLinkStyle = (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 700,
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: active ? '1.5px solid var(--sidebar)' : '1.5px solid transparent',
    color: active ? 'var(--sidebar)' : 'var(--text-muted)',
    background: active ? 'rgba(127,57,67,0.06)' : 'transparent',
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40 px-4 sm:px-6 h-[72px] flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text)' }}>MATVIC</span>
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>CELULARES</span>
          </div>
        </Link>

        {/* Nav central (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            onClick={() => setActiveNav('inicio')}
            style={navLinkStyle(activeNav === 'inicio' && location.pathname === '/')}
          >
            Inicio
          </Link>
          <a
            href="#catalogo"
            onClick={e => {
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
                  setActiveNav('catalogo');
                }, 300);
              } else {
                e.preventDefault();
                document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={navLinkStyle(activeNav === 'catalogo' && location.pathname === '/')}
          >
            Catálogo
          </a>
        </nav>

        {/* Acciones derecha */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && (isAdmin || isEmpleado) && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{ background: 'var(--card)', color: 'var(--text)' }}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Panel
            </Link>
          )}

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full border transition-all"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              <User className="h-4 w-4" />
              Iniciar sesión
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--card)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--brand)' }}>
                  {(user?.nombre ?? user?.username ?? 'U')[0].toUpperCase()}
                </div>
                <span className="font-bold text-sm truncate max-w-[80px]" style={{ color: 'var(--text)' }}>
                  {user?.nombre ?? user?.username}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {user?.rol}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--error)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Botón Carrito */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 text-white font-bold text-sm px-4 py-2.5 rounded-full transition-all"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(232,99,90,0.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
          >
            <ShoppingCart className="h-4 w-4" />
            Carrito
            {mounted && cartCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none" style={{ background: 'white', color: 'var(--primary)' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Móvil */}
        <div className="flex sm:hidden items-center gap-3">
          <button onClick={() => setCartOpen(true)} className="p-2 relative" style={{ color: 'var(--text)' }}>
            <ShoppingCart className="h-6 w-6" />
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2" style={{ color: 'var(--text)' }}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 top-[72px] bg-white p-4 space-y-2" style={{ borderTop: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-3 font-bold border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Inicio</Link>
          <a href="#catalogo" onClick={() => setMenuOpen(false)} className="block py-3 font-bold border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Catálogo</a>
          {!isAuthenticated ? (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 font-bold" style={{ color: 'var(--text)' }}>
              <User className="h-5 w-5" /> Iniciar Sesión
            </Link>
          ) : (
            <div className="pt-2">
              <p className="font-bold mb-3" style={{ color: 'var(--primary)' }}>{user?.nombre ?? user?.username}</p>
              {(isAdmin || isEmpleado) && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-bold mb-4" style={{ color: 'var(--text)' }}>
                  <LayoutDashboard className="h-5 w-5" /> Ir al Panel
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 font-bold" style={{ color: 'var(--error)' }}>
                <LogOut className="h-5 w-5" /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── CART DRAWER ───────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full flex flex-col" style={{ boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header drawer */}
            <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Mi Carrito</h2>
                {cartCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)', background: 'var(--card)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                  <ShoppingCart className="h-14 w-14" style={{ color: 'var(--border)' }} />
                  <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Tu carrito está vacío</p>
                  <p className="text-sm" style={{ color: 'var(--border)' }}>Agrega productos desde el catálogo</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--border)' }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-sm leading-tight line-clamp-2" style={{ color: 'var(--text)' }}>{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="p-1 shrink-0 transition-colors" style={{ color: 'var(--border)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--error)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--border)'; }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-extrabold text-sm" style={{ color: 'var(--primary)' }}>{formatCLP(item.price)}</span>
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'white' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer drawer */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-muted)' }}>Total</span>
                  <span className="text-2xl font-black" style={{ color: 'var(--text)' }}>{formatCLP(cartTotal)}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full text-white font-bold py-3.5 rounded-xl transition-all"
                  style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(232,99,90,0.35)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
                >
                  Proceder al Pago →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} total={cartTotal} />
      )}

      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}