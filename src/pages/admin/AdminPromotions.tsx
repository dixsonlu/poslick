import React, { useState } from "react";
import { ArrowLeft, Calendar, ChevronRight, Copy, Gift, Plus, Search, Tag, ToggleLeft, ToggleRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---
type PromoType = "discount" | "bogo" | "gift" | "coupon" | "loyalty" | "happy_hour";
type PromoStatus = "active" | "scheduled" | "expired" | "draft";
type DiscountType = "percentage" | "fixed";

interface Promotion {
  id: string;
  name: string;
  type: PromoType;
  status: PromoStatus;
  discount?: { type: DiscountType; value: number };
  minSpend?: number;
  code?: string;
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate?: string;
  timeWindow?: string;
  weekdays?: string[];
  combinable: boolean;
  priority: number;
  gmvContribution: number;
}

// --- Mock Data ---
const mockPromos: Promotion[] = [
  {
    id: "p1", name: "Lunch Special 20% Off", type: "discount", status: "active",
    discount: { type: "percentage", value: 20 }, minSpend: 30,
    usageCount: 142, usageLimit: 500, startDate: "2026-01-01", endDate: "2026-06-30",
    timeWindow: "11:00-14:00", weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    combinable: false, priority: 1, gmvContribution: 8540,
  },
  {
    id: "p2", name: "New Customer $5 Off", type: "coupon", status: "active",
    discount: { type: "fixed", value: 5 }, code: "NEWUSER",
    usageCount: 87, usageLimit: 200, startDate: "2026-02-01",
    combinable: true, priority: 2, gmvContribution: 4350,
  },
  {
    id: "p3", name: "Weekend BOGO Drinks", type: "bogo", status: "active",
    usageCount: 63, startDate: "2026-03-01",
    weekdays: ["Sat", "Sun"], combinable: false, priority: 3, gmvContribution: 2100,
  },
  {
    id: "p4", name: "Happy Hour 30% Off", type: "happy_hour", status: "scheduled",
    discount: { type: "percentage", value: 30 }, minSpend: 20,
    usageCount: 0, startDate: "2026-04-01", endDate: "2026-04-30",
    timeWindow: "15:00-18:00", combinable: false, priority: 1, gmvContribution: 0,
  },
  {
    id: "p5", name: "VIP Member 10%", type: "loyalty", status: "active",
    discount: { type: "percentage", value: 10 },
    usageCount: 234, startDate: "2026-01-01",
    combinable: true, priority: 5, gmvContribution: 12300,
  },
  {
    id: "p6", name: "CNY Free Dessert", type: "gift", status: "expired",
    usageCount: 180, usageLimit: 200, startDate: "2026-01-25", endDate: "2026-02-10",
    combinable: true, priority: 4, gmvContribution: 5400,
  },
  {
    id: "p7", name: "IG Follower $3 Off", type: "coupon", status: "active",
    discount: { type: "fixed", value: 3 }, code: "IGFOOD",
    usageCount: 45, usageLimit: 100, startDate: "2026-03-01", endDate: "2026-05-31",
    combinable: true, priority: 6, gmvContribution: 1350,
  },
];

const typeConfig: Record<PromoType, { icon: React.ReactNode; label: string; color: string }> = {
  discount: { icon: <Tag className="h-4 w-4" />, label: "Discount", color: "text-primary bg-primary/10" },
  bogo: { icon: <Gift className="h-4 w-4" />, label: "BOGO", color: "text-status-amber bg-status-amber-light" },
  gift: { icon: <Gift className="h-4 w-4" />, label: "Free Item", color: "text-status-green bg-status-green-light" },
  coupon: { icon: <Tag className="h-4 w-4" />, label: "Coupon", color: "text-primary bg-status-blue-light" },
  loyalty: { icon: <Users className="h-4 w-4" />, label: "Loyalty", color: "text-status-amber bg-status-amber-light" },
  happy_hour: { icon: <Zap className="h-4 w-4" />, label: "Happy Hour", color: "text-primary bg-primary/10" },
};

const statusStyles: Record<PromoStatus, string> = {
  active: "bg-status-green-light text-status-green",
  scheduled: "bg-status-blue-light text-primary",
  expired: "bg-accent text-muted-foreground",
  draft: "bg-accent text-muted-foreground",
};

// --- Quick Templates ---
const templates = [
  { name: "Lunch Discount", type: "discount" as PromoType, icon: <Tag className="h-5 w-5" /> },
  { name: "Happy Hour", type: "happy_hour" as PromoType, icon: <Zap className="h-5 w-5" /> },
  { name: "New Customer", type: "coupon" as PromoType, icon: <Users className="h-5 w-5" /> },
  { name: "Free Item", type: "gift" as PromoType, icon: <Gift className="h-5 w-5" /> },
];

const AdminPromotions: React.FC = () => {
  const [promos, setPromos] = useState(mockPromos);
  const [statusFilter, setStatusFilter] = useState<PromoStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = promos.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.code?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = promos.find(p => p.id === selectedId);

  const toggleStatus = (id: string) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "active" ? "draft" as PromoStatus : "active" as PromoStatus } : p));
  };

  const totalActive = promos.filter(p => p.status === "active").length;
  const totalGMV = promos.reduce((s, p) => s + p.gmvContribution, 0);
  const totalUsage = promos.reduce((s, p) => s + p.usageCount, 0);

  // --- Detail View ---
  if (selected) {
    const cfg = typeConfig[selected.type];
    return (
      <div className="w-full p-6 lg:p-8">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[13px] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Promotions
        </button>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("p-2 rounded-lg", cfg.color)}>{cfg.icon}</span>
              <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", statusStyles[selected.status])}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
              <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", cfg.color)}>{cfg.label}</span>
              {selected.code && (
                <span className="text-[11px] font-mono font-bold bg-accent text-foreground px-2.5 py-1 rounded-full">{selected.code}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleStatus(selected.id)} className="gap-1.5 text-[12px]">
              {selected.status === "active" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
              {selected.status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground font-medium mb-1">Total Usage</div>
            <div className="text-2xl font-bold text-foreground">{selected.usageCount}</div>
            {selected.usageLimit && <div className="text-[11px] text-muted-foreground mt-1">of {selected.usageLimit} limit</div>}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground font-medium mb-1">GMV Contribution</div>
            <div className="text-2xl font-bold text-foreground">${selected.gmvContribution.toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground font-medium mb-1">Priority</div>
            <div className="text-2xl font-bold text-foreground">#{selected.priority}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{selected.combinable ? "Combinable" : "Exclusive"}</div>
          </div>
        </div>

        {/* Configuration details */}
        <div className="space-y-6 max-w-6xl">
          {/* Trigger */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-foreground mb-4">Trigger Conditions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {selected.minSpend !== undefined && (
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Min. Spend</div>
                  <div className="text-[14px] font-semibold text-foreground">${selected.minSpend}</div>
                </div>
              )}
              {selected.timeWindow && (
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Time Window</div>
                  <div className="text-[14px] font-semibold text-foreground">{selected.timeWindow}</div>
                </div>
              )}
              {selected.weekdays && (
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Days</div>
                  <div className="flex gap-1 flex-wrap">
                    {selected.weekdays.map(d => (
                      <span key={d} className="text-[11px] bg-accent text-foreground px-2 py-0.5 rounded-md font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Validity</div>
                <div className="text-[14px] font-semibold text-foreground">
                  {selected.startDate}{selected.endDate ? ` → ${selected.endDate}` : " → Ongoing"}
                </div>
              </div>
            </div>
          </div>

          {/* Reward */}
          {selected.discount && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-[13px] font-bold text-foreground mb-4">Reward</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selected.discount.type === "percentage" ? `${selected.discount.value}%` : `$${selected.discount.value}`}
                  </span>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">
                    {selected.discount.type === "percentage" ? `${selected.discount.value}% Off` : `$${selected.discount.value} Off`}
                  </div>
                  <div className="text-[12px] text-muted-foreground">Applied to order subtotal</div>
                </div>
              </div>
            </div>
          )}

          {/* Stacking */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-foreground mb-4">Stacking Rules</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Combinable</div>
                <div className="text-[14px] font-semibold text-foreground">{selected.combinable ? "Yes" : "No (Exclusive)"}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Priority</div>
                <div className="text-[14px] font-semibold text-foreground">{selected.priority}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="w-full p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Promotions</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage discounts, promo codes, and marketing campaigns</p>
        </div>
        <Button className="gap-2 text-[13px]">
          <Plus className="h-4 w-4" /> Create Promotion
        </Button>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Active Promotions</div>
          <div className="text-2xl font-bold text-foreground">{totalActive}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Total Redemptions</div>
          <div className="text-2xl font-bold text-foreground">{totalUsage.toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">GMV Contribution</div>
          <div className="text-2xl font-bold text-foreground">${totalGMV.toLocaleString()}</div>
        </div>
      </div>

      {/* Quick templates */}
      <div className="mb-6">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Create</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {templates.map(tpl => (
            <button key={tpl.name} className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.98] group">
              <div className={cn("p-2 rounded-lg w-fit mb-2", typeConfig[tpl.type].color)}>{tpl.icon}</div>
              <div className="text-[13px] font-semibold text-foreground">{tpl.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Use template</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search promotions..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="overflow-x-auto pos-scrollbar">
          <div className="flex min-w-max gap-1.5">
          {(["all", "active", "scheduled", "expired", "draft"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors min-h-[36px]",
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-accent/30">
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Promotion</th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Discount</th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Usage</th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">GMV</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(promo => {
              const cfg = typeConfig[promo.type];
              return (
                <tr key={promo.id}
                  onClick={() => setSelectedId(promo.id)}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-semibold text-foreground">{promo.name}</div>
                    {promo.code && <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{promo.code}</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md", cfg.color)}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-foreground font-mono">
                    {promo.discount ? (promo.discount.type === "percentage" ? `${promo.discount.value}%` : `$${promo.discount.value}`) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-medium text-foreground">{promo.usageCount}</div>
                    {promo.usageLimit && (
                      <div className="w-16 h-1.5 bg-accent rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (promo.usageCount / promo.usageLimit) * 100)}%` }} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", statusStyles[promo.status])}>
                      {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-foreground font-mono">
                    ${promo.gmvContribution.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-muted-foreground">No promotions found</div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
