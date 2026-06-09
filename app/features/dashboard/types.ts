// Tipos propios del módulo Dashboard

export interface Boleta {
  id_boleta: number;
  total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_boleta: string;
  id_local?: number;
}

export interface AlertaStock {
  idProducto: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
  precio: number;
  urgencia: string;
}

export interface ReporteInventario {
  totalProductos: number;
  totalValorInventario: number;
  productosBajo: number;
}

export interface MesVenta {
  month: string;
  sales: number;
  salesGlobal: number;
  boletas: Boleta[];
}

export interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  cantidadVentas: number;
  totalVentas: number;
  promedioVenta: number;
  boletas: Boleta[];
}
