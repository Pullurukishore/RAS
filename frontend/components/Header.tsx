"use client";

import { LogOut, ChevronRight, Calendar } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

/* ─── Page Metadata Configs ─── */
interface PageMeta {
  title: string;
  subtitle: string;
  icon: string;
}

const pageMeta: Record<string, PageMeta> = {
  "/": { title: "Dashboard", subtitle: "Performance overview & analytics", icon: "📊" },
  "/billing": { title: "Billing & Invoices", subtitle: "Manage transactions & payments", icon: "🧾" },
  "/salon-menu": { title: "Salon Menu", subtitle: "Services, products & packages", icon: "✨" },
  "/salon-menu/form": { title: "Menu Item", subtitle: "Create or edit a menu entry", icon: "📝" },
  "/appointments": { title: "Appointments", subtitle: "Schedule & manage bookings", icon: "📅" },
  "/reports": { title: "Reports", subtitle: "Business insights & analytics", icon: "📈" },
  "/customers": { title: "Customers", subtitle: "Client relationships & history", icon: "👥" },
  "/staff": { title: "Staff", subtitle: "Team management & roles", icon: "👤" },
  "/closing": { title: "Day Closing", subtitle: "End-of-day reconciliation", icon: "🔒" },
  "/settings": { title: "Settings", subtitle: "System configuration & preferences", icon: "⚙️" },
  "/settings/store-profile": { title: "Store Profile", subtitle: "Business information & branding", icon: "🏪" },
  "/settings/billing": { title: "Tax Settings", subtitle: "Billing & tax configuration", icon: "🧾" },
  "/settings/notifications": { title: "Notifications", subtitle: "Alert & notification preferences", icon: "🔔" },
  "/settings/security": { title: "Security", subtitle: "Access & authentication settings", icon: "🛡️" },
  "/settings/database": { title: "Database", subtitle: "Backups & data management", icon: "💾" },
  "/settings/appearance": { title: "Appearance", subtitle: "Theme & display settings", icon: "🎨" },
};

/* ─── Breadcrumb builder ─── */
function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let accumulated = "";
  for (const segment of paths) {
    accumulated += `/${segment}`;
    const meta = pageMeta[accumulated];
    breadcrumbs.push({
      label: meta?.title || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: accumulated,
    });
  }

  return breadcrumbs;
}

/* ─── Time formatter ─── */
function useCurrentTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const currentTime = useCurrentTime();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    const userCookie = Cookies.get("currentUser");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Failed to parse user cookie");
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("currentUser");
    router.push("/login");
    router.refresh();
  };

  const meta = pageMeta[pathname] || {
    title: "Naturals",
    subtitle: "Salon Management System",
    icon: "💈",
  };
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="h-16 sticky top-0 z-40 bg-slate-950 border-b border-white/[0.05] flex items-center px-4 lg:px-6 justify-between transition-all duration-300 relative overflow-hidden">
      {/* Background glow effects matching sidebar */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-teal-500/5 via-cyan-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-20 right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* ─── LEFT: Page Title & Breadcrumbs ─── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Page icon badge - dark theme matching sidebar */}
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/20 shadow-sm shadow-cyan-500/10 text-lg flex-shrink-0 group hover:border-cyan-400/40 transition-all duration-300">
          <span className="group-hover:scale-110 transition-transform text-cyan-300">{meta.icon}</span>
        </div>

        <div className="min-w-0">
          {/* Breadcrumbs - dark theme */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hover:text-cyan-400 transition-colors cursor-pointer"
                onClick={() => router.push("/")}
              >
                Home
              </span>
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight size={10} className="text-slate-600" />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      i === breadcrumbs.length - 1
                        ? "text-cyan-400 font-bold"
                        : "text-slate-500 hover:text-cyan-400"
                    }`}
                    onClick={() => router.push(crumb.href)}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Title - dark theme */}
          <h1 className="text-base font-bold text-slate-200 tracking-tight leading-tight truncate">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* ─── RIGHT: Actions ─── */}
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <Calendar size={14} className="text-cyan-400" />
          <span className="text-xs font-medium text-slate-400">
            {currentDate}
          </span>
          <div className="w-px h-3 bg-slate-700" />
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {currentTime}
          </span>
        </div>

        {/* Separator - dark */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Separator - dark */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* User Profile - dark theme */}
        <div className="flex items-center gap-2.5">
          <div
            className="hidden md:flex flex-col items-end cursor-pointer group"
            onClick={() => router.push("/settings")}
          >
            <span className="text-sm font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors leading-tight">
              {user?.name || "Admin"}
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {user?.email?.split("@")[0] || "Administrator"}
            </span>
          </div>

          {/* Avatar - dark theme matching sidebar */}
          <div className="relative group cursor-pointer" onClick={() => router.push("/settings")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-indigo-500 p-[2px] shadow-sm shadow-cyan-500/20 group-hover:shadow-md group-hover:shadow-cyan-500/30 transition-all duration-300">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-indigo-400">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-sm" />
          </div>

          {/* Logout - dark theme */}
          <button
            id="header-logout"
            onClick={handleLogout}
            title="Secure Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
