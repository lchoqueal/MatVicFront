// Re-exporta desde su nueva ubicación en core/auth/
// para mantener compatibilidad con cualquier import existente a ~/context/auth
export { useAuth, AuthProvider } from "~/core/auth";
export type { AuthUser, UserRole } from "~/core/auth";
