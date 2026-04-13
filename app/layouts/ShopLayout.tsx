import { Link, Outlet, useNavigate } from "react-router";
import { ShoppingCart, User, Smartphone, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
    username: string;
    role: 'dueño' | 'empleado' | 'cliente';
    nombre?: string;
  }

export default function ShopLayout() {
// 2. Dile al useState que puede ser UserData o null
const [user, setUser] = useState<UserData | null>(null);
  
const navigate = useNavigate();

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      // Al parsear, TypeScript ahora sabe que cumple con UserData
      setUser(JSON.parse(userData));
    } catch (e) {
      console.error("Error al parsear usuario");
    }
  }
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#2d3e50] text-white shadow-md px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Smartphone className="h-7 w-7 text-blue-400" />
          <span className="font-bold text-xl">MatVic Store</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Si el usuario es Admin/Empleado, mostrar link al Panel */}
          {user && (user.role === 'dueño' || user.role === 'empleado') && (
            <Link to="/admin" className="text-xs font-bold bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-500 transition-colors">
              VOLVER AL PANEL
            </Link>
          )}

          <Link to="/carrito" className="hover:text-blue-400">
            <ShoppingCart className="h-6 w-6" />
          </Link>

          {/* Si NO hay usuario, mostrar botón de Login */}
          {!user ? (
            <Link to="/login" className="flex items-center gap-1 hover:text-blue-400 font-medium text-sm">
              <User className="h-5 w-5" /> Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm border-l border-white/20 pl-4">
              <span className="text-blue-300 font-bold">
                {user?.username} 
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}