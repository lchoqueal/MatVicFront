import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/auth";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.021 1.792-4.691 4.533-4.691 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.928-1.956 1.88v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
    </svg>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginAdmin, loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setIsLoading(true);

    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 500));

    try {
      // Primero intenta como admin
      loginAdmin(username, password);
      navigate("/admin");
    } catch {
      try {
        // Luego intenta como cliente
        loginCustomer(username, password);
        navigate("/");
      } catch {
        setError("Usuario o contraseña incorrectos.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden">
      {/* Ícono de Facebook */}
      <a
        href="https://www.facebook.com/matviccelulares"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 left-6 z-20 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-blue-100/50"
        aria-label="Visitar nuestra página de Facebook"
      >
        <FacebookIcon className="h-6 w-6 text-[#1877F2]" />
      </a>

      {/* Fondo con blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/Matvic.jpeg)",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />
      {/* Overlay de gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-pickled-bluewood-900/50 via-pickled-bluewood-800/40 to-pickled-bluewood-900/50" />

      {/* Tarjeta de login */}
      <div className="relative z-10 bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
            Iniciar Sesión
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1877F2] to-pickled-bluewood-600 mx-auto rounded-full" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/80 backdrop-blur-sm border-l-4 border-red-600 text-white rounded-lg text-sm shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-semibold text-white drop-shadow-md"
            >
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50 focus:border-[#1877F2] transition-all bg-white/30 backdrop-blur-sm text-white placeholder-white/60"
              placeholder="admin"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-white drop-shadow-md"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50 focus:border-[#1877F2] transition-all bg-white/30 backdrop-blur-sm text-white placeholder-white/60"
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#1877F2] to-pickled-bluewood-600 text-white py-3.5 rounded-xl font-semibold hover:from-[#166FE5] hover:to-pickled-bluewood-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}