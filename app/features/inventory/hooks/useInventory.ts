import { useState, useCallback } from "react";
import { getProducts, updateProduct, deleteProduct } from "~/core/api/products.api";
import type { Product, ProductFormData } from "~/features/inventory/types";

export interface InventoryState {
  products: Product[];
  isLoading: boolean;
  apiError: string | null;
  isSaving: boolean;
  reload: () => Promise<void>;
  save: (id: number, data: ProductFormData) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

/** Centraliza toda la lógica de carga y mutación del inventario */
export function useInventory(): InventoryState {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (id: number, data: ProductFormData) => {
    setIsSaving(true);
    try {
      await updateProduct(id, {
        nombre:      data.nombre,
        precio:      data.precio_unit,
        minStock:    data.min_stock,
        descripcion: data.descripcion,
        imagenUrl:   data.imagen_url,
        idCategoria: null,
      });
      await reload();
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const remove = useCallback(async (id: number) => {
    await deleteProduct(id);
    await reload();
  }, [reload]);

  return { products, isLoading, apiError, isSaving, reload, save, remove };
}
