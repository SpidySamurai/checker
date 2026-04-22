"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Car, TrendingUp, Settings, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/fleet",          label: "Inicio",       icon: LayoutDashboard },
  { href: "/fleet/drivers",  label: "Conductores",  icon: Users },
  { href: "/fleet/vehicles", label: "Vehículos",    icon: Car },
  { href: "/fleet/reports",  label: "Reportes",     icon: TrendingUp },
  { href: "/fleet/settings", label: "Ajustes",      icon: Settings },
];

interface SidebarProps {
  userName: string;
  companyName: string;
}

export function Sidebar({ userName, companyName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="w-56 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <div className="h-7 w-7 rounded bg-orange-500 flex items-center justify-center text-white font-bold text-xs">✓</div>
        <span className="font-bold text-slate-900 dark:text-slate-50">Checker</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/fleet" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{companyName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </aside>
  );
}
