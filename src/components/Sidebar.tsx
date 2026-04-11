"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  HeartPulse,
} from "lucide-react";
import { useState } from "react";
import "./sidebar.css";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/medications", label: "Medicações", icon: Pill },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={cn("sidebar", isOpen && "open")}>
        <div className="sidebar-header">
          <div className="logo-mark">
            <HeartPulse size={24} className="logo-icon" />
          </div>

          <div className="logo-copy">
            <span className="logo-text">Casa de Davi</span>
            <span className="logo-subtitle">Gestão clínica e acolhimento</span>
          </div>

          <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navegação</span>
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn("nav-link", isActive && "active")}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-summary">
            <span className="sidebar-summary-label">Resumo do dia</span>
            <strong>12 pacientes ativos</strong>
            <p>3 prontuários aguardando atualização clínica.</p>
          </div>

          <button className={cn("nav-link", "logout-btn")}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
