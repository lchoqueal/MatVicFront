// Tipos propios del módulo Inventario

export interface Product {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_unit: number;
  stock: number;
  min_stock: number;
  imagen_url?: string;
}

export type ProductFormData = Omit<Product, "id_producto">;
