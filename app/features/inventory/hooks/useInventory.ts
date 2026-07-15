import { useState, useCallback, useEffect } from "react";
import { getProducts, updateProduct, createProduct, deleteProduct } from "~/core/api/products.api";
import { getCategories, createCategory, type Categoria } from "~/core/api/categories.api";
import type { Product, ProductFormData } from "~/features/inventory/types";

export interface InventoryState {
  products: Product[];
  categories: Categoria[];
  isLoading: boolean;
  apiError: string | null;
  isSaving: boolean;
  reload: () => Promise<void>;
  save: (id: number | null, data: ProductFormData, isNewCategory?: boolean, newCategoryName?: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

/** Centraliza toda la lógica de carga y mutación del inventario */
export function useInventory(): InventoryState {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProducts(),
        getCategories().catch(() => []) // Fallback in case categories fail initially
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al cargar inventario");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (id: number | null, data: ProductFormData, isNewCategory?: boolean, newCategoryName?: string) => {
    setIsSaving(true);
    try {
      let idCatToUse = data.id_categoria ?? null;

      // Si es categoría nueva, la creamos primero
      if (isNewCategory && newCategoryName) {
        const newCat = await createCategory(newCategoryName);
        idCatToUse = newCat.id_categoria;
      }

      const payload = {
        nombre:      data.nombre,
        precio:      data.precio_unit,
        minStock:    data.min_stock,
        descripcion: data.descripcion,
        imagenUrl:   data.imagen_url,
        idCategoria: idCatToUse,
      };

      if (id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      
      await reload();
    } finally {
      setIsSaving(false);
    }
  }, [reload]);

  const remove = useCallback(async (id: number) => {
    await deleteProduct(id);
    await reload();
  }, [reload]);

  return { products, categories, isLoading, apiError, isSaving, reload, save, remove };
}
