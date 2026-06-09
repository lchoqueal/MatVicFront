import { useState, useEffect, useCallback } from "react";

/**
 * Hook reutilizable para dark mode.
 * Sincroniza el estado con localStorage y la clase `dark` del documento.
 * Extraído de AdminLayout para poder usarse en cualquier lugar.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setDark(
      saved === "dark" ||
        (!saved && document.documentElement.classList.contains("dark"))
    );
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}
