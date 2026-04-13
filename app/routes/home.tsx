import type { Route } from "./+types/home";
import ShopIndex from "./_shop.index";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "MatVic Store | Accesorios para Celulares" },
    { name: "description", content: "La mejor tienda de accesorios para smartphones en Tacna." },
  ];
}

export default function Home() {
  // Aquí renderizamos el contenido de la tienda
  return <ShopIndex />;
}