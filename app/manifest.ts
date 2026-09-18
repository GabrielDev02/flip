import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Controle de Gastos do Casal",
    short_name: "Gastos",
    description: "Acompanhe suas contas e transações do Open Finance (Pluggy)",
    start_url: "/app/home",
    scope: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#004ac6",
    icons: [
      { src: "/manifest-icons/192", sizes: "192x192", type: "image/png" },
      { src: "/manifest-icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
