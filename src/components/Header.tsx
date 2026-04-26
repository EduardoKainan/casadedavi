"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { ROUTE_TITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const routeDescriptions: Record<string, string> = {
  "/": "Monitore ocupação, alertas e pendências operacionais em tempo real.",
  "/patients": "Acompanhe prontuários, admissões e status dos pacientes acolhidos.",
  "/medications": "Organize prescrições, administração e revisões de medicação.",
  "/reports": "Veja indicadores assistenciais, clínicos e administrativos da unidade.",
  "/settings": "Ajuste perfis, permissões e parâmetros operacionais do sistema.",
};

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const title = ROUTE_TITLES[pathname] ||
    (pathname.startsWith("/patients/") ? "Prontuário do paciente" : "Casa de Davi");

  const subtitle = routeDescriptions[pathname] ||
    (pathname.startsWith("/patients/")
      ? "Consulte dados clínicos, evolução e pendências do acolhido."
      : "Gestão assistencial e administrativa da unidade.");

  return (
    <header className={cn("app-header", searchOpen && "search-active")}>
      {/* Lado esquerdo: menu + título */}
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
          aria-label="Abrir menu"
          onClick={() => {
            const event = new CustomEvent("toggle-sidebar");
            window.dispatchEvent(event);
          }}
        >
          <Menu size={20} />
        </button>

        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Lado direito: ações */}
      <div className="header-right">
        {/* Busca desktop */}
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

        {/* Ações */}
        <div className="header-actions-group">
          {/* Busca mobile */}
          <button
            className="icon-btn mobile-search-trigger"
            aria-label="Buscar"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={20} />
          </button>

          {/* Status sistema */}
          <div className="quick-status">
            <span className="quick-status-dot" />
            Sistema
          </div>

          {/* Notificações */}
          <button className="icon-btn" aria-label="Notificações">
            <Bell size={20} />
            <span className="notification-badge" />
          </button>
        </div>

        {/* Perfil */}
        <div className="user-profile">
          <div className="user-avatar-wrap">
            <UserCircle size={22} className="user-avatar" />
          </div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Gestão</span>
          </div>
        </div>
      </div>
    </header>
  );
}
