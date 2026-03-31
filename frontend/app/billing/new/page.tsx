"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SalonMenu from "@/components/SalonMenu";
import { BillItem } from "@/components/billing/types";
import BillItemsTable from "@/components/billing/BillItemsTable";
import PaymentMethods from "@/components/billing/PaymentMethods";
import {
  Plus,
  X,
  User,
  Search,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  CreditCard,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  Receipt,
  Phone,
  Hash,
  Crown,
} from "lucide-react";

// ─── Helpers ───
const getInitials = (name: string) => {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-blue-600',
    'from-indigo-500 to-violet-600'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ─── Types ───
interface Customer {
  id: string;
  name: string;
  phone?: string;
  isMember?: boolean;
}

interface Staff {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  description: string;
  price: number;
  mPrice?: number;
  gst?: number;
  type?: "Service" | "Product" | "Package" | "Membership";
}

/* ─── Step Configuration ─── */
const STEPS = [
  { step: 1, label: "Customer", subtitle: "Select or create", icon: User, color: "from-indigo-500 to-violet-600" },
  { step: 2, label: "Services", subtitle: "Add items", icon: ShoppingBag, color: "from-rose-500 to-pink-600" },
  { step: 3, label: "Payment", subtitle: "Finalize bill", icon: CreditCard, color: "from-emerald-500 to-teal-600" },
];

export default function NewBillingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<BillItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1 State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", 
    phone: "",
    isMember: false,
    membershipTier: "Standard",
    membershipExpiry: ""
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Step 3 State
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [discountInput, setDiscountInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence State
  const [customerScrollTop, setCustomerScrollTop] = useState(0);
  const customerListRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Restore scroll position when returning to Step 1
  useEffect(() => {
    if (currentStep === 1 && customerListRef.current) {
      customerListRef.current.scrollTop = customerScrollTop;
    }
  }, [currentStep, customerScrollTop]);

  // Debounced search
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setCustomerSearch(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [staffRes, customersRes] = await Promise.all([
          fetch(`${apiUrl}/staff`),
          fetch(`${apiUrl}/customers`),
        ]);

        if (!staffRes.ok) throw new Error("Failed to load staff");
        if (!customersRes.ok) throw new Error("Failed to load customers");

        const [staffData, customersData] = await Promise.all([
          staffRes.json(),
          customersRes.json(),
        ]);

        setStaff(staffData);
        setCustomers(customersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Data loading failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [apiUrl]);

  /* ─── Customer Actions ─── */
  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return alert("Customer name is required");
    setIsSavingCustomer(true);
    try {
      const res = await fetch(`${apiUrl}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const created = await res.json();
        setCustomers([created, ...customers]);
        setSelectedCustomer(created);
        setIsAddingCustomer(false);
        setNewCustomer({ 
          name: "", 
          phone: "",
          isMember: false,
          membershipTier: "Standard",
          membershipExpiry: ""
        });
      }
    } catch (err) {
      console.error("Failed to create customer:", err);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  /* ─── Item Actions ─── */
  const addItemToBill = useCallback((menuItem: MenuItem) => {
    // Determine the best price: Member price if applicable, else regular price
    const isMember = selectedCustomer?.isMember;
    const hasMemberPrice = menuItem.mPrice !== undefined && menuItem.mPrice !== null;
    const useMemberPrice = isMember && hasMemberPrice;
    const itemPrice = (useMemberPrice && menuItem.mPrice !== undefined) ? menuItem.mPrice : menuItem.price;
    
    const newItem: BillItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: menuItem.description,
      staffId: "",
      staffName: "SELECT STAFF",
      price: itemPrice,
      regularPrice: menuItem.price,
      mPrice: menuItem.mPrice,
      isMemberPrice: useMemberPrice,
      qty: 1,
      total: itemPrice,
      serviceId: menuItem.type === "Service" ? menuItem.id : undefined,
      productId: menuItem.type === "Product" ? menuItem.id : undefined,
      packageId: menuItem.type === "Package" ? menuItem.id : undefined,
    };

    setItems((prev) => [...prev, newItem]);
    setIsMenuOpen(false);
  }, [selectedCustomer]);

  // Automatically update prices when customer changes
  useEffect(() => {
    const isMember = selectedCustomer?.isMember;
    setItems((prev) => 
      prev.map((item) => {
        const hasMemberPrice = item.mPrice !== undefined && item.mPrice !== null;
        const useMemberPrice = isMember && hasMemberPrice;
        const newPrice = useMemberPrice ? (item.mPrice ?? item.regularPrice ?? item.price) : (item.regularPrice ?? item.price);
        
        return {
          ...item,
          price: newPrice,
          total: newPrice * (item.qty || 1),
          isMemberPrice: useMemberPrice
        };
      })
    );
  }, [selectedCustomer]);

  const updateItemStaff = useCallback((itemId: string, staffId: string) => {
    const selectedStaff = staff.find((s) => s.id === staffId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, staffId, staffName: selectedStaff?.name || "" } : item
      )
    );
  }, [staff]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* ─── Totals ─── */
  const { subTotal, total, discountAmount } = useMemo(() => {
    const sub = items.reduce((acc, item) => acc + item.price, 0);
    
    let calcDisc = 0;
    const val = Number(discountInput) || 0;
    if (discountType === "percentage") {
      calcDisc = sub * (val / 100);
    } else {
      calcDisc = val;
    }
    calcDisc = Math.min(calcDisc, sub);
    calcDisc = Math.max(0, calcDisc);
    
    const final = Math.max(0, sub - calcDisc);
    return { subTotal: sub, total: final, discountAmount: calcDisc };
  }, [items, discountInput, discountType]);

  /* ─── Submit ─── */
  const handleCompletePayment = async () => {
    if (!selectedCustomer) return alert("Customer is required");
    if (items.length === 0) return alert("Please add items to the bill");
    if (items.some((i) => !i.staffId)) return alert("Please select staff for all items");

    setIsSubmitting(true);
    const body = {
      customerId: selectedCustomer.id,
      items: items.map((i) => ({
        serviceId: i.serviceId,
        productId: i.productId,
        packageId: i.packageId,
        staffId: i.staffId,
        quantity: i.qty || 1,
        price: i.price,
      })),

      totalDiscount: discountAmount,
      payments: [{ method: paymentMethod, amount: total }],
    };

    try {
      const res = await fetch(`${apiUrl}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const result = await res.json();
        router.push(`/billing/${result.invoiceId || result.id}`);
      } else {
        alert("Failed to create invoice");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Billing failed:", err);
      setIsSubmitting(false);
    }
  };

  const handleStepChange = (newStep: number) => {
    if (currentStep === 1 && customerListRef.current) {
      setCustomerScrollTop(customerListRef.current.scrollTop);
    }
    setCurrentStep(newStep);
  };

  /* ─── Derived ─── */
  const filteredCustomers = useMemo(
    () =>
      customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.phone && c.phone.includes(customerSearch))
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [customers, customerSearch]
  );

  const groupedCustomers = useMemo(() => {
    if (customerSearch) return { "Search Results": filteredCustomers };
    const groups: Record<string, Customer[]> = {};
    filteredCustomers.forEach((c) => {
      const char = c.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(char) ? char : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filteredCustomers, customerSearch]);

  // Keyboard navigation for customer selection
  const [focusedIndex, setFocusedIndex] = useState(-1);
  useEffect(() => {
    setFocusedIndex(-1);
  }, [customerSearch]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCustomers.length === 0) return;

    if (e.key === "ArrowDown") {
      setFocusedIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setFocusedIndex(prev => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      setSelectedCustomer(filteredCustomers[focusedIndex]);
      e.preventDefault();
    }
  };

  const HighlightMatch = ({ text, match }: { text: string; match: string }) => {
    if (!match) return <>{text}</>;
    const parts = text.split(new RegExp(`(${match})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === match.toLowerCase() ? (
            <span key={i} className="bg-indigo-100 text-indigo-700 font-black rounded-sm px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const canProceedToStep2 = selectedCustomer !== null;
  const canProceedToStep3 = items.length > 0 && !items.some((i) => !i.staffId);

  /* ═══════════════════════════════
     RENDER
     ═══════════════════════════════ */
  return (
    <div className="w-full h-full flex flex-col relative">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/billing")}
          className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Cancel
        </button>

        {/* ── Stepper ── */}
        <div className="hidden sm:flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <div key={s.step} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (s.step === 1) handleStepChange(1);
                    if (s.step === 2 && canProceedToStep2) handleStepChange(2);
                    if (s.step === 3 && canProceedToStep2 && canProceedToStep3) handleStepChange(3);
                  }}
                  disabled={
                    (s.step === 2 && !canProceedToStep2) ||
                    (s.step === 3 && (!canProceedToStep2 || !canProceedToStep3))
                  }
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <s.icon size={16} />
                  )}
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full transition-colors ${currentStep > s.step ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <div className="sm:hidden flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r ${STEPS[currentStep - 1].color} text-white`}>
            Step {currentStep}/3
          </span>
        </div>

        {/* Live total */}
        {items.length > 0 && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-xl">
            <Receipt size={15} className="text-teal-400" />
            <span className="text-xs text-slate-400 font-bold">Total</span>
            <span className="text-base font-black tabular-nums text-teal-400">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="wait">
          {/* ━━━ STEP 1: CUSTOMER ━━━ */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              {/* Left: Customer selection */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Select Customer</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Required for invoice</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddingCustomer(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                  >
                    <UserPlus size={14} /> New
                  </button>
                </div>

                {/* Search */}
                <div className="px-5 pt-4">
                  <div className="relative group">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Customer list with loading state */}
                <div 
                  ref={customerListRef}
                  className="flex-1 overflow-y-auto p-3 mt-1 scroll-smooth"
                >
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-indigo-500 mb-3" size={28} />
                      <p className="text-sm font-medium text-slate-500">Loading customers...</p>
                    </div>
                  ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-3">
                        <AlertCircle size={22} className="text-rose-500" />
                      </div>
                      <p className="text-sm font-bold text-rose-600">Failed to load</p>
                      <p className="text-xs text-slate-400 mt-1">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <Search size={22} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">No customers found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search or add a new customer</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedCustomers).map(([letter, groupCustomers]) => (
                        <div key={letter}>
                          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 py-2 mb-2 px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm inline-block">
                              {letter}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {groupCustomers.map((c) => {
                              const isSelected = selectedCustomer?.id === c.id;
                              const isFocused = filteredCustomers[focusedIndex]?.id === c.id;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => setSelectedCustomer(c)}
                                  className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                                    isSelected
                                      ? "bg-indigo-50 border border-indigo-200 shadow-sm scale-[1.01]"
                                      : isFocused
                                      ? "bg-slate-50 ring-2 ring-indigo-500/10 border-indigo-300/30"
                                      : "hover:bg-slate-50 border border-transparent hover:translate-x-1"
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md ${
                                        isSelected
                                          ? "bg-indigo-600 text-white translate-x-1"
                                          : `bg-gradient-to-br ${getAvatarColor(c.name)} text-white group-hover:scale-110`
                                      }`}
                                    >
                                      {getInitials(c.name)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
                                          <HighlightMatch text={c.name} match={customerSearch} />
                                        </p>
                                        {c.isMember && (
                                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 shadow-sm border border-amber-200/50">
                                            <Crown size={12} fill="currentColor" />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5 opacity-70">
                                        <Phone size={10} className="text-slate-300" />
                                        <HighlightMatch text={c.phone || "NO CONTACT"} match={customerSearch} />
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected ? (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 animate-in zoom-in duration-300">
                                      <CheckCircle2 size={14} />
                                    </div>
                                  ) : (
                                    <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/30">
                  <button
                    onClick={() => handleStepChange(2)}
                    disabled={!canProceedToStep2}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/15 group"
                  >
                    Continue
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right: Quick add / Selected info */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Selected customer card */}
                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-3">Selected Customer</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl backdrop-blur-sm">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black">{selectedCustomer.name}</h3>
                          {selectedCustomer.isMember && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg">
                              <Crown size={12} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <p className="text-indigo-200 text-sm font-medium">{selectedCustomer.phone || "No phone"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="mt-4 text-xs font-bold text-white/60 hover:text-white transition-colors"
                    >
                      Change customer →
                    </button>
                  </motion.div>
                )}

                {/* Add new customer form */}
                {isAddingCustomer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
                  >
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                          <UserPlus size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-white">Register Client</h3>
                      </div>
                      <button 
                        onClick={() => setIsAddingCustomer(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                            Full Name 
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            placeholder="9876543210"
                            value={newCustomer.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setNewCustomer({ ...newCustomer, phone: val });
                            }}
                            maxLength={10}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>

                        {/* Membership Mini-Form */}
                        <div className={`rounded-2xl border transition-all duration-300 ${newCustomer.isMember ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${newCustomer.isMember ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                                <Crown size={18} />
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Membership</p>
                                <p className="text-[10px] text-slate-500 font-medium">Activate member benefits</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewCustomer({...newCustomer, isMember: !newCustomer.isMember})}
                              className={`relative w-11 h-6 rounded-full transition-colors ${newCustomer.isMember ? 'bg-rose-500 shadow-sm' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${newCustomer.isMember ? 'left-6' : 'left-1'}`} />
                            </button>
                          </div>

                          {newCustomer.isMember && (
                            <div className="px-4 pb-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-amber-700 ml-1">Tier</label>
                                <select 
                                  value={newCustomer.membershipTier}
                                  onChange={(e) => setNewCustomer({...newCustomer, membershipTier: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none"
                                >
                                  <option>Standard</option>
                                  <option>Premium</option>
                                  <option>VIP</option>
                                  <option>Elite</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-amber-700 ml-1">Expiry</label>
                                <input 
                                  type="date"
                                  value={newCustomer.membershipExpiry}
                                  onChange={(e) => setNewCustomer({...newCustomer, membershipExpiry: e.target.value})}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleCreateCustomer}
                          disabled={isSavingCustomer || !newCustomer.name}
                          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 disabled:opacity-50 hover:bg-black flex justify-center items-center gap-2 transition-all active:scale-95"
                        >
                          {isSavingCustomer ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={16} />}
                          Register & Select
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick info */}
                {!isAddingCustomer && !selectedCustomer && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center flex-1">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                      <User size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">No customer selected</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Pick a customer from the list or register a new one to continue.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ━━━ STEP 2: SERVICES & PRODUCTS ━━━ */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Add Items to Bill</h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {items.length === 0 ? "Browse menu to add services" : `${items.length} item${items.length > 1 ? "s" : ""} added · ₹${subTotal.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="group relative overflow-hidden bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all w-full md:w-auto justify-center"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-500/15 to-pink-500/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Add From Menu</span>
                </button>
              </div>

              {/* Items area */}
              <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30 p-4 md:p-5">
                {items.length === 0 ? (
                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-white/60">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Plus className="text-slate-300" size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700 mb-1">No Items Added</h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                      Click &quot;Add From Menu&quot; to browse services, products, and packages.
                    </p>
                  </div>
                ) : (
                  <BillItemsTable items={items} staff={staff} updateItemStaff={updateItemStaff} removeItem={removeItem} />
                )}
              </div>

              {/* Footer with summary + nav */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <button
                  onClick={() => handleStepChange(1)}
                  className="flex items-center gap-1.5 text-slate-500 font-bold text-sm hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-4">
                  {items.length > 0 && (
                    <div className="hidden sm:flex items-center gap-3 text-sm">
                      <span className="text-slate-400 font-medium">Order Total</span>
                      <span className="font-bold text-slate-900 tabular-nums">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleStepChange(3)}
                    disabled={!canProceedToStep3}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/15 group"
                  >
                    Payment
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━ STEP 3: PAYMENT & SUMMARY ━━━ */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              {/* Left: Payment method + checklist */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                {/* Payment methods */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Choose how the customer is paying</p>
                    </div>
                  </div>
                  <PaymentMethods paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                </div>

                {/* Discount Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Apply Discount</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Choose amount or percentage</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => { setDiscountType("amount"); setDiscountInput(""); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${discountType === "amount" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Amount (₹)
                      </button>
                      <button
                        onClick={() => { setDiscountType("percentage"); setDiscountInput(""); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${discountType === "percentage" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        {discountType === "amount" ? "₹" : "%"}
                      </div>
                      <input
                        type="text"
                        value={discountInput}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, "");
                          if (val.split('.').length > 2) return;
                          if (discountType === "percentage" && Number(val) > 100) {
                            val = "100";
                          }
                          setDiscountInput(val);
                        }}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all"
                      />
                      {discountType === "percentage" && discountInput && Number(discountInput) > 0 && (
                        <p className="text-[10px] text-emerald-600 mt-1.5 font-medium border border-emerald-100 bg-emerald-50 rounded-lg px-2 py-1 inline-block">
                          Applied discount: ₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {discountAmount >= subTotal && subTotal > 0 && discountType === "amount" && (
                        <p className="text-[10px] text-rose-500 mt-1.5 font-medium">Maximum discount applied (100%)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order checklist */}
                <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-100/80">
                  <h4 className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3">
                    <AlertCircle size={15} /> Pre-flight Checklist
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Customer", value: selectedCustomer?.name, ok: !!selectedCustomer },
                      { label: "Items", value: `${items.length} item${items.length !== 1 ? "s" : ""}`, ok: items.length > 0 },
                      { label: "Staff", value: "All assigned", ok: !items.some(i => !i.staffId) },
                      { label: "Payment", value: paymentMethod, ok: true },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${check.ok ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-amber-700/70 font-medium">{check.label}:</span>
                        <span className="font-bold text-amber-800">{check.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back button for mobile */}
                <button
                  onClick={() => handleStepChange(2)}
                  className="lg:hidden flex items-center gap-1.5 text-slate-500 font-bold text-sm hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors self-start"
                >
                  <ChevronLeft size={16} /> Back to Items
                </button>
              </div>

              {/* Right: Order summary (dark card) */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col h-full">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                  <h2 className="text-lg font-bold mb-5 relative z-10 flex items-center gap-2">
                    <Receipt size={18} className="text-teal-400" />
                    Order Summary
                  </h2>

                  {/* Customer */}
                  <div className="bg-white/10 rounded-xl p-4 mb-5 relative z-10 backdrop-blur-sm border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                        {selectedCustomer?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Billed To</p>
                        <p className="font-bold text-base">{selectedCustomer?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="space-y-2 mb-5 relative z-10 flex-1 overflow-y-auto max-h-48">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2 truncate mr-3 flex-1">
                          <span className="text-slate-300 truncate">{item.description}</span>
                          {item.isMemberPrice && (
                            <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-1 rounded-sm border border-amber-500/30">M</span>
                          )}
                        </div>
                        <span className="text-white font-bold font-mono tabular-nums">₹{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-6 relative z-10 font-mono text-sm pt-4 border-t border-white/10">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-white font-bold">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg -mx-3">
                        <span className="text-xs font-bold uppercase tracking-widest">Discount</span>
                        <span className="font-bold">-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Due</p>
                      <span className="text-slate-400 text-xs font-medium">via {paymentMethod}</span>
                    </div>
                    <span className="text-4xl font-black text-teal-400 tracking-tight tabular-nums">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 relative z-10 mt-auto">
                    <button
                      onClick={() => handleStepChange(2)}
                      className="hidden lg:flex px-4 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors items-center gap-1.5"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleCompletePayment}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          Submit Payment
                          <CheckCircle2 className="group-hover:scale-110 transition-transform" size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Menu Modal ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="bg-white w-full max-w-6xl h-full max-h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShoppingBag size={16} className="text-rose-500" />
                Browse Salon Menu
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <div className="flex-1 overflow-auto list-none">
              <SalonMenu onAdd={addItemToBill} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
