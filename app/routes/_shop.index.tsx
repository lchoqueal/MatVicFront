import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Eye, Star, Smartphone, Search, Loader2, AlertCircle, ShieldCheck, Truck, Clock, MapPin, Phone, Mail } from "lucide-react";
import { api } from "~/core/api/client";
import type { Product } from "~/features/inventory/types";
import { formatCLP } from "~/lib/utils";
import { useCart } from "~/context/CartContext";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

type FilterCategory = 'Todos' | 'Smartphones' | 'Accesorios';

export default function ShopIndex() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');

  // Cargar todos los productos al montar
  const cargarProductos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<ProductosResponse>("/productos");
      setProductos(data.productos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const handleVerProducto = (producto: Product) => {
    navigate(`/producto/${producto.id_producto}`, { state: { producto } });
  };

  const handleAgregarCarrito = (producto: Product) => {
    addItem({
      id: producto.id_producto,
      name: producto.nombre,
      price: Number(producto.precio_unit),
      image: producto.imagen_url ?? undefined,
      categoria: producto.categoria ?? undefined,
    });
    // Abrir drawer del carrito automáticamente
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    if (activeFilter === 'Todos') return productos;
    if (activeFilter === 'Smartphones') return productos.filter(p => p.categoria?.toLowerCase() === 'smartphone');
    if (activeFilter === 'Accesorios') return productos.filter(p => p.categoria?.toLowerCase() !== 'smartphone');
    return productos;
  }, [productos, activeFilter]);

  return (
    <div className="space-y-0 pb-20 overflow-hidden">
      {/* 1. HERO SECTION - Full width, sin márgenes, igual al Figma */}
      <section className="relative overflow-hidden bg-blue-600 min-h-[400px] sm:h-[500px] flex items-center -mx-0">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 50%, #3b82f6 100%)' }} />
        
        {/* Teléfonos SVG - izquierda */}
        <div className="absolute left-0 top-0 h-full w-[35%] pointer-events-none opacity-25">
          <svg viewBox="0 0 300 500" fill="none" className="absolute -left-16 top-1/2 -translate-y-1/2 h-[110%]" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="200" height="380" rx="32" ry="32" stroke="white" strokeWidth="8" fill="none"/>
            <rect x="80" y="370" width="60" height="10" rx="5" stroke="white" strokeWidth="4" fill="none"/>
            <rect x="60" y="18" width="100" height="8" rx="4" stroke="white" strokeWidth="3" fill="none"/>
            <circle cx="110" cy="395" r="12" stroke="white" strokeWidth="4" fill="none"/>
          </svg>
          <svg viewBox="0 0 300 500" fill="none" className="absolute -left-4 top-1/2 -translate-y-[40%] h-[90%] opacity-50" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="200" height="380" rx="32" ry="32" stroke="white" strokeWidth="6" fill="none"/>
            <rect x="80" y="370" width="60" height="8" rx="4" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="60" y="18" width="100" height="6" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="110" cy="393" r="10" stroke="white" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        {/* Teléfonos SVG - derecha */}
        <div className="absolute right-0 top-0 h-full w-[35%] pointer-events-none opacity-25">
          <svg viewBox="0 0 300 500" fill="none" className="absolute -right-16 top-1/2 -translate-y-1/2 h-[110%]" xmlns="http://www.w3.org/2000/svg">
            <rect x="90" y="10" width="200" height="380" rx="32" ry="32" stroke="white" strokeWidth="8" fill="none"/>
            <rect x="160" y="370" width="60" height="10" rx="5" stroke="white" strokeWidth="4" fill="none"/>
            <rect x="140" y="18" width="100" height="8" rx="4" stroke="white" strokeWidth="3" fill="none"/>
            <circle cx="190" cy="395" r="12" stroke="white" strokeWidth="4" fill="none"/>
          </svg>
          <svg viewBox="0 0 300 500" fill="none" className="absolute -right-4 top-1/2 -translate-y-[40%] h-[90%] opacity-50" xmlns="http://www.w3.org/2000/svg">
            <rect x="90" y="10" width="200" height="380" rx="32" ry="32" stroke="white" strokeWidth="6" fill="none"/>
            <rect x="160" y="370" width="60" height="8" rx="4" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="140" y="18" width="100" height="6" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="190" cy="393" r="10" stroke="white" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 w-full px-6 sm:px-16 space-y-6 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
            + TEMPORADA 2025
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
            Tecnología que
            <br />
            <span style={{ color: '#38bdf8' }}>transforma tu vida</span>
          </h1>
          <p className="text-white/75 text-base sm:text-lg max-w-lg">
            Los mejores smartphones y accesorios con garantía oficial. Envío rápido a toda Arica y Chile.
          </p>
          <button
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-2 bg-white text-blue-700 px-8 py-3.5 rounded-full font-bold transition-transform hover:scale-105 shadow-2xl text-base flex items-center gap-2"
          >
            Ver Catálogo <span className="text-xl font-bold">›</span>
          </button>
        </div>
      </section>

      {/* 2. TRUST BADGES */}
      <section className="container mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-2 sm:p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-x divide-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center sm:text-left">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-[#2d3e50] text-lg leading-none">+500</p>
              <p className="text-xs text-slate-500">Productos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center sm:text-left">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-[#2d3e50] text-lg leading-none">4.9/5</p>
              <p className="text-xs text-slate-500">Valoración</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center sm:text-left">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-[#2d3e50] text-lg leading-none">24h</p>
              <p className="text-xs text-slate-500">Envío express</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center sm:text-left">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-[#2d3e50] text-lg leading-none">12 meses</p>
              <p className="text-xs text-slate-500">Garantía</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US */}
      <section className="container mx-auto px-4 sm:px-6 py-10 mt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm">Quiénes Somos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d3e50] leading-tight">
              MatVic Store, tu aliado tecnológico en Arica
            </h2>
            <div className="space-y-4 text-slate-600">
              <p>
                Somos una empresa ariqueña especializada en la venta de smartphones y accesorios de las mejores marcas del mundo. Con más de 5 años de experiencia, ofrecemos productos originales con garantía certificada y un servicio personalizado que nos distingue.
              </p>
              <p>
                Nuestro compromiso es brindarte la mejor tecnología al mejor precio, con asesoría técnica experta y soporte postventa real. En MatVic Store, cada cliente es único.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Arica, Chile</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">+56 9 1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">contacto@matvic.cl</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?q=80&w=1000&auto=format&fit=crop" 
                alt="MatVic Store Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/10" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white max-w-[250px]">
              <p className="font-extrabold text-[#2d3e50] text-lg mb-1">5 años de confianza</p>
              <p className="text-xs text-slate-500 font-medium">Más de 10,000 clientes satisfechos</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BANNER MEDIO */}
      <section className="bg-[#1a2530] py-16 text-center px-4 sm:px-6 mx-4 sm:mx-6 rounded-3xl mt-12 mb-12 relative overflow-hidden">
         <div className="relative z-10 space-y-4">
           <h2 className="text-3xl font-extrabold text-white">Descubre todos nuestros productos</h2>
           <p className="text-slate-300 max-w-2xl mx-auto">Smartphones, fundas, cargadores, auriculares y mucho más con los mejores precios.</p>
           <button 
             onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
             className="mt-4 bg-transparent border border-white/30 text-white hover:bg-white hover:text-[#1a2530] px-6 py-3 rounded-full font-bold transition-all"
           >
             Ver Catálogo Completo ›
           </button>
         </div>
      </section>

      {/* 5. PRODUCT CATALOG */}
      <section id="catalogo" className="container mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#2d3e50] mb-2">Catálogo de Productos</h2>
          <p className="text-slate-500">Encuentra tu próximo smartphone o accesorio ideal</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveFilter('Todos')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === 'Todos' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
            >
              Todos
            </button>
            <button 
               onClick={() => setActiveFilter('Smartphones')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === 'Smartphones' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
            >
              Smartphones
            </button>
            <button 
               onClick={() => setActiveFilter('Accesorios')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === 'Accesorios' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
            >
              Accesorios
            </button>
          </div>
          <div className="text-sm font-bold text-slate-400 w-full sm:w-auto text-right">
            {productosFiltrados.length} productos
          </div>
        </div>

        {/* Estado: cargando */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-8 bg-slate-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado: error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-100 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-slate-600 font-medium">{error}</p>
            <button
              onClick={cargarProductos}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de productos */}
        {!isLoading && !error && productosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto, idx) => (
              <div
                key={producto.id_producto}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer" onClick={() => handleVerProducto(producto)}>
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Smartphone className="h-16 w-16" />
                    </div>
                  )}

                  {/* Badge simulado para UI */}
                  {idx === 0 && <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Nuevo</span>}
                  {idx === 3 && <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Oferta</span>}
                  {idx === 4 && <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Top</span>}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col grow">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                    {producto.categoria ?? "Accesorio"}
                  </span>
                  <h4 onClick={() => handleVerProducto(producto)} className="font-bold text-[#2d3e50] text-base mb-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors">
                    {producto.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    6.7" Super Retina XDR · Chip A17 Pro · 48MP
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Precio</p>
                      <p className="text-xl font-black text-[#2d3e50]">
                        {formatCLP(Number(producto.precio_unit))}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAgregarCarrito(producto)}
                      className="flex items-center gap-1.5 bg-white border border-[#2d3e50]/10 text-blue-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-xs group/btn"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}