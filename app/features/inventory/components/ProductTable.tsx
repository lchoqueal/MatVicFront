import { Edit, Package, Trash2, AlertCircle } from "lucide-react";
import ProductImage from "~/components/ui/ProductImage";
import { formatCLP, getStockStatus } from "~/lib/utils";
import type { Product } from "~/features/inventory/types";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  isAdmin: boolean;
  storeName: string;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductTable({ products, isLoading, isAdmin, storeName, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
      <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border-subtle)" }}>
        <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Package className="h-5 w-5" />
          Productos en {storeName}
        </h3>
        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}>
          {isLoading ? "Cargando..." : `${products.length} resultado${products.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No se encontraron productos</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Prueba con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-xs uppercase font-bold tracking-wide" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
                {isAdmin && <th className="px-6 py-4">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {products.map((product, i) => {
                const stockStatus = getStockStatus(product.stock, product.min_stock);
                return (
                  <tr
                    key={product.id_producto}
                    className="transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-6 py-4"><ProductImage producto={product} size="sm" /></td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{product.nombre}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{product.descripcion}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-bold uppercase">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {formatCLP(product.precio_unit)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start">
                        <span className={`font-bold text-sm ${product.stock <= product.min_stock ? "text-red-600" : "text-pickled-bluewood-700"}`}>
                          {product.stock} unidades
                        </span>
                        {product.stock <= product.min_stock && (
                          <span className="text-[9px] text-red-500 font-black flex items-center gap-0.5 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" /> Crítico
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => onEdit(product)}
                            className="p-2 rounded-lg transition-colors hover:bg-pickled-bluewood-500/10 text-pickled-bluewood-400" title="Editar producto">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => onDelete(product.id_producto)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar producto">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
