import { useState } from "react";
import { Plus, Edit, Search, Package, X, Trash2, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { Product } from "~/types/inventory";
import { formatCLP, getStockStatus } from "~/lib/utils";
import ProductImage from "~/components/ui/ProductImage";

// ── Datos mock iniciales ─────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  { id_producto: 1, nombre: "Cargador Carga Rápida 25W", descripcion: "Original Samsung Blanco", categoria: "Cargadores", precio_unit: 65,  stock: 15, min_stock: 5  },
  { id_producto: 2, nombre: "Funda Silicona iPhone 15",   descripcion: "Color Negro Mate",         categoria: "Fundas",     precio_unit: 45,  stock: 3,  min_stock: 5  },
  { id_producto: 3, nombre: "Mica Cerámica Privacidad",   descripcion: "iPhone y Samsung",          categoria: "Micas",      precio_unit: 25,  stock: 50, min_stock: 10 },
  { id_producto: 4, nombre: "Audífonos In-Ear Bluetooth", descripcion: "Hasta 20h de batería",      categoria: "Audio",      precio_unit: 120, stock: 5,  min_stock: 3  },
  { id_producto: 5, nombre: "Cable USB-C a USB-C 1m",    descripcion: "Trenzado de nylon",         categoria: "Cables",     precio_unit: 18,  stock: 40, min_stock: 10 },
];

// ── Página principal ─────────────────────────────────────────────────────────

export default function InventoryManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = [...new Set(products.map((p) => p.categoria))];
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const valorizacion = products.reduce((s, p) => s + p.precio_unit * p.stock, 0);

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

  const handleSave = (data: Omit<Product, "id_producto">) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id_producto === editingProduct.id_producto
            ? { ...editingProduct, ...data }
            : p
        )
      );
    } else {
      const newId = Math.max(...products.map((p) => p.id_producto), 0) + 1;
      setProducts((prev) => [...prev, { id_producto: newId, ...data }]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.")) return;
    setProducts((prev) => prev.filter((p) => p.id_producto !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. RESUMEN DE INVENTARIO */}
      <div className="grid gap-4 md:grid-cols-4">
        <InventoryStat title="Total SKU"       value={products.length}        subtitle="productos únicos"  />
        <InventoryStat title="Stock Físico"    value={totalStock}             subtitle="unidades totales"  />
        <InventoryStat title="Stock Bajo"      value={lowStockCount}         subtitle="requieren pedido"  critical={lowStockCount > 0} />
        <InventoryStat title="Valorización"    value={formatCLP(valorizacion)} subtitle="precio de venta" />
      </div>

      {/* 2. FILTROS + BOTÓN */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm bg-white"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Agregar Producto
        </button>
      </div>

      {/* 3. TABLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-pickled-bluewood-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos en {currentStore.name}
          </h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-pickled-bluewood-600 font-medium">No se encontraron productos</p>
            <p className="text-sm text-slate-400 mt-1">Prueba con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pickled-bluewood-50 text-pickled-bluewood-700 text-xs uppercase font-bold tracking-wide">
                <tr>
                  <th className="px-6 py-4">Imagen</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pickled-bluewood-100">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.min_stock);
                  return (
                    <tr key={product.id_producto} className="hover:bg-pickled-bluewood-50 transition-colors">
                      <td className="px-6 py-4">
                        <ProductImage producto={product} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-pickled-bluewood-800 text-sm">{product.nombre}</div>
                        <div className="text-xs text-slate-400">{product.descripcion}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-pickled-bluewood-800 text-sm">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="p-2 text-pickled-bluewood-600 hover:bg-pickled-bluewood-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id_producto)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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
        />
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function InventoryStat({
  title,
  value,
  subtitle,
  critical = false,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  critical?: boolean;
}) {
  return (
    <div className={`p-6 rounded-xl border shadow-sm ${critical ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
      <h4 className={`text-xs font-bold uppercase tracking-wider ${critical ? "text-red-400" : "text-slate-400"}`}>
        {title}
      </h4>
      <div className={`text-2xl font-black my-1 ${critical ? "text-red-700" : "text-pickled-bluewood-800"}`}>
        {value}
      </div>
      <p className={`text-[11px] font-medium ${critical ? "text-red-500" : "text-slate-500"}`}>
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
  onSave: (data: ProductFormData) => void;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre:       product?.nombre       ?? "",
    descripcion:  product?.descripcion  ?? "",
    categoria:    product?.categoria    ?? "",
    precio_unit:  product?.precio_unit  ?? 0,
    stock:        product?.stock        ?? 0,
    min_stock:    product?.min_stock    ?? 5,
    imagen_url:   product?.imagen_url   ?? undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imagen_url);

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
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-pickled-bluewood-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-pickled-bluewood-800">
              {product ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {product ? "Modifica la información del producto" : "Ingresa los datos del nuevo producto"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Nombre del producto *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              required
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
              placeholder="Ej: Funda Silicona iPhone 15"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Categoría *</label>
            <select
              value={formData.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              required
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm bg-white"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__nueva__">+ Nueva categoría</option>
            </select>
            {formData.categoria === "__nueva__" && (
              <input
                type="text"
                className="w-full mt-2 px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
                placeholder="Nombre de la nueva categoría"
                onChange={(e) => set("categoria", e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Precio (S/) *</label>
              <input
                type="number"
                min={0}
                step={1}
                value={formData.precio_unit}
                onChange={(e) => set("precio_unit", Number(e.target.value))}
                required
                className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Stock actual *</label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                required
                className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
              />
            </div>
          </div>

          {/* Stock mínimo */}
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Stock mínimo *</label>
            <input
              type="number"
              min={0}
              value={formData.min_stock}
              onChange={(e) => set("min_stock", Number(e.target.value))}
              required
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Descripción</label>
            <textarea
              value={formData.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm resize-none"
              placeholder="Descripción breve del producto..."
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-1.5">Imagen del producto</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pickled-bluewood-50 file:text-pickled-bluewood-700 hover:file:bg-pickled-bluewood-100 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WebP. Máximo 5 MB</p>
              </div>
              <div className="shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-400" />
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
              className="px-4 py-2 border border-pickled-bluewood-200 text-pickled-bluewood-700 rounded-lg hover:bg-pickled-bluewood-50 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors text-sm font-bold"
            >
              {product ? "Actualizar" : "Agregar"} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}