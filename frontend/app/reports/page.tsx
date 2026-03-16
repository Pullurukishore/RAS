"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  FileText, TrendingUp, Users, Scissors, Package, ClipboardList, 
  CalendarDays, HandCoins, UserCheck, Activity, Download, Printer, X, ArrowRight,
  ChevronLeft, ChevronRight
} from "lucide-react";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  
  const [activeReport, setActiveReport] = useState<string>(initialTab || "Bill-Wise Sales Report");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [invRes, servRes, prodRes, staffRes, custRes] = await Promise.all([
          fetch(`${apiUrl}/billing?page=${page}&limit=100`),
          fetch(`${apiUrl}/menu?type=service`),
          fetch(`${apiUrl}/menu?type=product`),
          fetch(`${apiUrl}/staff`),
          fetch(`${apiUrl}/customers`)
        ]);

        if (invRes.ok) {
          const data = await invRes.json();
          setInvoices(data);
          setHasMore(data.length === 100);
        }
        if (servRes.ok) setServices(await servRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
        if (custRes.ok) setCustomers(await custRes.json());
      } catch (error) {
        console.error("Error fetching report data", error);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [apiUrl, page]);

  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let fileName = `${activeReport.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === "Bill-Wise Sales Report") {
      headers = ["Date", "Invoice ID", "Customer", "Staff", "Actual Amount", "Paid Amount", "Discount", "Payment Methods"];
      rows = filteredInvoices.map(inv => [
        new Date(inv.createdAt).toLocaleString(),
        inv.id,
        inv.customer?.name || 'Walkin',
        Array.from(new Set(inv.items?.map((i: any) => i.staff?.name).filter(Boolean))).join(", "),
        inv.totalGross || 0,
        inv.total || 0,
        inv.totalDiscount || 0,
        inv.payments?.map((p: any) => p.method).join(", ")
      ]);
    } else if (activeReport === "Day-Wise Sales Report") {
      const daily = filteredInvoices.reduce((acc: any, inv: any) => {
        const date = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
        if (!acc[date]) acc[date] = { bills: 0, items: 0, actual: 0, discount: 0, cash: 0, upi: 0, card: 0, net: 0, package: 0 };
        acc[date].bills += 1;
        acc[date].items += inv.items?.length || 0;
        acc[date].actual += inv.totalGross || 0;
        acc[date].discount += inv.totalDiscount || 0;
        acc[date].net += inv.total || 0;
        
        // Sum packages specifically
        inv.items?.forEach((i: any) => { if (i.packageId) acc[date].package += i.total || 0; });

        inv.payments?.forEach((p: any) => {
          const m = p.method.toLowerCase();
          if (m.includes("cash")) acc[date].cash += p.amount;
          else if (m.includes("card")) acc[date].card += p.amount;
          else acc[date].upi += p.amount;
        });
        return acc;
      }, {});
      headers = ["Date", "Bills", "Items", "Actual Amount", "Discount", "Packages", "Cash", "UPI", "Card", "Net Sales"];
      rows = Object.keys(daily).map(date => [
        date,
        daily[date].bills,
        daily[date].items,
        daily[date].actual,
        daily[date].discount,
        daily[date].package,
        daily[date].cash,
        daily[date].upi,
        daily[date].card,
        daily[date].net
      ]);
    } else if (activeReport === "Employee Wise Sales") {
      headers = ["Staff Name", "Role", "Service Qty", "Product Qty", "Package Qty", "Service Rev", "Product Rev", "Package Rev", "Actual Total", "Total Discount", "Net Paid"];
      const staffSales = staff.map((s: any) => {
        let actualTotal = 0, totalDiscount = 0, netPaid = 0;
        let serviceSales = 0, productSales = 0, packageSales = 0, sQty = 0, pQty = 0, pkgQty = 0;
        
        filteredInvoices.forEach(inv => {
          const invGross = inv.totalGross || 0;
          const invDiscount = inv.totalDiscount || 0;

          inv.items?.forEach((item: any) => {
            if (item.staffId === s.id) { 
              const itemGross = item.total || 0;
              const itemDiscount = invGross > 0 ? (itemGross / invGross) * invDiscount : 0;
              const itemNet = itemGross - itemDiscount;

              actualTotal += itemGross;
              totalDiscount += itemDiscount;
              netPaid += itemNet;

              if (item.serviceId) { serviceSales += itemGross; sQty += item.quantity || 1; }
              else if (item.productId) { productSales += itemGross; pQty += item.quantity || 1; }
              else if (item.packageId) { packageSales += itemGross; pkgQty += item.quantity || 1; }
            }
          });
        });
        return [s.name, s.role, sQty, pQty, pkgQty, serviceSales, productSales, packageSales, actualTotal, totalDiscount, netPaid];
      }).filter((s: any) => s[2] > 0 || s[3] > 0 || s[4] > 0).sort((a: any, b: any) => b[10] - a[10]);
      rows = staffSales;
        rows.sort((a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    } else if (activeReport === "Client Report") {
        headers = ["Client Name", "Phone", "Visits", "Last Visit", "Actual Spend", "Discount", "Paid", "Last Staff", "Last Service"];
        const clientStats = customers.map(c => {
            const customerInvoices = filteredInvoices
              .filter(inv => inv.customerId === c.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (customerInvoices.length === 0) return null;

            let spend = 0, actualSpend = 0, discount = 0;
            customerInvoices.forEach(inv => {
                spend += inv.total || 0;
                actualSpend += inv.totalGross || 0;
                discount += inv.totalDiscount || 0;
            });

            const lastInv = customerInvoices[0];
            const lastStaff = Array.from(new Set(lastInv.items?.map((i: any) => i.staff?.name).filter(Boolean))).join(", ") || "-";
            const lastService = lastInv.items?.map((i: any) => i.service?.description || i.product?.description || i.package?.description || i.description).join(", ") || "-";
            const lastDate = new Date(lastInv.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' });

            return [c.name, c.phone || "-", customerInvoices.length, lastDate, actualSpend, discount, spend, lastStaff, lastService];
        }).filter(Boolean).sort((a: any, b: any) => (b[6] as number) - (a[6] as number));
        rows = clientStats;
    } else {
        alert("CSV export for this report type is coming soon!");
        return;
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reports = [
    { title: "Bill-Wise Sales Report", category: "Sales", icon: FileText },
    { title: "Day-Wise Sales Report", category: "Sales", icon: CalendarDays },
    { title: "Employee Wise Sales", category: "Staff & Clients", icon: UserCheck },
    { title: "Customer First - Employee Wise", category: "Staff & Clients", icon: UserCheck },
    { title: "Client Report", category: "Staff & Clients", icon: Users },
  ];

  const filterInvoicesByDate = (invs: any[]) => {
    if (!fromDate && !toDate) return invs;
    
    return invs.filter(inv => {
      const invDate = new Date(inv.createdAt);
      invDate.setHours(0, 0, 0, 0);
      
      if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return invDate >= start && invDate <= end;
      }
      
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        return invDate >= start;
      }
      
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return invDate <= end;
      }
      
      return true;
    });
  };

  const filteredInvoices = filterInvoicesByDate(invoices);

  const getPaymentStyle = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes("cash")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (m.includes("card")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (m.includes("gpay")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (m.includes("paytm")) return "bg-sky-50 text-sky-700 border-sky-200";
    if (m.includes("phonepe")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  // Computed Reports
  const renderBillWise = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
            <th className="p-3">Date</th>
            <th className="p-3">Invoice Id</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Staff</th>
            <th className="p-3 text-right">Actual Amount</th>
            <th className="p-3 text-right">Paid Amount</th>
            <th className="p-3 text-right">Discount</th>
            <th className="p-3 text-center">Payment</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((inv: any, idx: number) => (
            <tr key={inv.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="p-3 text-slate-600 truncate max-w-[120px]">{new Date(inv.createdAt).toLocaleString()}</td>
              <td className="p-3 font-semibold text-teal-700">{inv.id}</td>
              <td className="p-3 text-slate-700">{inv.customer?.name || 'Walkin'}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1 max-w-[120px]">
                  {Array.from(new Set(inv.items?.map((i: any) => i.staff?.name).filter(Boolean))).map((staffName: any, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    >
                      {staffName}
                    </span>
                  ))}
                  {(!inv.items || inv.items.length === 0 || !inv.items.some((i: any) => i.staff)) && (
                     <span className="text-slate-300 text-xs">—</span>
                  )}
                </div>
              </td>
              <td className="p-3 text-right text-slate-500 font-medium tabular-nums">
                ₹{inv.totalGross?.toLocaleString() || 0}
              </td>
              <td className="p-3 text-right font-black text-slate-800 tabular-nums">
                ₹{inv.total?.toLocaleString() || 0}
              </td>
              <td className="p-3 text-right text-rose-500 font-medium whitespace-nowrap tabular-nums">
                {inv.totalDiscount > 0 ? `-₹${inv.totalDiscount.toLocaleString()}` : '—'}
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center flex-wrap gap-1 max-w-[150px] mx-auto">
                  {inv.payments?.map((p: any, i: number) => (
                     <span key={i} className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-tight border ${getPaymentStyle(p.method)}`}>
                       {p.method}
                     </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
          {filteredInvoices.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No data found</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderDayWise = () => {
    const daily = filteredInvoices.reduce((acc: any, inv: any) => {
      const date = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
      if (!acc[date]) acc[date] = { count: 0, actual: 0, discount: 0, net: 0, items: 0, cash: 0, upi: 0, card: 0, package: 0 };
      
      acc[date].count += 1;
      acc[date].actual += inv.totalGross || 0;
      acc[date].discount += inv.totalDiscount || 0;
      acc[date].net += inv.total || 0;
      acc[date].items += inv.items?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 0;

      // Aggregate Packages for Day
      inv.items?.forEach((i: any) => { if (i.packageId) acc[date].package += i.total || 0; });

      // Payment Breakdown
      inv.payments?.forEach((p: any) => {
        const method = p.method.toLowerCase();
        if (method.includes("cash")) acc[date].cash += p.amount;
        else if (method.includes("card")) acc[date].card += p.amount;
        else acc[date].upi += p.amount; // UPI, GPay, PhonePe, Paytm
      });

      return acc;
    }, {});

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Bills</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-right">Actual</th>
              <th className="p-4 text-right text-rose-500">Discount</th>
              <th className="p-4 text-right text-purple-600">Packages</th>
              <th className="p-4 text-right text-emerald-600">Cash</th>
              <th className="p-4 text-right text-blue-600">UPI</th>
              <th className="p-4 text-right text-indigo-600">Card</th>
              <th className="p-4 text-right font-black">Net Sales</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(daily).map((date) => (
              <tr key={date} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">{date}</td>
                <td className="p-4 text-center">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[10px]">{daily[date].count}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-md font-bold text-[10px]">{daily[date].items}</span>
                </td>
                <td className="p-4 text-right font-medium text-slate-500 tabular-nums">₹{daily[date].actual.toLocaleString()}</td>
                <td className="p-4 text-right font-medium text-rose-500 tabular-nums">₹{daily[date].discount.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-purple-600 tabular-nums">₹{daily[date].package.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-emerald-600 bg-emerald-50/30 tabular-nums">₹{daily[date].cash.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-blue-600 bg-blue-50/30 tabular-nums">₹{daily[date].upi.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-indigo-600 bg-indigo-50/30 tabular-nums">₹{daily[date].card.toLocaleString()}</td>
                <td className="p-4 text-right font-black text-slate-800 bg-slate-50 tabular-nums">₹{daily[date].net.toLocaleString()}</td>
              </tr>
            ))}
            {Object.keys(daily).length === 0 && <tr><td colSpan={10} className="p-12 text-center text-slate-400 font-medium">No sales data found for the selected range</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEmployeeWise = () => {
    const staffSales = staff.map((s: any) => {
      let actualAmount = 0, discount = 0, paidAmount = 0;
      let serviceSales = 0, productSales = 0, packageSales = 0;
      let serviceQty = 0, productQty = 0, packageQty = 0;

      filteredInvoices.forEach(inv => {
        const invGross = inv.totalGross || 0;
        const invDiscount = inv.totalDiscount || 0;

        inv.items?.forEach((item: any) => {
          if (item.staffId === s.id) {
            const itemGross = item.total || 0;
            const itemDiscount = invGross > 0 ? (itemGross / invGross) * invDiscount : 0;
            const itemNet = itemGross - itemDiscount;

            actualAmount += itemGross;
            discount += itemDiscount;
            paidAmount += itemNet;

            if (item.serviceId) {
              serviceSales += itemGross;
              serviceQty += item.quantity || 1;
            } else if (item.productId) {
              productSales += itemGross;
              productQty += item.quantity || 1;
            } else if (item.packageId) {
              packageSales += itemGross;
              packageQty += item.quantity || 1;
            }
          }
        });
      });
      return { 
        ...s, 
        actualAmount, 
        discount, 
        paidAmount, 
        serviceSales, 
        productSales, 
        packageSales, 
        serviceQty, 
        productQty, 
        packageQty 
      };
    }).filter((s: any) => (s.serviceQty + s.productQty + s.packageQty) > 0).sort((a: any, b: any) => b.paidAmount - a.paidAmount);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="p-4">Staff Name</th>
              <th className="p-4 text-center">Services</th>
              <th className="p-4 text-center">Products</th>
              <th className="p-4 text-center">Packages</th>
              <th className="p-4 text-right">Actual Amt</th>
              <th className="p-4 text-right text-rose-500">Discount</th>
              <th className="p-4 text-right font-black">Paid Amt</th>
            </tr>
          </thead>
          <tbody>
            {staffSales.map((s: any) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-teal-700">
                  {s.name} 
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mt-0.5">{s.role}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold text-[10px] border border-teal-100">{s.serviceQty}</span>
                  <div className="text-[9px] text-slate-400 font-bold mt-1">₹{s.serviceSales.toLocaleString()}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px] border border-indigo-100">{s.productQty}</span>
                  <div className="text-[9px] text-slate-400 font-bold mt-1">₹{s.productSales.toLocaleString()}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold text-[10px] border border-purple-100">{s.packageQty}</span>
                  <div className="text-[9px] text-slate-400 font-bold mt-1">₹{s.packageSales.toLocaleString()}</div>
                </td>
                <td className="p-4 text-right text-slate-500 font-medium tabular-nums">₹{s.actualAmount.toLocaleString()}</td>
                <td className="p-4 text-right text-rose-500 font-medium tabular-nums">₹{s.discount.toLocaleString()}</td>
                <td className="p-4 text-right font-black text-slate-800 bg-slate-50 tabular-nums">₹{s.paidAmount.toLocaleString()}</td>
              </tr>
            ))}
            {staffSales.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-medium">No staff sales data found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEmployeeCustomerWise = () => {
    const data: any[] = [];
    filteredInvoices.forEach(inv => {
        const invGross = inv.totalGross || 0;
        const invDiscount = inv.totalDiscount || 0;

        inv.items?.forEach((item: any) => {
            const s = staff.find(st => st.id === item.staffId);
            const itemGross = item.total || 0;
            const itemDiscount = invGross > 0 ? (itemGross / invGross) * invDiscount : 0;
            const itemNet = itemGross - itemDiscount;

            data.push({
                date: inv.createdAt,
                staffName: s?.name || "Unknown",
                staffRole: s?.role || "-",
                customerName: inv.customer?.name || "Walkin",
                itemName: item.service?.description || item.product?.description || item.package?.description || item.description || "Unknown",
                type: item.serviceId ? "Service" : item.productId ? "Product" : "Package",
                actualAmount: itemGross,
                discount: itemDiscount,
                paidAmount: itemNet
            });
        });
    });

    data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-4">Date</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Particulars</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Actual</th>
                <th className="p-4 text-right text-rose-500">Disc.</th>
                <th className="p-4 text-right font-black">Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 tabular-nums">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="font-bold text-teal-700">{d.staffName}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{d.staffRole}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{d.customerName}</td>
                  <td className="p-4 text-slate-600">{d.itemName}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        d.type === 'Service' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        d.type === 'Product' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                        {d.type}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-500 tabular-nums font-medium">₹{d.actualAmount.toLocaleString()}</td>
                  <td className="p-4 text-right text-rose-500 tabular-nums font-medium">₹{d.discount.toLocaleString()}</td>
                  <td className="p-4 text-right font-black text-slate-800 bg-slate-50 tabular-nums">₹{d.paidAmount.toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={8} className="p-12 text-center text-slate-400 font-medium">No data found</td></tr>}
            </tbody>
          </table>
        </div>
    );
  };

  const renderServiceUsage = () => {
    const usage: any = {};
    filteredInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        if (item.serviceId) {
          if (!usage[item.serviceId]) usage[item.serviceId] = { count: 0, revenue: 0 };
          usage[item.serviceId].count += item.quantity || 1;
          usage[item.serviceId].revenue += item.total || 0;
        }
      });
    });

    const mapped = Object.keys(usage).map(id => {
      const s = services.find((srv: any) => srv.id === id);
      return { 
        name: s?.description || "Unknown Service", 
        category: s?.category || "General",
        ...usage[id] 
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="p-4">Service Name</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Frequency</th>
              <th className="p-4 text-right">Avg Price</th>
              <th className="p-4 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {mapped.map((s: any, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">{s.name}</td>
                <td className="p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{s.category}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-teal-100">{s.count}</span>
                </td>
                <td className="p-4 text-right text-slate-500 tabular-nums font-medium">₹{(s.revenue / s.count).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="p-4 text-right font-black text-emerald-600 bg-emerald-50/20 tabular-nums">₹{s.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {mapped.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No service movement data found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProductUsage = () => {
    const usage: any = {};
    filteredInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        if (item.productId) {
          if (!usage[item.productId]) usage[item.productId] = { count: 0, revenue: 0 };
          usage[item.productId].count += item.quantity || 1;
          usage[item.productId].revenue += item.total || 0;
        }
      });
    });

    const mapped = Object.keys(usage).map(id => {
      const p = products.find((prod: any) => prod.id === id);
      return { 
        name: p?.description || "Unknown Product", 
        category: p?.category || "Retail",
        ...usage[id] 
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Units Sold</th>
              <th className="p-4 text-right">Avg Price</th>
              <th className="p-4 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {mapped.map((p: any, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">{p.name}</td>
                <td className="p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{p.category}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-indigo-100">{p.count}</span>
                </td>
                <td className="p-4 text-right text-slate-500 tabular-nums font-medium">₹{(p.revenue / p.count).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="p-4 text-right font-black text-emerald-600 bg-emerald-50/20 tabular-nums">₹{p.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {mapped.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No product movement data found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderClientReport = () => {
    const clientStats = customers.map(c => {
      let spend = 0, actualSpend = 0, discount = 0;
      let visits = 0;
      let lastVisit = null;
      let lastStaff = "-";
      let lastService = "-";
      
      const customerInvoices = filteredInvoices
        .filter(inv => inv.customerId === c.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (customerInvoices.length > 0) {
        lastVisit = customerInvoices[0].createdAt;
        visits = customerInvoices.length;
        
        const lastInv = customerInvoices[0];
        lastStaff = Array.from(new Set(lastInv.items?.map((i: any) => i.staff?.name).filter(Boolean))).join(", ") || "-";
        lastService = lastInv.items?.map((i: any) => i.service?.description || i.product?.description || i.package?.description || i.description).slice(0, 2).join(", ") + (lastInv.items?.length > 2 ? "..." : "");

        customerInvoices.forEach(inv => {
            spend += inv.total || 0;
            actualSpend += inv.totalGross || 0;
            discount += inv.totalDiscount || 0;
        });
      }
      return { ...c, spend, actualSpend, discount, visits, lastVisit, lastStaff, lastService };
    }).filter(c => c.visits > 0).sort((a,b) => b.spend - a.spend);

    const formatDate = (date: any) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="p-4">Client Name</th>
              <th className="p-4">Last Visit</th>
              <th className="p-4">Last Staff & Service</th>
              <th className="p-4 text-center">Visits</th>
              <th className="p-4 text-right">Actual</th>
              <th className="p-4 text-right text-rose-500">Disc.</th>
              <th className="p-4 text-right font-black">Paid</th>
            </tr>
          </thead>
          <tbody>
            {clientStats.map((c: any) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                    <div className="font-bold text-slate-700 capitalize">{c.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{c.phone || '-'}</div>
                </td>
                <td className="p-4 text-slate-600 tabular-nums font-medium">{formatDate(c.lastVisit)}</td>
                <td className="p-4">
                    <div className="text-xs font-bold text-teal-700">{c.lastStaff}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{c.lastService}</div>
                </td>
                <td className="p-4 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold text-[10px]">{c.visits}</span>
                </td>
                <td className="p-4 text-right text-slate-500 tabular-nums">₹{c.actualSpend.toLocaleString()}</td>
                <td className="p-4 text-right text-rose-500 tabular-nums">₹{c.discount.toLocaleString()}</td>
                <td className="p-4 text-right font-black text-rose-600 bg-rose-50/20 tabular-nums">₹{c.spend.toLocaleString()}</td>
              </tr>
            ))}
            {clientStats.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-medium">No client data found</td></tr>}
          </tbody>
        </table>
      </div>
    );
  };

  const renderServiceList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(s => (
        <div key={s.id} className="p-4 border rounded-xl flex flex-col gap-2 bg-white shadow-sm hover:border-teal-400 transition-all">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800">{s.description}</h4>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono font-bold">{s.code}</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{s.category || 'Standard'} • {s.gender || 'Unisex'}</p>
          <div className="mt-2 pt-2 border-t flex justify-between items-center font-black">
             <span>₹{s.price}</span>
             <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">+{s.gst}% GST</span>
          </div>
        </div>
      ))}
      {services.length === 0 && <div className="col-span-3 p-6 text-center text-slate-400">No services found</div>}
    </div>
  );

  const renderProductList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p.id} className="p-4 border rounded-xl flex flex-col gap-2 bg-white shadow-sm hover:border-teal-400 transition-all">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800">{p.description}</h4>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono font-bold">{p.code}</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{p.category || 'Standard'}</p>
          <div className="mt-2 pt-2 border-t flex justify-between items-center font-black">
             <span>₹{p.price}</span>
             <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">+{p.gst}% GST</span>
          </div>
        </div>
      ))}
      {products.length === 0 && <div className="col-span-3 p-6 text-center text-slate-400">No products found</div>}
    </div>
  );

  const renderActiveReport = () => {
    switch (activeReport) {
      case "Bill-Wise Sales Report": return renderBillWise();
      case "Day-Wise Sales Report": return renderDayWise();
      case "Employee Wise Sales": return renderEmployeeWise();
      case "Customer First - Employee Wise": return renderEmployeeCustomerWise();
      case "Client Report": return renderClientReport();
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar - Report Picker */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ClipboardList size={16} className="text-teal-500" />
            Report Categories
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Select a report to view</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Array.from(new Set(reports.map(r => r.category))).map(category => (
            <div key={category}>
               <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 pl-2">
                 {category}
               </h3>
               <div className="space-y-1">
                 {reports.filter(r => r.category === category).map((report, idx) => {
                    const isActive = activeReport === report.title;
                    const Icon = report.icon;
                    return (
                      <button 
                        key={idx}
                        onClick={() => setActiveReport(report.title)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-semibold
                          ${isActive 
                            ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-200 ring-1 ring-teal-500/20' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                          }`}
                      >
                         <Icon size={18} className={isActive ? 'text-teal-600' : 'text-slate-400 transition-colors group-hover:text-slate-600'} />
                         {report.title}
                      </button>
                    )
                 })}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Active Report Detail */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header toolbar */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
           <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 {activeReport}
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Date Range Picker */}
              <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-sm">
                 <div className="flex items-center gap-2 px-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
                    <div className="relative group">
                      <input 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      />
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${fromDate ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                        {fromDate ? new Date(fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "Select"}
                      </div>
                    </div>
                 </div>

                 <ArrowRight size={14} className="text-slate-300" />

                 <div className="flex items-center gap-2 px-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
                    <div className="relative group">
                      <input 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      />
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${toDate ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                        {toDate ? new Date(toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "Select"}
                      </div>
                    </div>
                 </div>

                 {(fromDate || toDate) && (
                   <button 
                     onClick={() => { setFromDate(""); setToDate(""); }}
                     className="ml-1 p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                     title="Clear Filter"
                   >
                     <X size={14} />
                   </button>
                 )}
              </div>

              <button title="Export CSV" onClick={exportToCSV} className="p-2.5 border bg-white rounded-xl text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm">
                 <Download size={18} />
              </button>
           </div>
        </div>

         {/* Report Content Body */}
         <div className="flex-1 overflow-y-auto p-6 relative">
            {!loading && (
               <div className="mb-4 flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Database Sync Active
                   </span>
                 </div>
                 <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                   Showing <span className="text-teal-600">{filteredInvoices.length}</span> out of <span className="text-teal-600 font-black">{invoices.length}</span> loaded records 
                   <span className="text-slate-400 ml-1 font-normal">(System Limit: 100)</span>
                 </div>
               </div>
            )}

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                 <div className="flex flex-col items-center gap-4">
                   <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600"></div>
                   <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-wider">Analyzing Data...</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-6">
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {renderActiveReport()}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4 pb-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => {
                        setPage(p => Math.max(1, p - 1));
                        const scrollEl = document.querySelector('.overflow-y-auto');
                        if (scrollEl) scrollEl.scrollTop = 0;
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 shadow-sm"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  
                  <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 shadow-inner">
                    Page <span className="text-teal-600 ml-1">{page}</span>
                  </div>

                  <button 
                    disabled={!hasMore}
                    onClick={() => {
                        setPage(p => p + 1);
                        const scrollEl = document.querySelector('.overflow-y-auto');
                        if (scrollEl) scrollEl.scrollTop = 0;
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 shadow-sm"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
        </div>
        
      </div>

    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
