import { Link, useParams } from "react-router";
import { ArrowLeft, ShoppingCart, Star, Package, Smartphone } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();

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
        <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
          <div className="text-center text-slate-400">
            <Package className="h-20 w-20 mx-auto mb-3" />
            <p className="text-sm font-medium">Imagen del producto</p>
            <p className="text-xs mt-1">ID: {id}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">
              Categoría
            </span>
            <h1 className="text-2xl font-bold text-[#2d3e50] mt-1">
              Nombre del Producto
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-slate-400 ml-2">(12 reseñas)</span>
          </div>

          {/* Precio */}
          <div className="text-4xl font-black text-[#2d3e50]">
            S/ 00.00
          </div>

          <p className="text-slate-500 text-sm leading-relaxed">
            Descripción del producto. Aquí se mostrará la información detallada
            del accesorio, características, compatibilidad y más.
          </p>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2d3e50] text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
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
