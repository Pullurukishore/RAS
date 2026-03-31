"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  LayoutDashboard,
  ReceiptText,
  Users,
  Settings,
  PieChart,
  UserRound,
  History,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
  Scissors,
  BadgeCheck,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";

/* ─── Sidebar Nav Config ─── */
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", badge: null },
  { icon: ReceiptText, label: "Billing", href: "/billing", badge: null },
  { icon: Sparkles, label: "Salon Menu", href: "/salon-menu", badge: null },
  { icon: Calendar, label: "Appointments", href: "/appointments", badge: null },
  { icon: PieChart, label: "Reports", href: "/reports", badge: null },
  { icon: Users, label: "Customers", href: "/customers", badge: null },
  { icon: UserRound, label: "Staff", href: "/staff", badge: null },
  { icon: History, label: "Closing", href: "/closing", badge: null },
];

const systemMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-20 lg:w-[280px]"
      } bg-slate-950 text-slate-300 flex flex-col transition-all duration-500 ease-in-out relative z-50 flex-shrink-0 overflow-hidden`}
    >
      {/* ── Background Decorations ── */}
      {/* Top gradient glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-500/10 via-teal-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glass edge effect */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* ═══════════════════════════════
          BRAND HEADER
         ═══════════════════════════════ */}
      <div className="h-20 flex items-center justify-center lg:justify-start gap-4 px-5 lg:px-6 border-b border-white/[0.05] relative z-10">
        <div className="relative flex-shrink-0 group cursor-pointer">
          {/* Glow ring behind logo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-all duration-700" />
          <div className="relative w-11 h-11 bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white font-bold text-lg ring-1 ring-white/20">
            <Scissors size={20} strokeWidth={2.5} />
          </div>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col"
          >
            <span className="text-lg font-bold tracking-tight text-white leading-none">
              RAS
            </span>
            <span className="text-[10px] font-medium text-cyan-400/80 uppercase tracking-[0.2em] mt-1">
              Premium Salon
            </span>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════
          NAVIGATION
         ═══════════════════════════════ */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide relative z-10">
        {/* Section Label */}
        {!collapsed && (
          <div className="hidden lg:flex items-center gap-2 px-3 mb-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
              Main Menu
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
          </div>
        )}

        <ul className="space-y-1.5 flex flex-col">
          {mainMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 py-3 px-3 lg:px-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-r-full shadow-[0_0_16px_rgba(45,212,191,0.5)]"
                      transition={{ type: "spring" as const, stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  {/* Active background glow */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.15] via-teal-500/[0.08] to-transparent rounded-2xl" />
                  )}

                  {/* Icon container */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 flex-shrink-0 ${
                      active
                        ? "bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-sm shadow-cyan-500/10 ring-1 ring-cyan-500/20"
                        : "text-slate-400 group-hover:text-cyan-300 group-hover:bg-white/[0.05] group-hover:ring-1 group-hover:ring-white/10"
                    }`}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className="transition-all duration-300"
                    />
                  </div>

                  {/* Label */}
                  {!collapsed && (
                    <span
                      className={`hidden lg:block relative z-10 text-sm font-medium transition-all duration-300 ${
                        active
                          ? "font-semibold text-white"
                          : "group-hover:translate-x-0.5"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Active end dot */}
                  {active && !collapsed && (
                    <div className="hidden lg:block ml-auto relative z-10">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* System section label */}
        <div className="mt-8 mb-3">
          {!collapsed && (
            <div className="hidden lg:flex items-center gap-2 px-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                System
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="w-6 h-px bg-slate-700" />
            </div>
          )}
        </div>

        <ul className="space-y-1.5">
          {systemMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 py-3 px-3 lg:px-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-system"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-r-full shadow-[0_0_16px_rgba(45,212,191,0.5)]"
                      transition={{ type: "spring" as const, stiffness: 350, damping: 30 }}
                    />
                  )}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.15] via-teal-500/[0.08] to-transparent rounded-2xl" />
                  )}

                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 flex-shrink-0 ${
                      active
                        ? "bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-300 ring-1 ring-cyan-500/20"
                        : "text-slate-400 group-hover:text-cyan-300 group-hover:bg-white/[0.05] group-hover:ring-1 group-hover:ring-white/10"
                    }`}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className="transition-all duration-500"
                    />
                  </div>

                  {!collapsed && (
                    <span
                      className={`hidden lg:block relative z-10 text-sm font-medium transition-all duration-300 ${
                        active ? "font-semibold text-white" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Premium Badge */}
        {!collapsed && (
          <div className="hidden lg:block mt-8 mx-3">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-indigo-500/10 border border-cyan-500/20 p-4">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Premium</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enjoy unlimited access to all premium features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════
          COLLAPSE TOGGLE (desktop only)
         ═══════════════════════════════ */}
      <div className="hidden lg:flex justify-center py-3 relative z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-xl text-slate-500 hover:text-cyan-300 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ═══════════════════════════════
          PROFILE FOOTER
         ═══════════════════════════════ */}
      <div className="p-3 border-t border-white/[0.05] bg-gradient-to-t from-white/[0.02] to-transparent relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.05] cursor-pointer transition-all duration-300 group border border-transparent hover:border-white/10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/[0.1] flex items-center justify-center overflow-hidden group-hover:border-cyan-500/30 transition-all duration-300 shadow-lg shadow-black/20">
              <UserRound size={22} className="text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>

          {/* Info */}
          {!collapsed && (
            <div className="hidden lg:block flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-cyan-400/70 truncate mt-0.5 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={10} className="text-amber-400" />
                Online
              </p>
            </div>
          )}

          {/* Logout */}
          {!collapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Log Out"
              className="hidden lg:flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all duration-300 p-2 rounded-xl hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
