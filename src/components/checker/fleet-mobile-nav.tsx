"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Car, TrendingUp, Settings } from "lucide-react";

const NAV = [
  { href: "/fleet",          label: "Inicio",      icon: LayoutDashboard },
  { href: "/fleet/drivers",  label: "Conductores", icon: Users },
  { href: "/fleet/vehicles", label: "Vehículos",   icon: Car },
  { href: "/fleet/reports",  label: "Reportes",    icon: TrendingUp },
  { href: "/fleet/settings", label: "Ajustes",     icon: Settings },
];

export function FleetMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-sidebar-border bg-sidebar md:hidden">
      <div className="grid grid-cols-5 h-14">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/fleet" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-sidebar-foreground/50"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
