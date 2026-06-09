import { useState, useEffect } from "react";
import { Plus, Search, Package, AlertCircle, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import { useAuth } from "~/core/auth";
import { useInventory } from "~/features/inventory/hooks/useInventory";
import { CategoryFilter } from "~/features/inventory/components/CategoryFilter";
import { ProductTable } from "~/features/inventory/components/ProductTable";
import { ProductModal } from "~/features/inventory/components/ProductModal";
import type { Product } from "~/features/inventory/types";
import { formatCLP } from "~/lib/utils";

// Stats card inline (pequeño, solo para inventario)
function InventoryStat({ title, value, subtitle, critical = false }: {
  title: string; value: number | string; subtitle: string; critical?: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl" style={{
      background: critical ? "rgba(239,68,68,0.06)" : "var(--bg-surface)",
      border: `1px solid ${critical ? "rgba(239,68,68,0.25)" : "var(--border-main)"}`,
      boxShadow: "var(--shadow-card)",
    }}>
      <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${critical ? "text-red-400" : ""}`}
        style={!critical ? { color: "var(--text-muted)" } : {}}>{title}</h4>
      <div className={`text-2xl font-black my-1 ${critical ? "text-red-500" : ""}`}
        style={!critical ? { color: "var(--text-primary)" } : {}}>{value}</div>
      <p className={`text-[11px] font-medium ${critical ? "text-red-400" : ""}`}
        style={!critical ? { color: "var(--text-muted)" } : {}}>{subtitle}</p>
    </div>
  );
}

export function InventoryPage() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const { isAdmin } = useAuth();
  const { products, isLoading, apiError, isSaving, reload, save, remove } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => { reload(); }, [reload]);

  const categories = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length;
  const totalStock    = products.reduce((s, p) => s + p.stock, 0);
  const valorizacion  = products.reduce((s, p) => s + Number(p.precio_unit) * p.stock, 0);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descripcion ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const openEdit = (product: Product) => { setEditingProduct(product); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas desactivar este producto?")) return;
    await remove(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button onClick={reload} disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", color: "var(--text-secondary)", boxShadow: "var(--shadow-card)" }}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando…" : "Actualizar"}
        </button>
      </div>

      {/* Error */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />{apiError}
          <button onClick={reload} className="ml-auto underline font-medium">Reintentar</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <InventoryStat title="Total SKU"    value={isLoading ? "—" : products.length}           subtitle="productos únicos" />
        <InventoryStat title="Stock Físico" value={isLoading ? "—" : totalStock}                subtitle="unidades totales" />
        <InventoryStat title="Stock Bajo"   value={isLoading ? "—" : lowStockCount}             subtitle="requieren pedido" critical={lowStockCount > 0} />
        <InventoryStat title="Valorización" value={isLoading ? "—" : formatCLP(valorizacion)}   subtitle="precio de venta" />
      </div>

      {/* Filtros + botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Buscar por nombre o descripción..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <CategoryFilter categories={categories} selected={selectedCategory} onChange={setSelectedCategory} />
        </div>
        {isAdmin && (
          <button type="button" onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02]">
            <Plus className="h-4 w-4" /> Agregar Producto
          </button>
        )}
      </div>

      {/* Tabla */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        isAdmin={isAdmin}
        storeName={currentStore.name}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {isDialogOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsDialogOpen(false)}
          onSave={async (id, data) => { await save(id, data); setIsDialogOpen(false); }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
