import { useState } from "react";
import { Plus, Edit, Search, Package, X, Trash2, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { Product } from "~/types/inventory";

// --- DATOS DE PRUEBA (MOCKS) ---
const MOCK_PRODUCTS: Product[] = [
  { id_producto: 1, nombre: "Cargador Carga Rápida 25W", descripcion: "Original Samsung Blanco", categoria: "Cargadores", precio_unit: 65, stock: 15, min_stock: 5 },
  { id_producto: 2, nombre: "Funda Silicona iPhone 15", descripcion: "Color Negro Mate", categoria: "Fundas", precio_unit: 45, stock: 3, min_stock: 5 },
  { id_producto: 3, nombre: "Mica Cerámica Privacidad", descripcion: "Para modelos iPhone y Samsung", categoria: "Micas", precio_unit: 25, stock: 50, min_stock: 10 },
];

export default function InventoryManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = [...new Set(products.map(p => p.categoria))];

  // Filtro de búsqueda
  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este accesorio?")) {
      setProducts(products.filter(p => p.id_producto !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. RESUMEN DE INVENTARIO */}
      <div className="grid gap-4 md:grid-cols-4">
        <InventoryStat title="Total SKU" value={products.length} subtitle="Productos únicos" />
        <InventoryStat title="Stock Físico" value={products.reduce((s, p) => s + p.stock, 0)} subtitle="Unidades totales" />
        <InventoryStat 
          title="Stock Bajo" 
          value={lowStockCount} 
          subtitle="Requieren pedido" 
          critical={lowStockCount > 0} 
        />
        <InventoryStat 
          title="Valorización" 
          value={`S/ ${products.reduce((s, p) => s + (p.precio_unit * p.stock), 0)}`} 
          subtitle="Precio de venta" 
        />
      </div>

      {/* 2. ACCIONES Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar accesorio..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus className="h-4 w-4" /> Agregar Producto
        </button>
      </div>

      {/* 3. TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Catálogo en {currentStore.name}</h3>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-tighter">SAVI v1.0 Inventario</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id_producto} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                      <Package className="h-6 w-6 text-slate-300" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700 text-sm">{product.nombre}</div>
                    <div className="text-[11px] text-slate-400">{product.descripcion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                      {product.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.min_stock && (
                        <span className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1">
                          <AlertCircle className="h-2 w-2" /> Crítico
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">S/ {product.precio_unit.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id_producto)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DIALOGO DE EDICIÓN/CREACIÓN */}
      {isDialogOpen && (
        <ProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setIsDialogOpen(false)} 
        />
      )}
    </div>
  );
}

// --- SUBCOMPONENTES ---

function InventoryStat({ title, value, subtitle, critical }: any) {
  return (
    <div className={`p-6 rounded-xl border shadow-sm ${critical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
      <h4 className={`text-xs font-bold uppercase tracking-wider ${critical ? 'text-red-400' : 'text-slate-400'}`}>{title}</h4>
      <div className={`text-2xl font-black my-1 ${critical ? 'text-red-700' : 'text-slate-800'}`}>{value}</div>
      <p className={`text-[11px] font-medium ${critical ? 'text-red-500' : 'text-slate-500'}`}>{subtitle}</p>
    </div>
  );
}

function ProductModal({ product, categories, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{product ? "Editar Accesorio" : "Nuevo Accesorio"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <form className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
              <input type="text" defaultValue={product?.nombre} className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none text-sm">
                  {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Precio (S/)</label>
                <input type="number" defaultValue={product?.precio_unit} className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Stock Inicial</label>
                <input type="number" defaultValue={product?.stock} className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Stock Mínimo</label>
                <input type="number" defaultValue={product?.min_stock} className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none text-sm" />
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}