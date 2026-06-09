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
  return api.get<ReporteVentas>(
    `/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
  );
}

/** Alertas de productos con stock bajo o agotado */
export async function getStockAlerts(): Promise<AlertaStock[]> {
  const data = await api.get<AlertasResponse>("/productos/alertas/stock-bajo");
  return data.alertas;
}

/** Resumen del inventario (totales, valorización, bajo stock) */
export async function getInventoryReport(): Promise<ReporteInventario> {
  return api.get<ReporteInventario>("/reportes/inventario");
}
