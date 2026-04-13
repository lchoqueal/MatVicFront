import { useState } from "react";
import { useNavigate } from "react-router"; // Estándar de v7
import { ExternalLink, Lock, User, Smartphone } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
        setIsLoading(true);
      
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
      
        if (username === "admin" && password === "admin123") {
          const mockResponse = {
            user: { 
              username: "admin", 
              role: "dueño", // O "empleado" para probar esa vista
              nombre: "Admin MatVic"
            },
            token: "fake-jwt-token-123"
          };
      
          localStorage.setItem("user", JSON.stringify(mockResponse.user));
          localStorage.setItem("token", mockResponse.token);
      
          // Redirección según el rol que definas arriba
          if (mockResponse.user.role === "dueño") {
            navigate("/admin");
          } else {
            navigate("/admin/ventas");
          }
        } else {
          throw new Error("Usuario o contraseña incorrectos");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden bg-slate-900">
      {/* Botón de Facebook Flotante */}
      <a
        href="https://www.facebook.com/matviccelulares"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook - MatVic Celulares"
        className="absolute top-6 left-6 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all hover:scale-110"
      >
        <ExternalLink className="h-6 w-6 text-blue-400" />
      </a>

      {/* Fondo con imagen difuminada (Asegúrate de tener Matvic.jpeg en /public) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/Matvic.jpeg)', filter: 'blur(10px)' }}
      />

      {/* Card de Login con efecto Glassmorphism */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Smartphone className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">SAVI v1.0</h2>
          <p className="text-blue-200 text-sm font-medium">Sistema de Gestión MatVic</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-xs rounded-xl text-center font-bold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-200 uppercase ml-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-200 uppercase ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Validando..." : "INGRESAR AL SISTEMA"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-[10px] uppercase tracking-[0.2em]">
          Tacna, Perú • 2026
        </p>
      </div>
    </div>
  );
}