"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, BarChart2, CreditCard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin",         label: "Fleet owners", icon: Users     },
  { href: "/admin/metrics", label: "Métricas",     icon: BarChart2 },
  { href: "/admin/billing", label: "Facturación",  icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="w-52 border-r border-sidebar-border bg-sidebar flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">✓</div>
        <span className="font-bold text-sidebar-foreground">Checker</span>
        <span className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded bg-primary text-primary-foreground">ADMIN</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}>
              <Icon size={16} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          <LogOut size={16} />Salir
        </button>
      </div>
    </aside>
  );
}
