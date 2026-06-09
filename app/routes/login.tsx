import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/core/auth";
import { api } from "~/core/api/client";
import { Loader2 } from "lucide-react";

// ── Iconos ──────────────────────────────────────────────────────────────────

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.021 1.792-4.691 4.533-4.691 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.928-1.956 1.88v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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

// ── Tipos ─────────────────────────────────────────────────────────────────────

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

// ── Componentes UI Neumorfismo ──────────────────────────────────────────────

const NeuInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full bg-[#f0f2f5] border-none px-5 py-3.5 rounded-2xl outline-none text-[#2d3e50] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#c2cce0,inset_-6px_-6px_12px_#ffffff] transition-shadow duration-300 placeholder-[#2d3e50]/40 font-semibold text-sm disabled:opacity-50"
    {...props}
  />
);

const NeuSocialBtn = ({ children }: { children: React.ReactNode }) => (
  <button type="button" className="w-12 h-12 flex items-center justify-center bg-[#f0f2f5] text-[#2d3e50] rounded-full shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] hover:text-[#1877F2] transition-all duration-300">
    {children}
  </button>
);

const NeuButton = ({ children, isLoading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => (
  <button
    className="w-48 bg-[#2d3e50] text-white font-bold tracking-widest uppercase text-sm py-4 rounded-full shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto hover:text-[#1877F2]"
    {...props}
  >
    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

const GhostButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="w-48 bg-transparent text-[#e6e9f0] border border-[#e6e9f0] font-bold tracking-widest uppercase text-sm py-3.5 rounded-full hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-colors duration-300 mx-auto shadow-sm"
    {...props}
  >
    {children}
  </button>
);

// ── Componente Principal ────────────────────────────────────────────────────

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regApellidos, setRegApellidos] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleMode = (signup: boolean) => {
    setIsSignUp(signup);
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

    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post<RegisterResponse>("/auth/registro", {
        username: regUsername.trim(),
        password: regPassword,
        nombre: regNombre.trim(),
        apellidos: regApellidos.trim(),
      });
      setSuccess("¡Cuenta creada exitosamente!");
      setTimeout(() => {
        setRegUsername(""); setRegPassword("");
        setRegNombre(""); setRegApellidos("");
        toggleMode(false);
      }, 2000);
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#f0f2f5] p-4 font-sans selection:bg-[#1877F2] selection:text-white overflow-hidden">

      {/* Círculo animado de fondo (sombra muy suave y lenta) */}
      <style>{`
        @keyframes floatBg {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(15vw, -10vh) scale(1.2); }
          66% { transform: translate(-10vw, 15vh) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-floatBg {
          animation: floatBg 25s infinite alternate ease-in-out;
        }
      `}</style>
      <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#1877F2] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.07] animate-floatBg pointer-events-none" />
      <div className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[#2d3e50] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05] animate-floatBg pointer-events-none" style={{ animationDelay: '5s', animationDirection: 'alternate-reverse' }} />

      {/* Contenedor Neumórfico Principal */}
      <div className="relative w-full max-w-5xl min-h-[650px] bg-[#f0f2f5] rounded-[40px] shadow-[15px_15px_30px_#d1d9e6,-15px_-15px_30px_#ffffff] overflow-hidden flex flex-col lg:flex-row z-10">

        {/* ========================================================= */}
        {/* 1. FORMULARIO SIGN UP (Izquierda a Derecha) */}
        {/* ========================================================= */}
        <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 transition-all duration-700 ease-in-out ${isSignUp ? 'translate-x-0 lg:translate-x-full opacity-100 z-20' : '-translate-x-[50%] lg:translate-x-0 opacity-0 z-0 pointer-events-none'}`}>
          <form onSubmit={handleRegister} className="flex flex-col items-center text-center w-full max-w-sm mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d3e50] mb-2 tracking-tight">Crear Cuenta</h2>

            <div className="flex gap-4 mb-2">
              <NeuSocialBtn><FacebookIcon className="w-5 h-5" /></NeuSocialBtn>
              <NeuSocialBtn><LinkedinIcon className="w-5 h-5" /></NeuSocialBtn>
              <NeuSocialBtn><XIcon className="w-5 h-5" /></NeuSocialBtn>
            </div>

            <span className="text-[10px] font-bold text-[#2d3e50]/50 tracking-widest uppercase mb-2">O inicia sesión</span>

            {(error && isSignUp) && <p className="text-red-500 text-sm font-bold w-full">{error}</p>}
            {(success && isSignUp) && <p className="text-emerald-500 text-sm font-bold w-full">{success}</p>}

            <div className="flex gap-4 w-full">
              <NeuInput placeholder="Nombre" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required disabled={isLoading} />
              <NeuInput placeholder="Apellidos" value={regApellidos} onChange={(e) => setRegApellidos(e.target.value)} required disabled={isLoading} />
            </div>
            <NeuInput type="text" placeholder="Usuario" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required disabled={isLoading} />
            <NeuInput type="password" placeholder="Contraseña" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required disabled={isLoading} />

            <div className="pt-4">
              <NeuButton type="submit" disabled={isLoading} isLoading={isLoading}>REGISTRARSE</NeuButton>
            </div>

            {/* Enlace móvil para cambiar a Login */}
            <p className="lg:hidden mt-6 text-sm font-medium text-[#2d3e50]/60">
              ¿Ya tienes cuenta? <button type="button" onClick={() => toggleMode(false)} className="text-[#1877F2] font-bold underline decoration-2 underline-offset-4">Inicia Sesión</button>
            </p>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 2. FORMULARIO SIGN IN (Izquierda) */}
        {/* ========================================================= */}
        <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 transition-all duration-700 ease-in-out z-10 ${isSignUp ? 'translate-x-[50%] lg:translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <form onSubmit={handleLogin} className="flex flex-col items-center text-center w-full max-w-sm mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d3e50] mb-2 tracking-tight">Iniciar Sesión</h2>

            <div className="flex gap-4 mb-2">
              <NeuSocialBtn><FacebookIcon className="w-5 h-5" /></NeuSocialBtn>
              <NeuSocialBtn><LinkedinIcon className="w-5 h-5" /></NeuSocialBtn>
              <NeuSocialBtn><XIcon className="w-5 h-5" /></NeuSocialBtn>
            </div>

            <span className="text-[10px] font-bold text-[#2d3e50]/50 tracking-widest uppercase mb-2">O registrate por primera vez</span>

            {(error && !isSignUp) && <p className="text-red-500 text-sm font-bold w-full">{error}</p>}

            <NeuInput type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
            <NeuInput type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />

            <button type="button" className="text-sm font-semibold text-[#2d3e50]/70 hover:text-[#1877F2] transition-colors border-b-2 border-transparent hover:border-[#1877F2] pb-0.5">
              ¿Olvidaste tu contraseña?
            </button>

            <div className="pt-2">
              <NeuButton type="submit" disabled={isLoading} isLoading={isLoading}>INGRESAR</NeuButton>
            </div>

            {/* Enlace móvil para cambiar a Registro */}
            <p className="lg:hidden mt-6 text-sm font-medium text-[#2d3e50]/60">
              ¿No tienes cuenta? <button type="button" onClick={() => toggleMode(true)} className="text-[#1877F2] font-bold underline decoration-2 underline-offset-4">Regístrate</button>
            </p>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 3. PANEL SUPERPUESTO (Pickled Bluewood) - Solo visible en Desktop */}
        {/* ========================================================= */}
        <div className={`hidden lg:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`absolute top-0 left-[-100%] w-[200%] h-full bg-[#2d3e50] transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'} shadow-[inset_10px_0_30px_rgba(0,0,0,0.3)]`}>

            {/* Detalles decorativos en el panel */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full border-[1px] border-white/5 opacity-50" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full border-[1px] border-white/5 opacity-50" />

            {/* Contenido Izquierdo (Para ir a Login) */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-16 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight">¡Bienvenido de Nuevo!</h2>
              <p className="text-[#e6e9f0]/70 mb-10 font-medium text-lg leading-relaxed">
                Para mantenerte conectado, por favor inicia sesión con tu cuenta personal.
              </p>
              <GhostButton onClick={() => toggleMode(false)}>INGRESAR</GhostButton>
            </div>

            {/* Contenido Derecho (Para ir a Registro) */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-16 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight">¡Hola, Amigo!</h2>
              <p className="text-[#e6e9f0]/70 mb-10 font-medium text-lg leading-relaxed">
                Ingresa tus datos personales y comienza tu experiencia con MatVic.
              </p>
              <GhostButton onClick={() => toggleMode(true)}>REGISTRARSE</GhostButton>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}