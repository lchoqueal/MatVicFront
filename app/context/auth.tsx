import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "empleado" | "cliente";

export interface AuthUser {
  username: string;
  nombre: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  loginAdmin: (username: string, password: string) => void;
  loginCustomer: (username: string, password: string) => void;
  logout: () => void;
}

// ── Credenciales hardcodeadas (sin backend) ──────────────────────────────────

const ADMIN_CREDENTIALS: AuthUser = {
  username: "admin",
  nombre: "Administrador",
  email: "admin@matvic.pe",
  role: "admin",
};

const CLIENTE_CREDENTIALS: AuthUser = {
  username: "cliente",
  nombre: "Cliente",
  email: "cliente@matvic.pe",
  role: "cliente",
};

const FAKE_TOKEN = "matvic-dev-token-2026";

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

  // Rehidratar desde localStorage al montar (solo cliente)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch {
      // Si hay datos corruptos en localStorage, limpiar
      clearAuth();
    }
  }, []);

  const persist = (u: AuthUser) => {
    setUser(u);
    setToken(FAKE_TOKEN);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", FAKE_TOKEN);
    localStorage.setItem("isAuthenticated", "true");
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
  };

  /**
   * Valida credenciales de administrador/empleado.
   * Acepta: admin / admin123
   * Lanza error si las credenciales son incorrectas.
   */
  const loginAdmin = (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      persist(ADMIN_CREDENTIALS);
    } else {
      throw new Error("Usuario o contraseña incorrectos.");
    }
  };

  /**
   * Valida credenciales de cliente.
   * Acepta: cliente / cliente123
   * Lanza error si las credenciales son incorrectas.
   */
  const loginCustomer = (username: string, password: string) => {
    if (username === "cliente" && password === "cliente123") {
      persist(CLIENTE_CREDENTIALS);
    } else {
      throw new Error("Usuario o contraseña incorrectos.");
    }
  };

  const logout = () => clearAuth();

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "empleado");
  const isCustomer = isAuthenticated && user?.role === "cliente";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isCustomer,
        loginAdmin,
        loginCustomer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
