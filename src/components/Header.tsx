"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ROUTE_TITLES } from "@/lib/constants";
import "./header.css";

const routeDescriptions: Record<string, string> = {
  "/": "Monitore ocupação, alertas e pendências operacionais em tempo real.",
  "/patients": "Acompanhe prontuários, admissões e status dos pacientes acolhidos.",
  "/medications": "Organize prescrições, administração e revisões de medicação.",
  "/reports": "Veja indicadores assistenciais, clínicos e administrativos da unidade.",
  "/settings": "Ajuste perfis, permissões e parâmetros operacionais do sistema.",
};

export function Header() {
  const pathname = usePathname();

  const title = ROUTE_TITLES[pathname] ||
    (pathname.startsWith("/patients/") ? "Prontuário do paciente" : "Casa de Davi");

  const subtitle = routeDescriptions[pathname] ||
    (pathname.startsWith("/patients/")
      ? "Consulte dados clínicos, evolução e pendências do acolhido."
      : "Gestão assistencial e administrativa da unidade.");

  return (
    <header className="app-header">
      <button
        className="mobile-menu-trigger"
        aria-label="Abrir menu"
        onClick={() => {
          const event = new CustomEvent("toggle-sidebar");
          window.dispatchEvent(event);
        }}
      >
        <Menu size={18} />
      </button>

      <div className="page-title-row">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </header>
  );
}
