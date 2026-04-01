"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SalonMenu from "@/components/SalonMenu";
import {
  Plus,
  X,
  Tag,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  User,
  Sparkles,
  ChevronLeft,
  Receipt,
  Save,
  CreditCard,
  Crown,
} from "lucide-react";
import { BillItem } from "@/components/billing/types";
import BillItemsTable from "@/components/billing/BillItemsTable";
import PaymentMethods from "@/components/billing/PaymentMethods";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function EditBillingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [items, setItems] = useState<BillItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [discountInput, setDiscountInput] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/staff`).then((res) => res.json()),
      fetch(`${apiUrl}/customers`).then((res) => res.json()),
      fetch(`${apiUrl}/billing/${id}`).then((res) => res.json()),
    ])
      .then(([staffData, customersData, invoiceData]) => {
        setStaff(staffData);
        setCustomers(customersData);

        if (invoiceData && !invoiceData.error) {
          if (invoiceData.customer) setSelectedCustomer(invoiceData.customer);
          if (invoiceData.payments?.length > 0) setPaymentMethod(invoiceData.payments[0].method);
          if (invoiceData.totalDiscount) {
            setDiscountInput(String(invoiceData.totalDiscount));
          }

          if (invoiceData.items) {
            const mappedItems: BillItem[] = invoiceData.items.map((item: any) => ({
              id: item.id,
              description:
                item.service?.description ||
                item.product?.description ||
                item.package?.description ||
                `Legacy Item`,
              staffId: item.staffId,
              staffName: item.staff?.name || "Unknown Staff",
              staffRole: item.staff?.role || "",
              price: item.price,
              qty: item.quantity,
              total: item.total,
              serviceId: item.serviceId,
              productId: item.productId,
              packageId: item.packageId,
              gst: item.gst || 0,
              taxAmount: item.taxAmount || 0,
              regularPrice: item.service?.price || item.product?.price || item.package?.price || item.price,
              mPrice: item.service?.mPrice || item.product?.mPrice || item.package?.mPrice || undefined,
              isMemberPrice: item.isMemberPrice || false
            }));
            setItems(mappedItems);
          }
        } else {
          alert("Invoice not found or error loading it.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load edit data:", err);
        setLoading(false);
      });
  }, [apiUrl, id]);

  /* ─── Item Actions ─── */
  const addItemToBill = useCallback((menuItem: any) => {
    // Determine the best price: Member price if applicable, else regular price
    const isMember = selectedCustomer?.isMember;
    const hasMemberPrice = menuItem.mPrice !== undefined && menuItem.mPrice !== null;
    const useMemberPrice = isMember && hasMemberPrice;
    const itemPrice = (useMemberPrice && menuItem.mPrice !== undefined) ? menuItem.mPrice : menuItem.price;

    const newItem: BillItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: menuItem.description,
      staffId: staff[0]?.id || "",
      staffName: staff[0]?.name || "SELECT STAFF",
      price: itemPrice,
      regularPrice: menuItem.price,
      mPrice: menuItem.mPrice,
      isMemberPrice: useMemberPrice,
      qty: 1,
      total: itemPrice,
      serviceId: (menuItem.type === "Service" || !menuItem.type) ? menuItem.id : undefined,
      productId: menuItem.type === "Product" ? menuItem.id : undefined,
      packageId: menuItem.type === "Package" ? menuItem.id : undefined,
      gst: menuItem.gst || 0,
      taxAmount: itemPrice * ((menuItem.gst || 0) / 100),
    };
    setItems((prev) => [...prev, newItem]);
    setIsMenuOpen(false);
  }, [staff, selectedCustomer]);

  // Automatically update prices when customer changes
  useEffect(() => {
    const isMember = selectedCustomer?.isMember;
    setItems((prev) => 
      prev.map((item) => {
        const hasMemberPrice = item.mPrice !== undefined && item.mPrice !== null;
        const useMemberPrice = isMember && hasMemberPrice;
        const newPrice = useMemberPrice ? (item.mPrice ?? item.regularPrice ?? item.price) : (item.regularPrice ?? item.price);
        const newTaxAmount = newPrice * (item.qty || 1) * ((item.gst || 0) / 100);
        
        return {
          ...item,
          price: newPrice,
          taxAmount: newTaxAmount,
          total: (newPrice * (item.qty || 1)) + newTaxAmount,
          isMemberPrice: useMemberPrice
        };
      })
    );
  }, [selectedCustomer]);

  const updateItemStaff = useCallback((itemId: string, staffId: string) => {
    const selectedStaff = staff.find((s) => s.id === staffId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, staffId, staffName: selectedStaff?.name || "", staffRole: selectedStaff?.role || "" } : item
      )
    );
  }, [staff]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  /* ─── Totals ─── */
  const subTotal = useMemo(() => items.reduce((acc, item) => acc + (item.price * item.qty), 0), [items]);
  const totalTax = useMemo(() => items.reduce((acc, item) => acc + (item.taxAmount || 0), 0), [items]);
  const totalDiscount = useMemo(() => {
    let calcDisc = 0;
    const val = Number(discountInput) || 0;
    if (discountType === "percentage") {
      calcDisc = subTotal * (val / 100);
    } else {
      calcDisc = val;
    }
    calcDisc = Math.min(calcDisc, subTotal);
    return Math.max(0, calcDisc);
  }, [subTotal, discountInput, discountType]);
  const total = useMemo(() => Math.max(0, subTotal + totalTax - totalDiscount), [subTotal, totalTax, totalDiscount]);

  /* ─── Submit ─── */
  const handleCompletePayment = async () => {
    if (items.length === 0) return alert("Please add items to the bill");
    if (items.some((i) => !i.staffId)) return alert("Please select staff for all items");

    setIsSaving(true);
    const body = {
      customerId: selectedCustomer?.id || null,
      items: items.map((i) => ({
        serviceId: i.serviceId,
        productId: i.productId,
        packageId: i.packageId,
        staffId: i.staffId,
        price: i.price,
        gst: i.gst,
        taxAmount: i.taxAmount,
      })),
      totalDiscount,
      payments: [{ method: paymentMethod, amount: total }],
    };

    try {
      const res = await fetch(`${apiUrl}/billing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push(`/billing/${id}`);
      } else {
        alert("Failed to update bill.");
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Billing update failed:", err);
      alert("Error occurred while updating the bill.");
      setIsSaving(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-teal-500">
            <Receipt size={24} />
          </div>
        </div>
        <p className="text-slate-400 font-semibold text-base animate-pulse">Loading Invoice...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/billing")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm bg-white/90 backdrop-blur-xl px-5 py-3 rounded-xl shadow-lg shadow-slate-200/30 border border-white/60 hover:shadow-xl group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Cancel
          </button>
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-100 shadow-sm">
            <Tag size={12} />
            Editing #{typeof id === "string" ? id.substring(0, 8).toUpperCase() : id}
          </div>
        </div>

        {/* Live total */}
        {items.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-900/20">
            <Receipt size={18} className="text-teal-400" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
            <span className="text-lg font-black tabular-nums text-teal-400">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Layout (two-column) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        {/* Left: Items table + Actions */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Items Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-slate-200/30 flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bill Items</h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {items.length === 0
                      ? "Add services from the menu"
                      : `${items.length} item${items.length > 1 ? "s" : ""} · ₹${subTotal.toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95 transition-all w-full md:w-auto justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Add From Menu</span>
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30 p-5">
              {items.length === 0 ? (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-10 bg-white/50">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                    <Plus className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No Items Added</h3>
                  <p className="text-sm text-slate-400 max-w-sm">
                    Click "Add From Menu" to browse and add services or products to this invoice.
                  </p>
                </div>
              ) : (
                <BillItemsTable items={items} staff={staff} updateItemStaff={updateItemStaff} removeItem={removeItem} />
              )}
            </div>
          </div>

          {/* Payment methods card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-slate-200/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
                <p className="text-[11px] text-slate-400 font-medium">Update the payment method</p>
              </div>
            </div>
            <PaymentMethods paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col sticky top-4">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500" />

            <h2 className="text-lg font-bold mb-5 relative z-10 flex items-center gap-2">
              <Receipt size={18} className="text-teal-400" />
              Order Summary
            </h2>

            {/* Customer info */}
            <div className="bg-white/10 rounded-2xl p-5 mb-5 relative z-10 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Customer Detail</p>
                {selectedCustomer?.isMember && (
                  <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <Crown size={10} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase">Member</span>
                  </div>
                )}
              </div>
              
              <div className="relative group">
                <select
                  value={selectedCustomer?.id || ""}
                  onChange={(e) => {
                    const c = customers.find((c) => c.id === e.target.value);
                    setSelectedCustomer(c || null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:bg-white/10 focus:ring-2 focus:ring-teal-500/30 appearance-none cursor-pointer transition-all"
                >
                  <option value="" className="text-slate-900">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900">
                      {c.name} {c.phone ? `(${c.phone})` : ""} {c.isMember ? "👑" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-white/60 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>

              {selectedCustomer && (
                <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg`}>
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-teal-300/80 font-medium">{selectedCustomer.phone || "No phone number"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Line items preview */}
            <div className="space-y-2 mb-5 relative z-10 flex-1 overflow-y-auto max-h-52">
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No items added yet</p>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 truncate mr-3 flex-1">
                      <span className="text-slate-300 truncate">{item.description}</span>
                      {item.isMemberPrice && (
                        <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-1 rounded-sm border border-amber-500/30">M</span>
                      )}
                    </div>
                    <span className="text-white font-bold font-mono tabular-nums">₹{item.total.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6 relative z-10 font-mono text-sm pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal (Base)</span>
                <span className="text-white font-bold tabular-nums">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>GST Allocation</span>
                <span className="font-bold tabular-nums">₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-start text-rose-400/90">
                <span>Discount</span>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setDiscountType("amount"); setDiscountInput(""); }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${discountType === "amount" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-300"}`}
                    >
                      ₹
                    </button>
                    <button
                      onClick={() => { setDiscountType("percentage"); setDiscountInput(""); }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${discountType === "percentage" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-300"}`}
                    >
                      %
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">{discountType === "amount" ? "-₹" : "%"}</span>
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, "");
                        if (val.split('.').length > 2) return;
                        if (discountType === "percentage" && Number(val) > 100) val = "100";
                        setDiscountInput(val);
                      }}
                      placeholder="0"
                      className="w-16 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2 py-1 text-right text-rose-400 font-bold outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all font-mono"
                    />
                  </div>
                  {discountType === "percentage" && discountInput && Number(discountInput) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold">-₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total</p>
                <span className="text-slate-400 text-xs font-medium">via {paymentMethod}</span>
              </div>
              <span className="text-4xl font-black text-teal-400 tracking-tight tabular-nums">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Save Button */}
            <button
              onClick={handleCompletePayment}
              disabled={isSaving || items.length === 0}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Save size={16} /> Update Invoice
                  <CheckCircle2 className="group-hover:scale-110 transition-transform" size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu Modal ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-6xl h-full max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-white/60">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-rose-500" />
                Browse Salon Menu
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-rose-500 p-2.5 rounded-xl hover:bg-rose-50 transition-all group border border-transparent hover:border-rose-100"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
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
