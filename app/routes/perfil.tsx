import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  MapPin, 
  User as UserIcon, 
  Mail, 
  Phone, 
  LogOut, 
  Store,
  Edit2,
  X
} from "lucide-react";
import { useAuth } from "~/core/auth";
import { useCart } from "~/context/CartContext";
import { api } from "~/core/api/client";
import { formatCLP, formatDate } from "~/lib/utils";
import type { Product } from "~/features/inventory/types";
import CheckoutModal from "~/components/ui/CheckoutModal";

// --- Types ---
interface DetalleBoleta {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unit: string;
}

interface BoletaCliente {
  idBoleta: number;
  tipoVenta: string;
  total: string;
  estado: string;
  fechaEmision: string;
  detalles: DetalleBoleta[];
}

interface BoletasResponse {
  cantidad: number;
  boletas: BoletaCliente[];
}

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

// --- Component ---
export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCliente, logout } = useAuth();
  const { items, total } = useCart();
  
  const [boletas, setBoletas] = useState<BoletaCliente[]>([]);
  const [productosRecomendados, setProductosRecomendados] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Redireccionar si no está autenticado o no es cliente
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!isCliente) {
      navigate("/admin");
    }
  }, [isAuthenticated, isCliente, navigate]);

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        // Cargar boletas del cliente
        const boletasData = await api.get<BoletasResponse>(`/boletas/cliente/${user.id}`);
        setBoletas(boletasData.boletas || []);
        
        // Cargar productos recomendados (aleatorios o primeros 4)
        const prodData = await api.get<ProductosResponse>("/productos");
        setProductosRecomendados(prodData.productos.slice(0, 4));
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const ultimoPedido = boletas.length > 0 ? boletas[0] : null;

  // Calculo de fecha estimada (+2 días del ultimo pedido)
  const fechaEstimada = useMemo(() => {
    if (!ultimoPedido) return null;
    const d = new Date(ultimoPedido.fechaEmision);
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [ultimoPedido]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenCart = () => setCartOpen(true);
  
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener('openCart', handler);
    return () => window.removeEventListener('openCart', handler);
  }, []);

  if (!user || !isCliente) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-800 pb-20">
      
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-mv-primary flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tighter">MV</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm text-mv-primary tracking-tight">MATVIC</span>
              <span className="text-[10px] text-mv-primary/70 font-semibold tracking-wider">CELULARES</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 pl-1 pr-4">
              <div className="w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center text-sm font-bold">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold">{user.nombre} {user.apellidos}</span>
                <span className="text-[10px] text-slate-500 font-medium">Cliente</span>
              </div>
            </div>
            
            <Link to="/" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Tienda</span>
            </Link>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section 
          className="rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8b3a45 0%, #a44f5c 100%)' }}
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col items-start gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {user.nombre} {user.apellidos}
            </h1>
            <p className="text-white/80 mb-4">Bienvenida a tu panel personal - MATVIC Celulares</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Seguir Comprando
            </Link>
          </div>
        </section>

        {/* ── TOP CARDS ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Mi Carrito */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <ShoppingCart className="w-4 h-4" />
                Mi Carrito
              </h2>
              <button onClick={handleOpenCart} className="bg-mv-primary/10 text-mv-primary hover:bg-mv-primary/20 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                Ver Carrito ›
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black leading-none">{items.length}</p>
                  <p className="text-xs text-slate-500 font-medium">productos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium mb-1">Total</p>
                <p className="text-2xl font-black text-mv-primary">{formatCLP(total)}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              {items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 truncate pr-4">{item.producto.nombre}</span>
                  <span className="text-slate-400 whitespace-nowrap">×{item.cantidad} · {formatCLP(item.producto.precio_unit)}</span>
                </div>
              ))}
              {items.length > 2 && (
                <p className="text-xs text-slate-400 text-center font-medium pt-2">
                  y {items.length - 2} más...
                </p>
              )}
            </div>
            
            <button 
              onClick={handleOpenCart}
              className="w-full py-3 bg-mv-primary hover:bg-[#7a2e38] text-white rounded-xl text-sm font-bold transition-colors"
            >
              Proceder al Pago
            </button>
          </div>

          {/* Card: Último Pedido */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Último Pedido</h2>
            </div>
            
            {ultimoPedido ? (
              <>
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">
                      #ORD-{ultimoPedido.idBoleta} · {formatDate(ultimoPedido.fechaEmision)}
                    </p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-2">
                      {ultimoPedido.detalles?.[0]?.nombre || 'Productos varios'}
                    </p>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                        {ultimoPedido.estado === 'pendiente' ? 'En camino' : ultimoPedido.estado}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Importe</span>
                  <span className="text-sm font-black text-slate-800">{formatCLP(ultimoPedido.total)}</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400 mb-4">No tienes pedidos recientes</p>
                <Link to="/" className="text-sm text-mv-primary font-bold hover:underline">Ir a comprar</Link>
              </div>
            )}
          </div>

          {/* Card: Fecha de Entrega */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Fecha de Entrega</h2>
            </div>
            
            {ultimoPedido && ultimoPedido.estado === 'pendiente' ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">Entrega Estimada</p>
                  <p className="text-2xl font-black text-slate-800 mb-3">{fechaEstimada}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                    En camino
                  </span>
                </div>
                
                <div className="mt-auto bg-slate-50 rounded-xl p-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-mv-primary" />
                  <span className="text-xs font-medium text-slate-600">Av. Javier Prado Este 4200, Lima</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-sm text-slate-400">No hay entregas pendientes</p>
              </div>
            )}
          </div>
          
        </section>

        {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Historial de Pedidos */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Historial de Pedidos</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Producto</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Importe</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {boletas.map((boleta) => (
                    <tr key={boleta.idBoleta}>
                      <td className="py-4 font-bold text-slate-700 whitespace-nowrap">#ORD-{boleta.idBoleta}</td>
                      <td className="py-4 font-medium text-slate-600 max-w-[150px] truncate">
                        {boleta.detalles?.[0]?.nombre || 'Productos varios'}
                      </td>
                      <td className="py-4 text-slate-500 whitespace-nowrap">{formatDate(boleta.fechaEmision)}</td>
                      <td className="py-4 font-black text-slate-800 whitespace-nowrap">{formatCLP(boleta.total)}</td>
                      <td className="py-4 whitespace-nowrap">
                        {boleta.estado === 'pendiente' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                            En camino
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                            Entregado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {boletas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No hay pedidos en el historial.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mi Perfil */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <UserIcon className="w-4 h-4 text-slate-400" />
                Mi Perfil
              </h2>
              <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-full transition-colors">
                <Edit2 className="w-3 h-3" />
                Editar Perfil
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-slate-400 text-white flex items-center justify-center text-3xl font-black shadow-sm mb-4">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-slate-800">{user.nombre} {user.apellidos}</h3>
              <span className="mt-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 tracking-wider">
                Cliente MATVIC
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">CORREO</span>
                  <span className="text-xs font-medium text-slate-700">{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">TELÉFONO</span>
                  <span className="text-xs font-medium text-slate-700">+56 9 1234 5678</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">DISTRITO</span>
                  <span className="text-xs font-medium text-slate-700">Arica, Chile</span>
                </div>
              </div>
            </div>
          </div>
          
        </section>

        {/* ── PRODUCTOS RECOMENDADOS ──────────────────────────────────────── */}
        <section className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400" />
              Productos Recomendados
            </h2>
            <Link to="/" className="text-xs font-bold text-mv-primary hover:underline">
              Ver catálogo ›
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productosRecomendados.map(p => (
              <div key={p.id_producto} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                <div className="aspect-square bg-slate-50 relative p-4 flex items-center justify-center">
                  {p.stock > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-mv-primary z-10">
                      Recomendado
                    </span>
                  )}
                  <img 
                    src={p.imagen_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop"} 
                    alt={p.nombre}
                    className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{p.nombre}</h3>
                  <p className="text-sm font-black text-mv-primary">{formatCLP(p.precio_unit)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM BANNER ───────────────────────────────────────────────── */}
        <section className="mt-8 bg-mv-primary text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">¿Listo para seguir comprando?</h3>
              <p className="text-white/80 text-xs sm:text-sm">Smartphones y accesorios de las mejores marcas</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="relative z-10 whitespace-nowrap bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-full text-sm font-bold transition-colors"
          >
            Ir al catálogo ›
          </Link>
        </section>

      </main>

      {/* ── CART DRAWER ───────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#FDFBF7] h-full flex flex-col shadow-2xl">
            
            {/* Header drawer */}
            <div className="p-5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-mv-primary" />
                <h2 className="font-bold text-lg text-slate-800">Mi Carrito</h2>
                {items.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-mv-primary text-white">
                    {items.length}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full transition-colors text-slate-500 bg-slate-100 hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                  <ShoppingCart className="h-14 w-14 text-slate-200" />
                  <p className="font-medium text-slate-500">Tu carrito está vacío</p>
                  <p className="text-sm text-slate-400">Agrega productos desde el catálogo</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.producto.id_producto} className="flex gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      {item.producto.imagen_url && <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-sm leading-tight line-clamp-2 text-slate-800">{item.producto.nombre}</h4>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                          <span className="w-6 h-6 flex items-center justify-center text-xs font-bold">{item.cantidad}</span>
                        </div>
                        <span className="font-black text-sm text-mv-primary">{formatCLP(item.producto.precio_unit)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer drawer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-bold">Total</span>
                  <span className="text-xl font-black text-slate-800">{formatCLP(total)}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="w-full py-4 bg-[#E05E51] hover:bg-[#c95347] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  Proceder al Pago ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL CHECKOUT ────────────────────────────────────── */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items.map(i => ({
          id: i.producto.id_producto,
          name: i.producto.nombre,
          price: Number(i.producto.precio_unit),
          quantity: i.cantidad,
          image: i.producto.imagen_url
        }))}
        total={Number(total)}
      />
    </div>
  );
}
