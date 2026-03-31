import React, { useState } from "react";
import { Search, Phone, Mail, Star, Users, TrendingUp, AlertTriangle, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomers, getSegmentCounts, updateCustomerNotes, type EnhancedCustomer } from "@/state/customer-store";

const tierStyles: Record<string, string> = {
  bronze: "bg-status-amber-light text-status-amber",
  silver: "bg-accent text-muted-foreground",
  gold: "bg-status-amber-light text-status-amber",
  platinum: "bg-status-blue-light text-primary",
};

const segmentStyles: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-status-green-light", text: "text-status-green", label: "New" },
  regular: { bg: "bg-status-blue-light", text: "text-primary", label: "Regular" },
  vip: { bg: "bg-status-amber-light", text: "text-status-amber", label: "VIP" },
  at_risk: { bg: "bg-status-red-light", text: "text-destructive", label: "At Risk" },
};

const AdminCRM: React.FC = () => {
  const customers = useCustomers();
  const segmentCounts = getSegmentCounts();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomer | null>(null);

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderVal = customers.length ? customers.reduce((s, c) => s + c.avgOrderValue, 0) / customers.length : 0;

  const filtered = customers.filter(c => {
    if (segmentFilter !== "all" && c.segment !== segmentFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{customers.length} customers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Customers", value: customers.length, icon: Users },
          { label: "Total Revenue", value: `$${totalSpent.toLocaleString()}`, icon: TrendingUp, mono: true },
          { label: "Avg Order Value", value: `$${avgOrderVal.toFixed(2)}`, icon: Star, mono: true },
          { label: "At Risk", value: segmentCounts.at_risk, icon: AlertTriangle, danger: true },
        ].map(s => (
          <div key={s.label} className="uniweb-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className={cn("text-[28px] font-bold tracking-tighter leading-none", s.danger ? "text-destructive" : "text-foreground", s.mono && "font-mono")}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Segment Filters */}
      <div className="flex items-center gap-1 mb-6 bg-accent rounded-lg p-0.5 w-fit">
        {[{ key: "all", label: "All" }, ...Object.entries(segmentStyles).map(([k, v]) => ({ key: k, label: v.label }))].map(seg => (
          <button
            key={seg.key}
            onClick={() => setSegmentFilter(seg.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150",
              segmentFilter === seg.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {seg.label}
            {seg.key !== "all" && <span className="ml-1.5 text-[10px] opacity-70">{segmentCounts[seg.key as keyof typeof segmentCounts]}</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Customer List */}
        <div className="flex-1">
          <div className="relative w-64 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all" />
          </div>

          <div className="space-y-2">
            {filtered.map(c => {
              const seg = segmentStyles[c.segment];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={cn(
                    "uniweb-card p-4 w-full text-left transition-all duration-150 cursor-pointer",
                    selectedCustomer?.id === c.id ? "border-primary ring-2 ring-primary/10 shadow-md" : "hover:shadow-md hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-foreground">{c.name}</h3>
                      <span className={cn("status-badge text-[10px]", seg.bg, seg.text)}>{seg.label}</span>
                      <span className={cn("status-badge capitalize text-[10px]", tierStyles[c.tier])}>{c.tier}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex gap-4 text-[12px]">
                    <span><span className="font-semibold text-foreground">{c.visits}</span> <span className="text-muted-foreground">visits</span></span>
                    <span className="font-mono font-semibold text-foreground">${c.totalSpent.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-auto text-[11px]">Last: {c.lastVisit}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedCustomer && (
          <div className="w-80 shrink-0">
            <div className="uniweb-card p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-foreground">{selectedCustomer.name}</h3>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded hover:bg-accent transition-colors duration-150"><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>

              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{selectedCustomer.phone}</div>
                {selectedCustomer.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{selectedCustomer.email}</div>}
                {selectedCustomer.birthday && <div className="flex items-center gap-2 text-muted-foreground"><Star className="h-3.5 w-3.5" />Birthday: {selectedCustomer.birthday}</div>}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                <div><div className="section-label mb-1">Visits</div><div className="text-lg font-bold text-foreground">{selectedCustomer.visits}</div></div>
                <div><div className="section-label mb-1">Points</div><div className="text-lg font-bold text-foreground">{selectedCustomer.points}</div></div>
                <div><div className="section-label mb-1">Total Spent</div><div className="text-lg font-bold text-foreground font-mono">${selectedCustomer.totalSpent.toLocaleString()}</div></div>
                <div><div className="section-label mb-1">Avg Order</div><div className="text-lg font-bold text-foreground font-mono">${selectedCustomer.avgOrderValue.toFixed(2)}</div></div>
              </div>

              {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="section-label mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-accent text-[11px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCustomer.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="section-label mb-1">Notes</div>
                  <p className="text-[12px] text-muted-foreground">{selectedCustomer.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border text-[11px] text-muted-foreground">
                Member since: {selectedCustomer.joinedAt}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCRM;
