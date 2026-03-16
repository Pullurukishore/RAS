"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, Mail, Loader2, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@naturals.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setFailedAttempts(0);
        Cookies.set("currentUser", JSON.stringify(data.user), { expires: 365 });
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutTimer(60);
          setError("Too many failed attempts. Please try again in 60 seconds.");
        } else {
          setError(errorData.error || "Invalid email or password. Please try again.");
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-teal-500/30 overflow-hidden relative">
      
      {/* Background ambient gradient */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-teal-900/20 blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[150px] mix-blend-screen pointer-events-none" />
      </div>
      
      {/* LEFT PANEL - Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col relative z-10 border-r border-white/5 bg-slate-950/80 backdrop-blur-2xl shadow-2xl">
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }} />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 relative z-10 w-full max-w-2xl mx-auto py-12">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 p-[1px] shadow-lg shadow-teal-500/20 group hover:shadow-teal-500/40 transition-shadow duration-500">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-teal-400 to-indigo-400 group-hover:scale-110 transition-transform duration-500">N</span>
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white flex items-center">
              Naturals
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-3 text-white">
              Welcome back
            </h1>
            <p className="text-slate-400 text-lg mb-12 font-medium">
              Enter your credentials to access your dashboard.
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-teal-400 transition-colors">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-500 group-focus-within:text-teal-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@naturals.com"
                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-teal-400 transition-colors">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-500 group-focus-within:text-teal-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors focus:outline-none p-2 rounded-xl hover:bg-white/5"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-xl font-medium flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button
                  disabled={isLoading || lockoutTimer > 0}
                  type="submit"
                  className="group relative w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 focus:outline-none ring-2 ring-offset-2 ring-offset-slate-950 ring-transparent focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : lockoutTimer > 0 ? (
                      <>
                        <Lock size={18} /> Locked ({lockoutTimer}s)
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight size={18} className="group-hover:translate-x-1 duration-300 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-auto pt-8 flex items-center justify-between"
          >
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} Naturals Salon
            </p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
              v0.1.0-alpha
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - Image/Content */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950 overflow-hidden flex-col justify-end p-12 lg:p-16 xl:p-24">
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop')`, // Premium spa/salon aesthetic
            }} 
          />
          {/* Subtle gradient to ensure text readability without hiding the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />
        </motion.div>
        
        <div className="relative z-10 w-full max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
               <Sparkles size={16} className="text-teal-300" />
               <span className="text-xs font-bold text-white tracking-widest uppercase">Enterprise Edition</span>
            </div>
            
            <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.15] tracking-tight mb-6 drop-shadow-xl border-l-4 border-teal-400 pl-6">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300">salon experience.</span>
            </h2>
            
            <p className="text-lg xl:text-xl text-slate-200 font-medium leading-relaxed mb-0 w-full max-w-xl pl-6 drop-shadow-md">
              A comprehensive management ecosystem designed exclusively for modern salons, spas, and aesthetic centers. Manage appointments, billing, and staff seamlessly.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
