import { useState, useEffect } from "react";

/**
 * Retrasa la actualización de un valor mientras el usuario sigue escribiendo.
 * Útil para búsquedas que disparan llamadas a la API o filtrados costosos.
 *
 * @param value   Valor a debouncer (ej: el texto de un input de búsqueda)
 * @param delay   Tiempo de espera en ms (default: 300ms)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
