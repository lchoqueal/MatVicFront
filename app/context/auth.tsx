import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, ApiError } from "~/lib/api";

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Roles tal como los devuelve el backend */
export type UserRole = "administrador" | "empleado" | "cliente";

export interface AuthUser {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  rol: UserRole;
}

interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmpleado: boolean;
  isCliente: boolean;
  /** true mientras se restaura la sesión desde localStorage (solo dura un tick) */
  isHydrating: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Siempre iniciamos con null para que servidor y cliente rendericen igual
  // (evita hydration mismatch en React Router v7 SSR).
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // isHydrating = true hasta que el useEffect restaure la sesión del cliente.
  // Mientras sea true, los guards de navegación NO deben redirigir a /login.
  const [isHydrating, setIsHydrating] = useState(true);

  // Se ejecuta solo en el cliente, después de la hidratación de React.
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser) as AuthUser);
        setToken(storedToken);
      }
    } catch {
      // localStorage corrupto → limpiar
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsHydrating(false);
    }
  }, []);

  const persist = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /**
   * Login unificado: llama al backend y guarda token + usuario.
   * Lanza ApiError si las credenciales son incorrectas o hay error de red.
   */
  const login = async (username: string, password: string): Promise<void> => {
    const data = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    persist(data.usuario, data.token);
  };

  const logout = () => clearAuth();

  const isAuthenticated = !!user && !!token;
  const isAdmin     = isAuthenticated && user?.rol === "administrador";
  const isEmpleado  = isAuthenticated && user?.rol === "empleado";
  const isCliente   = isAuthenticated && user?.rol === "cliente";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isEmpleado,
        isCliente,
        isHydrating,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
