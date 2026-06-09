import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/auth";
import { api } from "~/lib/api";

// ── Icono Facebook ─────────────────────────────────────────────────────────────

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.021 1.792-4.691 4.533-4.691 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.928-1.956 1.88v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Mode = "login" | "register";

interface RegisterResponse {
  token: string;
  usuario: {
    id: number;
    username: string;
    nombre: string;
    apellidos: string;
    rol: string;
  };
}

// ── Input reutilizable con estilo glassmorphism ───────────────────────────────

interface FloatInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

function FloatInput({ id, label, type = "text", value, onChange, placeholder = "", required, disabled, autoComplete }: FloatInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 border-2 border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2]/60 focus:border-[#1877F2] transition-all bg-white/25 backdrop-blur-sm text-white placeholder-white/50 disabled:opacity-60"
      />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regApellidos, setRegApellidos] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.rol === "administrador") navigate("/admin");
        else if (u.rol === "empleado") navigate("/admin/sales");
        else navigate("/"); // cliente → tienda virtual
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (regPassword !== regPassword2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post<RegisterResponse>("/auth/registro", {
        username:  regUsername.trim(),
        password:  regPassword,
        nombre:    regNombre.trim(),
        apellidos: regApellidos.trim(),
      });
      setSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
      // Limpiar campos y volver al login después de 2 segundos
      setTimeout(() => {
        setRegUsername(""); setRegPassword(""); setRegPassword2("");
        setRegNombre(""); setRegApellidos("");
        switchMode("login");
      }, 2000);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      // Traduce errores técnicos del backend a mensajes amigables
      if (raw.toLowerCase().includes("unique") || raw.toLowerCase().includes("duplicate") || raw.toLowerCase().includes("ya existe") || raw.toLowerCase().includes("conflict")) {
        setError("El nombre de usuario ya está en uso. Elige otro.");
      } else if (raw.toLowerCase().includes("constraint") || raw.toLowerCase().includes("500") || raw.includes("500")) {
        setError("Error interno del servidor. Contacta al administrador.");
      } else if (raw) {
        setError(raw);
      } else {
        setError("No se pudo crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden">

      {/* Botón Facebook */}
      <a
        href="https://www.facebook.com/matviccelulares"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 left-6 z-20 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-blue-100/50"
        aria-label="Visitar nuestra página de Facebook"
      >
        <FacebookIcon className="h-6 w-6 text-[#1877F2]" />
      </a>

      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Matvic.jpeg)", filter: "blur(8px)", transform: "scale(1.1)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-pickled-bluewood-900/50 via-pickled-bluewood-800/40 to-pickled-bluewood-900/50" />

      {/* Tarjeta */}
      <div className="relative z-10 bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 transition-all duration-300">

        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {mode === "login" ? "Bienvenido de vuelta" : "Crear una cuenta"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {mode === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Completa el formulario para registrarte"}
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#1877F2] to-pickled-bluewood-400 mx-auto rounded-full mt-3" />
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/80 backdrop-blur-sm border-l-4 border-red-600 text-white rounded-xl text-sm flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-500/80 backdrop-blur-sm border-l-4 border-emerald-400 text-white rounded-xl text-sm flex items-start gap-2">
            <span className="shrink-0 mt-0.5">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* ── FORM LOGIN ─────────────────────────────────────────────── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <FloatInput
              id="username"
              label="Usuario"
              value={username}
              onChange={setUsername}
              placeholder="usuario"
              required
              disabled={isLoading}
              autoComplete="username"
            />
            <FloatInput
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1877F2] to-pickled-bluewood-600 text-white py-3.5 rounded-xl font-semibold hover:from-[#166FE5] hover:to-pickled-bluewood-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : "Ingresar"}
            </button>

            <p className="text-center text-white/60 text-sm pt-1">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-white font-semibold hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </form>
        )}

        {/* ── FORM REGISTRO ──────────────────────────────────────────── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">

            {/* Nombre + Apellidos en fila */}
            <div className="grid grid-cols-2 gap-3">
              <FloatInput
                id="reg-nombre"
                label="Nombre"
                value={regNombre}
                onChange={setRegNombre}
                placeholder="Juan"
                required
                disabled={isLoading}
                autoComplete="given-name"
              />
              <FloatInput
                id="reg-apellidos"
                label="Apellidos"
                value={regApellidos}
                onChange={setRegApellidos}
                placeholder="Pérez García"
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
            </div>

            <FloatInput
              id="reg-username"
              label="Usuario"
              value={regUsername}
              onChange={setRegUsername}
              placeholder="nombre_usuario"
              required
              disabled={isLoading}
              autoComplete="username"
            />

            <FloatInput
              id="reg-password"
              label="Contraseña"
              type="password"
              value={regPassword}
              onChange={setRegPassword}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />

            <div>
              <FloatInput
                id="reg-password2"
                label="Confirmar Contraseña"
                type="password"
                value={regPassword2}
                onChange={setRegPassword2}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {/* Indicador de coincidencia */}
              {regPassword2.length > 0 && (
                <p className={`text-xs mt-1.5 font-medium ${regPassword === regPassword2 ? "text-emerald-300" : "text-red-300"}`}>
                  {regPassword === regPassword2 ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1877F2] to-pickled-bluewood-600 text-white py-3.5 rounded-xl font-semibold hover:from-[#166FE5] hover:to-pickled-bluewood-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registrando...
                </span>
              ) : "Crear Cuenta"}
            </button>

            <p className="text-center text-white/60 text-sm pt-1">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-white font-semibold hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}