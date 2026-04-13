export interface Product {
    id_producto: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio_unit: number;
    stock: number;
    min_stock: number;
    imagen_url?: string;
  }