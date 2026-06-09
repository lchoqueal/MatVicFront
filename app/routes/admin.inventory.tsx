import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Search, Package, X, Trash2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { Product } from "~/types/inventory";
import { formatCLP, getStockStatus } from "~/lib/utils";
import ProductImage from "~/components/ui/ProductImage";
import { api } from "~/lib/api";
import { useAuth } from "~/context/auth";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function InventoryManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cargarProductos = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await api.get<ProductosResponse>("/productos");
      setProducts(data.productos);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const categories = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const valorizacion = products.reduce((s, p) => s + Number(p.precio_unit) * p.stock, 0);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descripcion ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: Omit<Product, "id_producto">) => {
    if (!editingProduct) return; // por ahora solo edición (el backend no tiene POST /productos)
    setIsSaving(true);
    try {
      await api.put(`/productos/${editingProduct.id_producto}`, {
        nombre: data.nombre,
        precio: data.precio_unit,
        minStock: data.min_stock,
        descripcion: data.descripcion,
        imagenUrl: data.imagen_url,
        idCategoria: null,
      });
      setIsDialogOpen(false);
      await cargarProductos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas desactivar este producto?")) return;
    try {
      await api.del(`/productos/${id}`);
      await cargarProductos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el producto");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={cargarProductos}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-main)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando…" : "Actualizar"}
        </button>
      </div>

      {/* Error global */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {apiError}
          <button onClick={cargarProductos} className="ml-auto underline font-medium">Reintentar</button>
        </div>
      )}

      {/* 1. RESUMEN DE INVENTARIO */}
      <div className="grid gap-4 md:grid-cols-4">
        {([
          { title: "Total SKU",    value: isLoading ? "—" : products.length,                subtitle: "productos únicos"  },
          { title: "Stock Físico", value: isLoading ? "—" : totalStock,                    subtitle: "unidades totales"  },
          { title: "Stock Bajo",   value: isLoading ? "—" : lowStockCount,                 subtitle: "requieren pedido", critical: lowStockCount > 0 },
          { title: "Valorización", value: isLoading ? "—" : formatCLP(valorizacion),       subtitle: "precio de venta"  },
        ] as const).map((stat, i) => (
          <div
            key={stat.title}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 75}ms`, animationFillMode: "both" }}
          >
            <InventoryStat
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              critical={"critical" in stat ? stat.critical : false}
            />
          </div>
        ))}
      </div>

      {/* 2. FILTROS + BOTÓN */}
      <div
        className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Botón agregar: solo para admin */}
        {isAdmin && (
          <button
            type="button"
            onClick={openAdd}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Agregar Producto
          </button>
        )}
      </div>

      {/* 3. TABLA */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Package className="h-5 w-5" />
            Productos en {currentStore.name}
          </h3>
          <span
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}
          >
            {isLoading ? "Cargando..." : `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No se encontraron productos</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Prueba con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }} className="text-xs uppercase font-bold tracking-wide">
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
              <tbody style={{ borderColor: "var(--border-subtle)" }} className="divide-y">
                {filteredProducts.map((product, i) => {
                  const stockStatus = getStockStatus(product.stock, product.min_stock);
                  return (
                    <tr
                      key={product.id_producto}
                      className="transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4">
                        <ProductImage producto={product} size="sm" />
                      </td>
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
                      {/* Botones de edición: solo para admin */}
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-lg transition-colors hover:bg-pickled-bluewood-500/10 text-pickled-bluewood-400"
                              title="Editar producto"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id_producto)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
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

      {/* 4. MODAL */}
      {isDialogOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function InventoryStat({ title, value, subtitle, critical = false }: {
  title: string;
  value: number | string;
  subtitle: string;
  critical?: boolean;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: critical ? "rgba(239,68,68,0.06)" : "var(--bg-surface)",
        border: `1px solid ${critical ? "rgba(239,68,68,0.25)" : "var(--border-main)"}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${critical ? "text-red-400" : ""}`}
        style={!critical ? { color: "var(--text-muted)" } : {}}>
        {title}
      </h4>
      <div className={`text-2xl font-black my-1 ${critical ? "text-red-500" : ""}`}
        style={!critical ? { color: "var(--text-primary)" } : {}}>
        {value}
      </div>
      <p className={`text-[11px] font-medium ${critical ? "text-red-400" : ""}`}
        style={!critical ? { color: "var(--text-muted)" } : {}}>
        {subtitle}
      </p>
    </div>
  );
}

// ── Modal de producto ─────────────────────────────────────────────────────────

type ProductFormData = Omit<Product, "id_producto">;

interface ProductModalProps {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
  isSaving: boolean;
}

function ProductModal({ product, categories, onClose, onSave, isSaving }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre:       product?.nombre       ?? "",
    descripcion:  product?.descripcion  ?? "",
    categoria:    product?.categoria    ?? "",
    precio_unit:  product?.precio_unit  ?? 0,
    stock:        product?.stock        ?? 0,
    min_stock:    product?.min_stock    ?? 5,
    imagen_url:   product?.imagen_url   ?? undefined,
  });

  // Estado separado para cuando el usuario escribe una nueva categoría
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imagen_url);
  const isNewCategory = formData.categoria === "__nueva__";

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      set("imagen_url", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Si está creando una nueva categoría, usar el nombre escrito
    const dataToSave: ProductFormData = isNewCategory
      ? { ...formData, categoria: newCategoryName.trim() }
      : formData;
    if (isNewCategory && !newCategoryName.trim()) return; // no guardar sin nombre
    onSave(dataToSave);
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center shrink-0" style={{ borderColor: "var(--border-main)" }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {product ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {product ? "Modifica la información del producto" : "Ingresa los datos del nuevo producto"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Nombre del producto *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              placeholder="Ej: Funda Silicona iPhone 15"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Categoría *</label>
            <select
              value={formData.categoria}
              onChange={(e) => {
                set("categoria", e.target.value);
                if (e.target.value !== "__nueva__") setNewCategoryName("");
              }}
              required={!isNewCategory}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__nueva__">+ Nueva categoría</option>
            </select>
            {isNewCategory && (
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
                style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
                placeholder="Nombre de la nueva categoría"
                required
                autoFocus
              />
            )}
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Precio ($) *</label>
              <input
                type="number" min={0} step={1}
                value={formData.precio_unit}
                onChange={(e) => set("precio_unit", Number(e.target.value))}
                required
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
                style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock actual *</label>
              <input
                type="number" min={0}
                value={formData.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                required
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
                style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Stock mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock mínimo *</label>
            <input
              type="number" min={0}
              value={formData.min_stock}
              onChange={(e) => set("min_stock", Number(e.target.value))}
              required
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Descripción</label>
            <textarea
              value={formData.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm resize-none transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              placeholder="Descripción breve del producto..."
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Imagen del producto</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pickled-bluewood-600 file:text-white hover:file:bg-pickled-bluewood-700 transition-colors"
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>JPG, PNG, WebP. Máximo 5 MB</p>
              </div>
              <div className="shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" style={{ border: "1px solid var(--border-main)" }} />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: "var(--border-main)", background: "var(--bg-muted)" }}>
                    <Package className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-pickled-bluewood-600 text-white rounded-xl hover:bg-pickled-bluewood-700 transition-colors text-sm font-bold disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? "Actualizar" : "Agregar"} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}