import type { Route } from "./+types/home";
import ShopIndex from "./_shop.index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MatVic Store | Accesorios para Celulares" },
    { name: "description", content: "La mejor tienda de accesorios para smartphones en Tacna. Fundas, cargadores, micas y más." },
    { name: "og:title", content: "MatVic Store" },
  ];
}

export default function Home() {
  return <ShopIndex />;
}