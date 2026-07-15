import { api } from "~/core/api/client";
import type { Product } from "~/features/inventory/types";

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

interface UpdateProductPayload {
  nombre: string;
  precio: number;
  stock: number;
  minStock: number;
  descripcion?: string;
  imagenUrl?: string;
  idCategoria: number | null;
}

/** Obtiene todos los productos del inventario */
export async function getProducts(): Promise<Product[]> {
  const data = await api.get<ProductosResponse>("/productos");
  return data.productos;
}

/** Actualiza un producto por su ID */
export async function updateProduct(
  id: number,
  payload: UpdateProductPayload
): Promise<void> {
  await api.put(`/productos/${id}`, payload);
}

/** Crea un producto */
export async function createProduct(
  payload: UpdateProductPayload
): Promise<void> {
  await api.post(`/productos`, payload);
}

/** Desactiva (elimina lógicamente) un producto */
export async function deleteProduct(id: number): Promise<void> {
  await api.del(`/productos/${id}`);
}
