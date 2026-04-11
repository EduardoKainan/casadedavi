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
  HeartPulse
} from "lucide-react";
import { useState } from "react";
import "./sidebar.css";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Internos", icon: Users },
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
        aria-label="Toggle Menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn("sidebar", isOpen && "open")}>
        <div className="sidebar-header">
          <HeartPulse size={28} className="logo-icon" />
          <span className="logo-text">Casa de Davi</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn("nav-link", isActive && "active")} onClick={() => setIsOpen(false)}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className={cn("nav-link", "logout-btn")}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}