import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Eye, Star, Smartphone, Search, Loader2, AlertCircle } from "lucide-react";
import { api } from "~/lib/api";
import type { Product } from "~/types/inventory";
import { formatCLP } from "~/lib/utils";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

export default function ShopIndex() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);

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

  // Búsqueda con debounce
  useEffect(() => {
    if (!busqueda.trim()) {
      cargarProductos();
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await api.get<ProductosResponse>(
          `/productos/buscar?q=${encodeURIComponent(busqueda.trim())}`
        );
        setProductos(data.productos);
      } catch {
        // En caso de error en búsqueda no sobreescribimos la lista actual
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, cargarProductos]);

  const handleVerProducto = (producto: Product) => {
    navigate(`/producto/${producto.id_producto}`, { state: { producto } });
  };

  const handleAgregarCarrito = (producto: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // TODO: flujo de carrito online (próxima iteración)
    navigate(`/producto/${producto.id_producto}`, { state: { producto } });
  };

  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN HERO */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#2d3e50] h-[220px] sm:h-[300px] lg:h-[350px] flex items-center shadow-xl">
        <div className="absolute inset-0 bg-linear-to-r from-[#1a2530] to-transparent opacity-90" />
        <div className="relative z-10 px-6 sm:px-12 space-y-2 sm:space-y-4 max-w-2xl">
          <span className="text-blue-400 font-bold tracking-widest uppercase text-xs sm:text-sm">Temporada 2026</span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Protección con <br className="hidden sm:block" />
            <span className="text-blue-500">Estilo MatVic</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg hidden sm:block">
            Los mejores accesorios para tu smartphone seleccionados con calidad garantizada en Arica.
          </p>
          <button
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Ver Catálogo
          </button>
        </div>
      </section>

      {/* 2. GRILLA DE PRODUCTOS */}
      <section id="catalogo">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2d3e50]">Accesorios Destacados</h3>
            <p className="text-slate-500 text-sm">
              {isLoading ? "Cargando productos..." : `${productos.length} productos disponibles`}
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 w-full sm:w-56"
            />
            {buscando && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
            )}
          </div>
        </div>

        {/* Estado: cargando */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-8 bg-slate-200 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado: error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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

        {/* Estado: sin resultados */}
        {!isLoading && !error && productos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Smartphone className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {busqueda ? `Sin resultados para "${busqueda}"` : "No hay productos disponibles"}
            </p>
          </div>
        )}

        {/* Lista de productos */}
        {!isLoading && !error && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {productos.map((producto) => (
              <div
                key={producto.id_producto}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Imagen con overlay */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Smartphone className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#2d3e50]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleVerProducto(producto)}
                      className="bg-white p-2 rounded-full text-[#2d3e50] hover:bg-blue-500 hover:text-white transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAgregarCarrito(producto)}
                      className="bg-white p-2 rounded-full text-[#2d3e50] hover:bg-blue-500 hover:text-white transition-colors"
                      title="Agregar al carrito"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Badge stock bajo */}
                  {producto.stock <= producto.min_stock && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Últimas unidades
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col grow">
                  <span className="text-[10px] uppercase font-bold text-blue-600 mb-1">
                    {producto.categoria ?? "Accesorio"}
                  </span>
                  <h4 className="font-semibold text-[#2d3e50] text-lg mb-2 line-clamp-2">
                    {producto.nombre}
                  </h4>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-xl font-bold text-[#2d3e50]">
                    {formatCLP(Number(producto.precio_unit))}
                    </p>
                    <button
                      onClick={() => handleAgregarCarrito(producto)}
                      className="bg-[#2d3e50] text-white text-xs px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. BENEFICIOS RÁPIDOS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h5 className="font-bold text-[#2d3e50] text-sm">Recojo en Tienda</h5>
            <p className="text-xs text-slate-500">Gratis en nuestro local de Tacna</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h5 className="font-bold text-[#2d3e50] text-sm">Calidad MatVic</h5>
            <p className="text-xs text-slate-500">Productos probados y garantizados</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h5 className="font-bold text-[#2d3e50] text-sm">Atención Personalizada</h5>
            <p className="text-xs text-slate-500">Asesoría para tu modelo de móvil</p>
          </div>
        </div>
      </section>
    </div>
  );
}