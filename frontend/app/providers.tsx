"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="flex-1 w-full h-full">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-5 lg:p-6 scroll-smooth z-0">
          <div className="w-full h-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
