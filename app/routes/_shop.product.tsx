import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, Star, Package, Smartphone, Loader2, AlertCircle } from "lucide-react";
import { api } from "~/lib/api";
import type { Product } from "~/types/inventory";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Si venimos desde la tienda, el producto ya está en el state de navegación
  const productoNavegado = (location.state as { producto?: Product } | null)?.producto ?? null;

  const [producto, setProducto] = useState<Product | null>(productoNavegado);
  const [isLoading, setIsLoading] = useState(!productoNavegado);
  const [error, setError] = useState<string | null>(null);

  // Si accedieron directamente a la URL (sin state), buscamos en la lista de productos
  useEffect(() => {
    if (productoNavegado || !id) return;

    const buscarProducto = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<ProductosResponse>("/productos");
        const encontrado = data.productos.find(
          (p) => p.id_producto === Number(id)
        );
        if (encontrado) {
          setProducto(encontrado);
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    };

    buscarProducto();
  }, [id, productoNavegado]);

  const handleAgregarCarrito = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // TODO: flujo de carrito online (próxima iteración)
  };

  // Estado: cargando
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#2d3e50] transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Estado: no encontrado
  if (error || !producto) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#2d3e50] transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Producto no disponible</h2>
          <p className="text-slate-400 text-sm mb-6">
            {error ?? "Este producto no existe o ya no está disponible."}
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#2d3e50] text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors text-sm"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  // Estado: producto encontrado
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#2d3e50] transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        {/* Imagen */}
        <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="text-center text-slate-400">
              <Package className="h-20 w-20 mx-auto mb-3" />
              <p className="text-sm font-medium">Sin imagen</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">
              {producto.categoria ?? "Accesorio"}
            </span>
            <h1 className="text-2xl font-bold text-[#2d3e50] mt-1">
              {producto.nombre}
            </h1>
          </div>

          {/* Rating decorativo */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-slate-400 ml-2">Producto verificado</span>
          </div>

          {/* Precio */}
          <div className="text-4xl font-black text-[#2d3e50]">
            S/ {Number(producto.precio_unit).toFixed(2)}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {producto.stock > producto.min_stock ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                ✓ En stock ({producto.stock} unidades)
              </span>
            ) : producto.stock > 0 ? (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                ⚠ Últimas {producto.stock} unidades
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Sin stock
              </span>
            )}
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <p className="text-slate-500 text-sm leading-relaxed">
              {producto.descripcion}
            </p>
          )}

          {/* Acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAgregarCarrito}
              disabled={producto.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2d3e50] text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
            <Smartphone className="h-4 w-4 text-blue-400" />
            <span>Compatible con múltiples modelos — consultar disponibilidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
