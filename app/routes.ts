import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // 1. EL PORTAL (Página de Login independiente)
  // Esta página no tiene Sidebar ni Navbar de tienda, es a pantalla completa.
  route("login", "routes/login.tsx"),

  // 2. SECCIÓN PÚBLICA (Tienda Virtual)
  // Cualquier usuario (cliente, admin o empleado) puede ver esto sin loguearse.
  layout("layouts/ShopLayout.tsx", [
    index("routes/home.tsx"), // El primer vistazo al entrar a la web
    route("producto/:id", "routes/_shop.product.tsx"),
    route("pago-exitoso", "routes/pago-exitoso.tsx"),
    route("pago-fallido", "routes/pago-fallido.tsx"),
  ]),

  // 3. SECCIÓN PRIVADA (Administración y Ventas Físicas)
  // Solo accesible después de pasar por el Login.
  layout("layouts/AdminLayout.tsx", [
    route("admin", "routes/admin.dashboard.tsx"),
    route("admin/sales", "routes/admin.sales.tsx"),
    route("admin/inventory", "routes/admin.inventory.tsx"),
    route("admin/clientes", "routes/admin.clientes.tsx"),
  ]),
] satisfies RouteConfig;