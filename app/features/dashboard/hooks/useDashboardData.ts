import { useState, useCallback, useEffect } from "react";
import {
  getSalesReport,
  getStockAlerts,
  getInventoryReport,
} from "~/core/api/reports.api";
import type {
  Boleta,
  AlertaStock,
  ReporteInventario,
  MesVenta,
} from "~/features/dashboard/types";

// ── Helpers de fechas ─────────────────────────────────────────────────────────

function getFechasMesActual() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return {
    inicio: inicio.toISOString().split("T")[0],
    fin:    fin.toISOString().split("T")[0],
  };
}

function getFechasUltimosSeisMeses() {
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0],
      fin:    new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0],
      label:  MESES[d.getMonth()],
    };
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface DashboardData {
  boletasMes: Boleta[];
  historialVentas: { month: string; sales: number }[];
  alertas: AlertaStock[];
  inventario: ReporteInventario | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useDashboardData(currentStoreId: number): DashboardData {
  const [boletasRaw, setBoletasRaw]     = useState<Boleta[]>([]);
  const [historialRaw, setHistorialRaw] = useState<MesVenta[]>([]);
  const [alertas, setAlertas]           = useState<AlertaStock[]>([]);
  const [inventario, setInventario]     = useState<ReporteInventario | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const { inicio, fin } = getFechasMesActual();
      const [ventasR, alertasR, inventarioR] = await Promise.allSettled([
        getSalesReport(inicio, fin),
        getStockAlerts(),
        getInventoryReport(),
      ]);

      if (ventasR.status     === "fulfilled") setBoletasRaw(ventasR.value.boletas ?? []);
      if (alertasR.status    === "fulfilled") setAlertas(alertasR.value);
      if (inventarioR.status === "fulfilled") setInventario(inventarioR.value);

      const meses = getFechasUltimosSeisMeses();
      const historial = await Promise.all(
        meses.map(({ inicio: i, fin: f, label }) =>
          getSalesReport(i, f)
            .then((d) => ({ month: label, sales: Number(d.totalVentas) || 0, salesGlobal: Number(d.totalVentas) || 0, boletas: d.boletas ?? [] }))
            .catch(() => ({ month: label, sales: 0, salesGlobal: 0, boletas: [] as Boleta[] }))
        )
      );
      setHistorialRaw(historial);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Filtrado client-side por local
  const boletasMes = boletasRaw.filter(
    (b) => b.id_local == null || b.id_local === currentStoreId
  );

  const historialVentas = historialRaw.map((m) => ({
    month: m.month,
    sales: m.boletas
      .filter((b) => b.id_local == null || b.id_local === currentStoreId)
      .reduce((s, b) => s + Number(b.total), 0),
  }));

  return { boletasMes, historialVentas, alertas, inventario, isLoading, lastUpdated, refresh: cargar };
}
