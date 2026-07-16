import { api } from "~/core/api/client";

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface BackendCategoriesResponse {
  cantidad: number;
  categorias: Array<{
    id: number;
    nombre: string;
  }>;
}

interface BackendCreateCategoryResponse {
  id: number;
  nombre: string;
}

export async function getCategories(): Promise<Categoria[]> {
  const data = await api.get<BackendCategoriesResponse>("/categorias");
  return (data.categorias || []).map(c => ({
    id_categoria: c.id,
    nombre: c.nombre
  }));
}

export async function createCategory(nombre: string): Promise<Categoria> {
  const data = await api.post<BackendCreateCategoryResponse>("/categorias", { nombre });
  return {
    id_categoria: data.id,
    nombre: data.nombre
  };
}
