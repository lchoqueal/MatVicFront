import { useState, useCallback, useEffect } from "react";
import { getSalesReport } from "~/core/api/reports.api";
import type { Boleta } from "~/features/sales/types";

export interface SalesReportState {
  boletas: Boleta[];
  isLoading: boolean;
  reload: () => void;
  totalHoy: number;
  ticketPromedio: number;
}

/** Carga las boletas del día actual, filtradas por local */
export function useSalesReport(currentStoreId: number): SalesReportState {
  const [boletasRaw, setBoletasRaw] = useState<Boleta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const data = await getSalesReport(hoy, hoy);
      setBoletasRaw(data.boletas ?? []);
    } catch {
      setBoletasRaw([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const boletas = boletasRaw.filter(
    (b) => b.id_local == null || b.id_local === currentStoreId
  );

  const totalHoy = boletas.reduce((sum, b) => sum + Number(b.total), 0);
  const ticketPromedio = boletas.length > 0 ? Math.round(totalHoy / boletas.length) : 0;

  return { boletas, isLoading, reload: cargar, totalHoy, ticketPromedio };
}
