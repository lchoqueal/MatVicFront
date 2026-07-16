import { api } from "~/core/api/client";
import type { Boleta, AlertaStock } from "~/features/dashboard/types";

export interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  cantidadVentas: number;
  totalVentas: number;
  promedioVenta: number;
  boletas: Boleta[];
}

export interface AlertasResponse {
  cantidad: number;
  alertas: AlertaStock[];
}

export interface ReporteInventario {
  totalProductos: number;
  totalValorInventario: number;
  productosBajo: number;
}

/** Reporte de ventas para un rango de fechas (YYYY-MM-DD) */
export async function getSalesReport(
  fechaInicio: string,
  fechaFin: string
): Promise<ReporteVentas> {
  const data = await api.get<any>(
    `/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
  );
  
  // Mapear la respuesta del backend (camelCase) al tipo del frontend (snake_case)
  if (data && data.boletas) {
    data.boletas = data.boletas.map((b: any) => ({
      id_boleta: b.id,
      total: b.total,
      fecha_emision: b.fechaEmision,
      metodo_pago: b.metodoPago,
      estado_boleta: b.estado,
      id_local: b.idLocal
    }));
  }
  
  return data;
}

/** Alertas de productos con stock bajo o agotado */
export async function getStockAlerts(): Promise<AlertaStock[]> {
  try {
    // Usa el endpoint existente /productos/stock-bajo
    const data = await api.get<{ cantidad: number; productos: Array<{
      id_producto: number; nombre: string; stock: number; min_stock: number; precio_unit: number;
    }> }>("/productos/stock-bajo");
    return (data.productos ?? []).map(p => ({
      idProducto: p.id_producto,
      nombre: p.nombre,
      stockActual: p.stock,
      stockMinimo: p.min_stock,
      diferencia: p.min_stock - p.stock,
      precio: p.precio_unit,
      urgencia: p.stock === 0 ? 5 : Math.ceil((p.min_stock - p.stock) / p.min_stock * 5),
    }));
  } catch {
    return [];
  }
}

/** Resumen del inventario (totales, valorización, bajo stock) */
export async function getInventoryReport(): Promise<ReporteInventario> {
  return api.get<ReporteInventario>("/reportes/inventario");
}
