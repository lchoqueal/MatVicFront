import { Package } from "lucide-react";
import type { Product } from "~/features/inventory/types";
import type { CartItem } from "~/features/sales/types";

interface CategoryBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function CategoryBtn({ label, active, onClick }: CategoryBtnProps) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full font-semibold transition-all duration-200 ${active ? "shadow-sm" : "hover:bg-black/5"}`}
      style={active 
        ? { background: "var(--primary)", color: "white", border: "1px solid var(--primary)" } 
        : { background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }
      }>
      {label}
    </button>
  );
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  cart: CartItem[];
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onAddItem: (p: Product) => void;
}

export function ProductGrid({
  products, isLoading, cart, searchTerm, selectedCategory, categories,
  onSearchChange, onCategoryChange, onAddItem,
}: ProductGridProps) {
  return (
    <div className="flex flex-col flex-1 rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
      {/* Buscador y filtros */}
      <div className="p-4 border-b space-y-3 shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="relative">
          <input type="text" placeholder="Buscar producto rápido..." value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 transition-colors"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" } as React.CSSProperties} />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <CategoryBtn label="Todos" active={selectedCategory === "all"} onClick={() => onCategoryChange("all")} />
          {categories.map((cat) => (
            <CategoryBtn key={cat} label={cat} active={selectedCategory === cat} onClick={() => onCategoryChange(cat)} />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Package className="h-10 w-10 mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => {
              const inCart = cart.find((i) => i.producto.id_producto === p.id_producto);
              const sinStock = p.stock === 0;
              return (
                <button key={p.id_producto} type="button" onClick={() => !sinStock && onAddItem(p)} disabled={sinStock}
                  className={`relative flex flex-col items-start text-left p-3 rounded-xl border transition-all duration-200 ${sinStock ? "opacity-40 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"}`}
                  style={{ background: "var(--bg-surface-2)", borderColor: inCart ? "hsl(210, 28%, 37%)" : "var(--border-subtle)" }}>
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-sm"
                      style={{ background: "var(--primary)" }}>
                      {inCart.cantidad}
                    </span>
                  )}
                  <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                  <p className="text-xs font-semibold line-clamp-2 leading-tight mb-1" style={{ color: "var(--text-primary)" }}>{p.nombre}</p>
                  <p className="text-sm font-black" style={{ color: "hsl(210, 28%, 37%)" }}>
                    {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(p.precio_unit))}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {sinStock ? "Sin stock" : `Stock: ${p.stock}`}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
