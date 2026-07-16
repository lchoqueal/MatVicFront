import { api } from "~/core/api/client";

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export async function getCategories(): Promise<Categoria[]> {
  return api.get<Categoria[]>("/categorias");
}

export async function createCategory(nombre: string): Promise<Categoria> {
  return api.post<Categoria>("/categorias", { nombre });
}
