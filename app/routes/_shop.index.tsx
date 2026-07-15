import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Smartphone, Loader2, AlertCircle, Star, Truck, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";
import { api } from "~/core/api/client";
import type { Product } from "~/features/inventory/types";
import { formatCLP } from "~/lib/utils";
import { useCart } from "~/context/CartContext";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

type FilterCategory = 'Todos' | 'Smartphones' | 'Accesorios';

const BADGE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Nuevo',  color: 'bg-mv-primary text-white' },
  2: { label: 'Oferta', color: 'bg-mv-primary text-white' },
  4: { label: 'Top',    color: 'bg-[#F4B740] text-white' },
};

export default function ShopIndex() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');

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

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

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
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  const productosFiltrados = useMemo(() => {
    if (activeFilter === 'Todos') return productos;
    if (activeFilter === 'Smartphones') return productos.filter(p => p.categoria?.toLowerCase() === 'smartphone');
    if (activeFilter === 'Accesorios') return productos.filter(p => p.categoria?.toLowerCase() !== 'smartphone');
    return productos;
  }, [productos, activeFilter]);

  const filters: FilterCategory[] = ['Todos', 'Smartphones', 'Accesorios'];

  return (
    <div className="pb-20 overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[420px] sm:h-[500px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #7F3943 0%, #9B4652 60%, #B3606A 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: '#E8635A' }} />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: '#FAF5F0' }} />

        <div className="relative z-10 w-full px-6 sm:px-16 space-y-6 text-center flex flex-col items-center">
          <span
            className="inline-flex items-center gap-2 border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            ✦ TEMPORADA 2025
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
            Tecnología que<br />
            <span style={{ color: '#F0E9DF' }}>transforma tu vida</span>
          </h1>
          <p className="text-white/75 text-base sm:text-lg max-w-lg">
            Los mejores smartphones y accesorios con garantía oficial. Envío rápido a toda Arica y Chile.
          </p>
          <button
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-2 border-2 border-white text-white px-8 py-3.5 rounded-full font-bold transition-all hover:bg-white text-base flex items-center gap-2"
            style={{ '--hover-text': '#7F3943' } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7F3943'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
          >
            Ver Catálogo <span className="text-xl font-bold">›</span>
          </button>
        </div>
      </section>

      {/* ── 2. STATS ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-white rounded-2xl border p-2 sm:p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-x" style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          {[
            { icon: Smartphone, value: '+500', label: 'Productos' },
            { icon: Star,       value: '4.9/5', label: 'Valoración' },
            { icon: Truck,      value: '24h',   label: 'Envío express' },
            { icon: ShieldCheck, value: '12 meses', label: 'Garantía' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 text-center sm:text-left">
              <div className="p-3 rounded-full" style={{ background: 'var(--primary-light)' }}>
                <Icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <p className="font-extrabold text-lg leading-none" style={{ color: 'var(--text)' }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. QUIÉNES SOMOS ────────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 py-10 mt-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="font-bold uppercase tracking-widest text-sm" style={{ color: 'var(--primary)' }}>Quiénes Somos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
              MATVIC Celulares, tu aliado tecnológico en Arica
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <p>Somos una empresa ariqueña especializada en la venta de smartphones y accesorios de las mejores marcas del mundo. Con más de 5 años de experiencia, ofrecemos productos originales con garantía certificada y un servicio personalizado que nos distingue.</p>
              <p>Nuestro compromiso es brindarte la mejor tecnología al mejor precio, con asesoría técnica experta y soporte postventa real. En MATVIC Celulares, cada cliente es único.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {[
                { Icon: MapPin, text: 'Arica, Chile' },
                { Icon: Phone,  text: '+56 9 1234 5678' },
                { Icon: Mail,   text: 'contacto@matvic.cl' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <img
                src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?q=80&w=1000&auto=format&fit=crop"
                alt="MATVIC Celulares"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-5 -left-5 bg-white p-5 rounded-2xl max-w-[230px]"
              style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}
            >
              <p className="font-extrabold text-base mb-0.5" style={{ color: 'var(--text)' }}>5 años de confianza</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Más de 10,000 clientes satisfechos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CTA BANNER ───────────────────────────────────────── */}
      <section
        className="py-16 text-center px-4 sm:px-6 mx-4 sm:mx-6 rounded-3xl mt-12 mb-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7F3943 0%, #9B4652 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: '#FAF5F0' }} />
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-extrabold text-white">Descubre todos nuestros productos</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Smartphones, fundas, cargadores, auriculares y mucho más con los mejores precios.</p>
          <button
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-4 font-bold px-6 py-3 rounded-full transition-all text-white border-2 border-white/40 hover:bg-white"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7F3943'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
          >
            Ver Catálogo Completo ›
          </button>
        </div>
      </section>

      {/* ── 5. CATÁLOGO ─────────────────────────────────────────── */}
      <section id="catalogo" className="w-full">
        {/* Banner del catálogo */}
        <div className="px-4 sm:px-6 py-8 mb-0" style={{ background: 'linear-gradient(135deg, #7F3943 0%, #9B4652 100%)' }}>
          <div className="container mx-auto">
            <h2 className="text-3xl font-extrabold text-white mb-1">Catálogo de Productos</h2>
            <p className="text-white/70">Encuentra tu próximo smartphone o accesorio ideal</p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 pt-8">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                  style={activeFilter === f
                    ? { background: 'var(--primary)', color: 'white', boxShadow: '0 4px 12px rgba(232,99,90,0.35)' }
                    : { background: 'white', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-sm font-bold w-full sm:w-auto text-right" style={{ color: 'var(--primary)' }}>
              {productosFiltrados.length} productos
            </span>
          </div>

          {/* Cargando */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border animate-pulse" style={{ borderColor: 'var(--border)' }}>
                  <div className="aspect-square" style={{ background: 'var(--card)' }} />
                  <div className="p-5 space-y-3">
                    <div className="h-3 rounded w-1/3" style={{ background: 'var(--card)' }} />
                    <div className="h-4 rounded w-full" style={{ background: 'var(--card)' }} />
                    <div className="h-8 rounded mt-4" style={{ background: 'var(--card)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border text-center" style={{ borderColor: 'var(--border)' }}>
              <AlertCircle className="h-12 w-12 mb-4" style={{ color: 'var(--error)' }} />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button
                onClick={cargarProductos}
                className="mt-4 px-6 py-2 text-white rounded-lg text-sm transition-colors"
                style={{ background: 'var(--primary)' }}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Grid de productos */}
          {!isLoading && !error && productosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-12">
              {productosFiltrados.map((producto, idx) => {
                const badge = BADGE_LABELS[idx];
                return (
                  <div
                    key={producto.id_producto}
                    className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                    style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    {/* Imagen */}
                    <div
                      className="relative aspect-square overflow-hidden cursor-pointer"
                      style={{ background: 'var(--card)' }}
                      onClick={() => handleVerProducto(producto)}
                    >
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--border)' }}>
                          <Smartphone className="h-16 w-16" />
                        </div>
                      )}
                      {badge && (
                        <span className={`absolute top-3 left-3 ${badge.color} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                          {badge.label}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col grow">
                      <span className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--primary)' }}>
                        {producto.categoria ?? "Accesorio"}
                      </span>
                      <h4
                        onClick={() => handleVerProducto(producto)}
                        className="font-bold text-base mb-1 line-clamp-1 cursor-pointer transition-colors"
                        style={{ color: 'var(--text)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                      >
                        {producto.nombre}
                      </h4>
                      <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {producto.descripcion ?? "Producto original con garantía oficial"}
                      </p>

                      <div className="mt-auto flex items-end justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>Precio</p>
                          <p className="text-xl font-black" style={{ color: 'var(--primary)' }}>
                            {formatCLP(Number(producto.precio_unit))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAgregarCarrito(producto)}
                          className="flex items-center gap-1.5 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
                          style={{ background: 'var(--primary)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sin resultados */}
          {!isLoading && !error && productosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Smartphone className="h-16 w-16 mb-4" style={{ color: 'var(--border)' }} />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No hay productos en esta categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. FOOTER ───────────────────────────────────────────── */}
      <footer className="mt-12 py-8 text-center" style={{ background: 'var(--text)', color: 'var(--card)' }}>
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Smartphone className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2025 MATVIC Celulares · Arica, Chile · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}