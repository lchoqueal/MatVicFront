import { ShoppingCart, Eye, Star, Smartphone } from "lucide-react";

// Datos de ejemplo (Luego los traerás de tu PostgreSQL)
const PRODUCTOS_EJEMPLO = [
  {
    id: 1,
    nombre: "Funda Silicona Premium - iPhone 15",
    precio: 45.00,
    imagen: "https://images.unsplash.com/photo-1603313011101-31c72ee7a493?q=80&w=500",
    categoria: "Fundas"
  },
  {
    id: 2,
    nombre: "Cargador Carga Rápida 25W",
    precio: 65.00,
    imagen: "https://images.unsplash.com/photo-1619130771141-94901f40d398?q=80&w=500",
    categoria: "Cargadores"
  },
  {
    id: 3,
    nombre: "Protector Cerámico Mate",
    precio: 25.00,
    imagen: "https://images.unsplash.com/photo-1581134716095-5f4c01f46f30?q=80&w=500",
    categoria: "Micas"
  },
  {
    id: 4,
    nombre: "Audífonos In-Ear Bluetooth",
    precio: 120.00,
    imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500",
    categoria: "Audio"
  }
];

export default function ShopIndex() {
  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN HERO (BANNER PRINCIPAL) */}
      <section className="relative rounded-3xl overflow-hidden bg-[#2d3e50] h-[350px] flex items-center shadow-xl">
        <div className="absolute inset-0 bg-linear-to-r from-[#1a2530] to-transparent opacity-90"></div>
        <div className="relative z-10 px-12 space-y-4 max-w-2xl">
          <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Temporada 2026</span>
          <h2 className="text-5xl font-extrabold text-white leading-tight">
            Protección con <br /> <span className="text-blue-500">Estilo MatVic</span>
          </h2>
          <p className="text-slate-300 text-lg">
            Los mejores accesorios para tu smartphone seleccionados con calidad garantizada en Tacna.
          </p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 shadow-lg">
            Ver Catálogo
          </button>
        </div>
      </section>

      {/* 2. GRILLA DE PRODUCTOS */}
      <section>
        <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#2d3e50]">Accesorios Destacados</h3>
            <p className="text-slate-500 text-sm">Novedades recién llegadas a la tienda</p>
          </div>
          <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:ring-blue-500 outline-none">
            <option>Ordenar por: Más recientes</option>
            <option>Precio: Menor a Mayor</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTOS_EJEMPLO.map((producto) => (
            <div 
              key={producto.id} 
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Contenedor Imagen con Overlay */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-[#2d3e50]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="bg-white p-2 rounded-full text-[#2d3e50] hover:bg-blue-500 hover:text-white transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="bg-white p-2 rounded-full text-[#2d3e50] hover:bg-blue-500 hover:text-white transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Info del Producto */}
              <div className="p-5 flex flex-col grow">
                <span className="text-[10px] uppercase font-bold text-blue-600 mb-1">{producto.categoria}</span>
                <h4 className="font-semibold text-[#2d3e50] text-lg mb-2 line-clamp-2">
                  {producto.nombre}
                </h4>
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">(12 reseñas)</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xl font-bold text-[#2d3e50]">S/ {producto.precio.toFixed(2)}</p>
                  <button className="bg-[#2d3e50] text-white text-xs px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            <h5 className="font-bold text-[#2d3e50] text-sm">Calidad SAVI</h5>
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