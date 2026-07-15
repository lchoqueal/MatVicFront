import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, ApiError } from "~/core/api/client";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser) as AuthUser);
        setToken(storedToken);
      }
    } catch {
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

  const login = async (username: string, password: string): Promise<void> => {
    const data = await api.post<LoginResponse>("/auth/login", {
      username: username,
      user_name: username, // Respaldo por si el backend busca con guión bajo
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
