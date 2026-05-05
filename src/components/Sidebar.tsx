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
  X,
  HeartPulse,
} from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      <div className={cn("sidebar-overlay", isOpen && "active")} onClick={() => setIsOpen(false)} aria-hidden={!isOpen} />

      <aside className={cn("sidebar", isOpen && "open")} aria-hidden={!isOpen}>
        <div className="sidebar-header">
          <div className="logo-mark">
            <HeartPulse size={24} className="logo-icon" />
          </div>

          <div className="logo-copy">
            <span className="logo-text">Casa de Davi</span>
            <span className="logo-subtitle">Gestão e acolhimento</span>
          </div>

          <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="sidebar-section-label">Menu</span>
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
            <span className="sidebar-summary-label">Resumo</span>
            <strong>12 ativos</strong>
            <p>3 atualizações pendentes</p>
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
