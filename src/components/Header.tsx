"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, UserCircle } from "lucide-react";
import { ROUTE_TITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
      <div className="header-left">
        <h1 className={cn("page-title", pathname === "/" && "home-title")}>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={pathname === "/"
              ? "Buscar paciente, documento ou pendência..."
              : pathname.startsWith("/patients/")
                ? "Buscar registro clínico ou responsável..."
                : "Buscar no sistema..."}
          />
        </div>

        <div className="header-actions-group">
          <div className="quick-status">
            <span className="quick-status-dot" />
            Sistema operacional
          </div>

          <button className="icon-btn" aria-label="Notificações">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar-wrap">
            <UserCircle size={22} className="user-avatar" />
          </div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Equipe gestora</span>
          </div>
        </div>
      </div>
    </header>
  );
}
