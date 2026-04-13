import { Package, ShoppingCart, BarChart3, Smartphone, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import StoreSelector, { type Store } from "../components/ui/StoreSelector";

interface UserData {
  nombre?: string;
  username?: string;
  email?: string;
  role?: 'dueño' | 'empleado';
}

export default function AdminLayout() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Estado para el Local Seleccionado
  const [currentStore, setCurrentStore] = useState<Store>({ 
    id: 22, 
    name: "Local N° 22", 
    manager: "Ana García" 
  });

  const [userData, setUserData] = useState<UserData>({ username: 'Usuario', email: 'user@example.com' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    try {
      setUserData(JSON.parse(userStr));
    } catch (e) {
      console.error("Error cargando usuario");
    }
  }, [navigate]);

  const handleLogout = () => {
    // 1. Limpiamos las credenciales
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 2. Redirigimos a la Tienda (Home) en lugar del Login
    navigate('/'); 
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin" },
    { id: "inventory", label: "Inventario", icon: Package, path: "/admin/inventory" },
    { id: "sales", label: "Ventas", icon: ShoppingCart, path: "/admin/sales" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 h-screen sticky top-0 bg-[#2d3e50] shadow-lg flex flex-col border-r border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-white font-semibold text-lg">MatVic</h1>
              <p className="text-sm text-slate-400">SAVI Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Card en el Sidebar */}
        <div className="p-4 border-t border-slate-700">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden text-white">
                <p className="text-sm font-medium truncate">{userData.nombre || userData.username}</p>
                <p className="text-xs text-slate-400 truncate">{userData.email}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO CON HEADER SUPERIOR */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER SUPERIOR PARA EL SELECTOR DE LOCAL */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-xl capitalize">
              {menuItems.find(i => i.path === location.pathname)?.label || "Gestión"}
            </h2>
            <p className="text-xs text-slate-500">Sistema de Administración de Ventas e Inventario</p>
          </div>

          {/* 2. Integración del StoreSelector */}
          <StoreSelector 
            selectedStore={currentStore} 
            onStoreChange={(store) => setCurrentStore(store)} 
          />
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {/* 3. Pasamos el local activo a las rutas hijas a través del context */}
          <Outlet context={{ currentStore, userData }} />
        </main>
      </div>
    </div>
  );
}