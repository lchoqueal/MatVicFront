import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/core/auth";
import { api } from "~/core/api/client";
import { Loader2, Eye, EyeOff, Smartphone } from "lucide-react";

// ── Iconos sociales ────────────────────────────────────────────────────────────

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.021 1.792-4.691 4.533-4.691 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.928-1.956 1.88v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

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

// ── Componente Input ───────────────────────────────────────────────────────────

const MvInput = ({ label, icon, rightElement, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
          {icon}
        </div>
      )}
      <input
        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
        style={{
          background: 'var(--card)',
          border: '1.5px solid var(--border)',
          color: 'var(--text)',
          paddingLeft: icon ? '40px' : undefined,
          paddingRight: rightElement ? '44px' : undefined,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

// ── Componente principal ────────────────────────────────────────────────────────

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);

  // Login
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");

  // Register
  const [regUsername, setRegUsername]   = useState("");
  const [regPassword, setRegPassword]   = useState("");
  const [regNombre, setRegNombre]       = useState("");
  const [regApellidos, setRegApellidos] = useState("");

  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleMode = (signup: boolean) => {
    setIsSignUp(signup);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) { setError("Por favor completa todos los campos."); return; }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.rol === "administrador") navigate("/admin");
        else if (u.rol === "empleado") navigate("/admin/sales");
        else navigate("/");
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
    if (regPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setIsLoading(true);
    try {
      await api.post<RegisterResponse>("/auth/registro", {
        username: regUsername.trim(),
        password: regPassword,
        nombre: regNombre.trim(),
        apellidos: regApellidos.trim(),
      });
      setSuccess("¡Cuenta creada exitosamente! Ahora puedes ingresar.");
      setTimeout(() => {
        setRegUsername(""); setRegPassword(""); setRegNombre(""); setRegApellidos("");
        toggleMode(false);
      }, 2500);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.toLowerCase().includes("unique") || raw.toLowerCase().includes("duplicate")) {
        setError("El nombre de usuario ya está en uso.");
      } else {
        setError("Error al crear la cuenta. Verifica los datos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const SocialBtn = ({ children }: { children: React.ReactNode }) => (
    <button
      type="button"
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--text-muted)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Círculos decorativos de fondo */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(127,57,67,0.12) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,99,90,0.08) 0%, transparent 70%)' }} />

      {/* Card principal */}
      <div className="relative w-full max-w-4xl min-h-[600px] bg-white rounded-3xl overflow-hidden flex shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(69,53,48,0.15)' }}>

        {/* ─── Panel lateral izquierdo (vino) — visible en desktop, cambia de contenido ─── */}
        <div
          className="hidden lg:flex w-[42%] shrink-0 flex-col items-center justify-center p-10 text-center relative overflow-hidden transition-all duration-500"
          style={{ background: 'linear-gradient(135deg, #7F3943 0%, #9B4652 100%)' }}
        >
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full opacity-10" style={{ background: '#FAF5F0' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 rounded-full opacity-10" style={{ background: '#E8635A' }} />

          {/* Logo */}
          <div className="mb-6 w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-white" />
          </div>

          {!isSignUp ? (
            <>
              <h2 className="text-2xl font-extrabold text-white mb-3">¿Primera vez aquí?</h2>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">Regístrate y accede a precios exclusivos, seguimiento de pedidos y mucho más.</p>
              <button
                onClick={() => toggleMode(true)}
                className="font-bold px-8 py-3 rounded-full border-2 border-white text-white transition-all hover:bg-white text-sm"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7F3943'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-white mb-3">¿Ya tienes cuenta?</h2>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">Inicia sesión y retoma donde lo dejaste.</p>
              <button
                onClick={() => toggleMode(false)}
                className="font-bold px-8 py-3 rounded-full border-2 border-white text-white transition-all hover:bg-white text-sm"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7F3943'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>

        {/* ─── Área de formularios ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 relative overflow-hidden">

          {/* ── LOGIN ── */}
          <div className={`absolute inset-0 flex flex-col justify-center px-8 sm:px-12 py-10 transition-all duration-500 ${isSignUp ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
            <form onSubmit={handleLogin} className="space-y-5 max-w-sm w-full mx-auto">
              {/* Logo móvil */}
              <div className="flex flex-col items-center mb-4 lg:hidden">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'var(--primary)' }}>
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>Bienvenido de vuelta</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ingresa a tu cuenta MATVIC</p>
              </div>

              {/* Social */}
              <div className="flex gap-3">
                <SocialBtn><FacebookIcon className="w-4 h-4" /> Facebook</SocialBtn>
                <SocialBtn><XIcon className="w-4 h-4" /> Twitter</SocialBtn>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>o continúa con email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {error && !isSignUp && (
                <p className="text-sm font-semibold text-center py-2 px-4 rounded-xl" style={{ background: 'rgba(217,83,79,0.08)', color: 'var(--error)' }}>{error}</p>
              )}

              <MvInput
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <MvInput
                type={showPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                rightElement={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="text-right">
                <button type="button" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 16px rgba(232,99,90,0.40)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ingresar →
              </button>

              <p className="text-center text-sm lg:hidden" style={{ color: 'var(--text-muted)' }}>
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => toggleMode(true)} className="font-bold" style={{ color: 'var(--primary)' }}>Regístrate</button>
              </p>
            </form>
          </div>

          {/* ── REGISTRO ── */}
          <div className={`absolute inset-0 flex flex-col justify-center px-8 sm:px-12 py-10 transition-all duration-500 ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
            <form onSubmit={handleRegister} className="space-y-4 max-w-sm w-full mx-auto">
              {/* Logo móvil */}
              <div className="flex flex-col items-center mb-2 lg:hidden">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'var(--primary)' }}>
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>Crear cuenta</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Únete a la familia MATVIC</p>
              </div>

              {/* Social */}
              <div className="flex gap-3">
                <SocialBtn><FacebookIcon className="w-4 h-4" /> Facebook</SocialBtn>
                <SocialBtn><XIcon className="w-4 h-4" /> Twitter</SocialBtn>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>o continúa con email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {error && isSignUp && (
                <p className="text-sm font-semibold text-center py-2 px-4 rounded-xl" style={{ background: 'rgba(217,83,79,0.08)', color: 'var(--error)' }}>{error}</p>
              )}
              {success && isSignUp && (
                <p className="text-sm font-semibold text-center py-2 px-4 rounded-xl" style={{ background: 'rgba(60,177,113,0.08)', color: 'var(--success)' }}>{success}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <MvInput placeholder="Nombre" value={regNombre} onChange={e => setRegNombre(e.target.value)} required disabled={isLoading} />
                <MvInput placeholder="Apellidos" value={regApellidos} onChange={e => setRegApellidos(e.target.value)} required disabled={isLoading} />
              </div>
              <MvInput placeholder="Usuario" value={regUsername} onChange={e => setRegUsername(e.target.value)} required disabled={isLoading} />
              <MvInput
                type={showRegPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
                disabled={isLoading}
                rightElement={
                  <button type="button" onClick={() => setShowRegPwd(!showRegPwd)} style={{ color: 'var(--text-muted)' }}>
                    {showRegPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 16px rgba(232,99,90,0.40)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear cuenta →
              </button>

              <p className="text-center text-sm lg:hidden" style={{ color: 'var(--text-muted)' }}>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => toggleMode(false)} className="font-bold" style={{ color: 'var(--primary)' }}>Inicia sesión</button>
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}