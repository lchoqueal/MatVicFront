import { useState } from "react";
import { X, Package, Loader2 } from "lucide-react";
import type { Product, ProductFormData } from "~/features/inventory/types";
import type { Categoria } from "~/core/api/categories.api";

interface ProductModalProps {
  product: Product | null;
  categories: Categoria[];
  onClose: () => void;
  onSave: (id: number | null, data: ProductFormData, isNewCat?: boolean, newCatName?: string) => Promise<void>;
  isSaving: boolean;
}

export function ProductModal({ product, categories, onClose, onSave, isSaving }: ProductModalProps) {
  // Encontramos el idCategoria si el producto ya tiene categoría
  const initialCat = product?.categoria 
    ? categories.find(c => c.nombre === product.categoria)?.id_categoria 
    : undefined;

  const [formData, setFormData] = useState<ProductFormData>({
    nombre:      product?.nombre      ?? "",
    descripcion: product?.descripcion ?? "",
    categoria:   product?.categoria   ?? "",
    id_categoria: initialCat,
    precio_unit: product?.precio_unit ?? 0,
    stock:       product?.stock       ?? 0,
    min_stock:   product?.min_stock   ?? 5,
    imagen_url:  product?.imagen_url  ?? undefined,
  });
  
  // Usamos categoria_select como estado local para manejar el selector
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCat ? String(initialCat) : "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imagen_url);
  const isNewCategory = selectedCatId === "__nueva__";

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localReader = new FileReader();
    localReader.onloadend = () => {
      setImagePreview(localReader.result as string);
    };
    localReader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Variables VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET ausentes en el .env");
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Error al subir la imagen a Cloudinary");
      }

      set("imagen_url", data.secure_url);
      setImagePreview(data.secure_url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al procesar la imagen.");
      setImagePreview(product?.imagen_url);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewCategory && !newCategoryName.trim()) return;
    
    const dataToSave = { 
      ...formData, 
      id_categoria: isNewCategory ? undefined : Number(selectedCatId)
    };
    
    onSave(product ? product.id_producto : null, dataToSave, isNewCategory, newCategoryName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
        <div className="p-6 border-b flex justify-between items-center shrink-0" style={{ borderColor: "var(--border-main)" }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {product ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {product ? "Modifica la información del producto" : "Ingresa los datos del nuevo producto"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Nombre del producto *</label>
            <input type="text" value={formData.nombre} onChange={(e) => set("nombre", e.target.value)} required
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              placeholder="Ej: Funda Silicona iPhone 15" />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Categoría *</label>
            <select value={selectedCatId} onChange={(e) => { setSelectedCatId(e.target.value); if (e.target.value !== "__nueva__") setNewCategoryName(""); }}
              required={!isNewCategory}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm transition-colors"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }}>
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              <option value="__nueva__">+ Nueva categoría</option>
            </select>
            {isNewCategory && (
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                placeholder="Nombre de la nueva categoría" required autoFocus />
            )}
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Precio ($) *</label>
              <input type="number" min={0} step={1} value={formData.precio_unit} onChange={(e) => set("precio_unit", Number(e.target.value))} required
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock actual *</label>
              <input type="number" min={0} value={formData.stock} onChange={(e) => set("stock", Number(e.target.value))} required
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }} />
            </div>
          </div>

          {/* Stock mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock mínimo *</label>
            <input type="number" min={0} value={formData.min_stock} onChange={(e) => set("min_stock", Number(e.target.value))} required
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }} />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Descripción</label>
            <textarea value={formData.descripcion ?? ""} onChange={(e) => set("descripcion", e.target.value)} rows={2}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 text-sm resize-none"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              placeholder="Descripción breve del producto..." />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Imagen del producto</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleFile}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pickled-bluewood-600 file:text-white hover:file:bg-pickled-bluewood-700" />
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>JPG, PNG, WebP. Máximo 5 MB</p>
              </div>
              <div className="shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" style={{ border: "1px solid var(--border-main)" }} />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                    <Package className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
              Cancelar
            </button>
            <button type="submit" disabled={isSaving || isUploadingImage}
              className="flex items-center gap-2 px-5 py-2 text-white rounded-xl transition-colors text-sm font-bold disabled:opacity-60"
              style={{ background: "var(--primary)" }}>
              {(isSaving || isUploadingImage) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploadingImage ? "Subiendo Imagen..." : product ? "Actualizar" : "Agregar"} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
