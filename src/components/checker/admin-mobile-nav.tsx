"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, BarChart2, CreditCard } from "lucide-react";

const NAV = [
  { href: "/admin",         label: "Fleet owners", icon: Users      },
  { href: "/admin/metrics", label: "Métricas",     icon: BarChart2  },
  { href: "/admin/billing", label: "Facturación",  icon: CreditCard },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-sidebar-border bg-sidebar md:hidden">
      <div className="grid grid-cols-3 h-14">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
