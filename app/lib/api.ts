// Re-exporta el cliente HTTP desde su nueva ubicación en core/api/
// para mantener compatibilidad con cualquier import existente a ~/lib/api
export { api, ApiError } from "~/core/api/client";
export type { ApiResponse } from "~/core/api/client";
