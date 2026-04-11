"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, UserCircle } from "lucide-react";
import { ROUTE_TITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  
  // Find exact match or fallback
  const title = ROUTE_TITLES[pathname] || 
                (pathname.startsWith("/patients/") ? "Detalhes do Interno" : "Casa de Davi");

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className={cn("page-title", pathname === "/" && "home-title")}>
          {title}
        </h1>
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder={pathname === "/" ? "Buscar métricas ou pacientes..." : 
                       pathname.startsWith("/patients/") ? "Buscar por nome ou CPF..." : 
                       "Buscar no sistema..."} 
          />
        </div>
        
        <button className="icon-btn" aria-label="Notificações">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <UserCircle size={32} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Diretoria</span>
          </div>
        </div>
      </div>
    </header>
  );
}