/**
 * Cliente HTTP central para la API de MatVic.
 *
 * Uso:
 *   import { api } from "~/lib/api";
 *   const data = await api.get("/productos");
 *   const data = await api.post("/auth/login", { username, password });
 */

const BASE_URL = import.meta.env.VITE_API_URL as string;

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  codigo?: string;
  mensaje?: string;
}

export class ApiError extends Error {
  constructor(
    public codigo: string,
    mensaje: string
  ) {
    super(mensaje);
    this.name = "ApiError";
  }
}

// ── Helper principal ──────────────────────────────────────────────────────────

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Intentar parsear siempre como JSON
  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "PARSE_ERROR",
      `Error al procesar la respuesta del servidor (${response.status})`
    );
  }

  // El backend siempre responde { success, data } o { success: false, codigo, mensaje }
  if (!body.success) {
    throw new ApiError(
      body.codigo ?? "ERROR_DESCONOCIDO",
      body.mensaje ?? "Error interno del servidor"
    );
  }

  return body.data as T;
}

// ── Métodos ───────────────────────────────────────────────────────────────────

export const api = {
  get<T = unknown>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "GET" });
  },

  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  del<T = unknown>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "DELETE" });
  },
};
