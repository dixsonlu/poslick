import React, { useState } from "react";
import { AlertTriangle, ArrowLeft, Calendar, ChevronRight, Clock, Copy, Gift, Plus, Search, Tag, ToggleLeft, ToggleRight, Trash2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { categories } from "@/data/mock-data";
import {
  usePricingStrategies,
  addPricingStrategy,
  updatePricingStrategy,
  deletePricingStrategy,
  detectConflicts,
  type PricingStrategy,
} from "@/state/pricing-store";

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
  const [activeMainTab, setActiveMainTab] = useState("promotions");
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
          <h1 className="text-xl font-bold text-foreground">Promotions & Pricing</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage discounts, campaigns, and dynamic pricing strategies</p>
        </div>
        <Button className="gap-1.5 text-[13px] rounded-lg">
          <Plus className="h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <div className="mb-5 flex items-center gap-4">
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="promotions" className="text-[13px] rounded-md gap-1.5">
              <Tag className="h-3.5 w-3.5" />Promotions
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-[13px] rounded-md gap-1.5">
              <Clock className="h-3.5 w-3.5" />Dynamic Pricing
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="promotions">
          <PromotionsListView
            promos={promos}
            filtered={filtered}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            search={search}
            setSearch={setSearch}
            totalActive={totalActive}
            totalGMV={totalGMV}
            totalUsage={totalUsage}
            toggleStatus={toggleStatus}
            setSelectedId={setSelectedId}
          />
        </TabsContent>

        <TabsContent value="pricing">
          <DynamicPricingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ========== Promotions List View (extracted) ==========
const PromotionsListView: React.FC<{
  promos: Promotion[];
  filtered: Promotion[];
  statusFilter: PromoStatus | "all";
  setStatusFilter: (v: PromoStatus | "all") => void;
  search: string;
  setSearch: (v: string) => void;
  totalActive: number;
  totalGMV: number;
  totalUsage: number;
  toggleStatus: (id: string) => void;
  setSelectedId: (id: string) => void;
}> = ({ filtered, statusFilter, setStatusFilter, search, setSearch, totalActive, totalGMV, totalUsage, toggleStatus, setSelectedId }) => (
  <>
    {/* KPI cards */}
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <div className="uniweb-card relative overflow-hidden p-5">
        <div className="kpi-stripe bg-status-green" />
        <div className="section-label mt-1.5 mb-2">Active Campaigns</div>
        <div className="text-2xl font-bold text-foreground">{totalActive}</div>
      </div>
      <div className="uniweb-card relative overflow-hidden p-5">
        <div className="kpi-stripe bg-primary" />
        <div className="section-label mt-1.5 mb-2">Total GMV</div>
        <div className="text-2xl font-bold text-foreground">${totalGMV.toLocaleString()}</div>
      </div>
      <div className="uniweb-card relative overflow-hidden p-5">
        <div className="kpi-stripe bg-status-amber" />
        <div className="section-label mt-1.5 mb-2">Total Usage</div>
        <div className="text-2xl font-bold text-foreground">{totalUsage}</div>
      </div>
    </div>

    {/* Quick Create templates */}
    <div className="mb-6">
      <div className="section-label mb-3">Quick Create</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map(tmpl => {
          const cfg = typeConfig[tmpl.type];
          return (
            <button
              key={tmpl.name}
              className="uniweb-card p-4 text-left hover:border-primary/40 transition-colors group"
            >
              <span className={cn("inline-flex p-2 rounded-lg mb-2", cfg.color)}>{tmpl.icon}</span>
              <div className="text-[13px] font-semibold text-foreground">{tmpl.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Create from template</div>
            </button>
          );
        })}
      </div>
    </div>

    {/* Filters */}
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex gap-1 bg-accent rounded-lg p-0.5">
        {(["all", "active", "scheduled", "expired", "draft"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors capitalize",
              statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="relative ml-auto w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search promotions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
        />
      </div>
    </div>

    {/* Promotions Table */}
    <div className="uniweb-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="w-8" />
              <th>Campaign</th>
              <th>Type</th>
              <th>Status</th>
              <th>Usage</th>
              <th className="text-right">GMV</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(promo => {
              const cfg = typeConfig[promo.type];
              return (
                <tr
                  key={promo.id}
                  className="table-row border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(promo.id)}
                >
                  <td className="px-4 py-3.5">
                    <button
                      onClick={e => { e.stopPropagation(); toggleStatus(promo.id); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {promo.status === "active" ? <ToggleRight className="h-4 w-4 text-status-green" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-semibold text-foreground">{promo.name}</div>
                    {promo.code && <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{promo.code}</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", cfg.color)}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", statusStyles[promo.status])}>
                      {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-foreground font-mono">
                    {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ""}
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
  </>
);

// ========== Dynamic Pricing Tab ==========
const ALL_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pricingCategories = ["All", ...categories.filter(c => c !== "All" && c !== "Combos" && c !== "Popular")];

const emptyStrategy = (): PricingStrategy => ({
  id: `ps-${Date.now()}`,
  name: "",
  enabled: true,
  priority: 1,
  discountType: "percentage",
  discountValue: 10,
  targetCategories: ["All"],
  targetItemIds: [],
  timeStart: "15:00",
  timeEnd: "17:00",
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  combinable: false,
});

const DynamicPricingTab: React.FC = () => {
  const strategies = usePricingStrategies();
  const conflicts = detectConflicts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PricingStrategy | null>(null);

  const startCreate = () => {
    const s = emptyStrategy();
    setDraft(s);
    setEditingId(null);
  };

  const startEdit = (s: PricingStrategy) => {
    setDraft({ ...s });
    setEditingId(s.id);
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditingId(null);
  };

  const saveDraft = () => {
    if (!draft || !draft.name.trim()) return;
    if (editingId) {
      updatePricingStrategy(editingId, draft);
    } else {
      addPricingStrategy(draft);
    }
    setDraft(null);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deletePricingStrategy(id);
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="space-y-6">
      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-status-amber/30 bg-status-amber-light p-4 space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-status-amber">
            <AlertTriangle className="h-4 w-4" />
            Scheduling Conflicts Detected
          </div>
          {conflicts.map((c, i) => (
            <div key={i} className="text-[12px] text-foreground">
              <strong>{c.strategy1}</strong> ↔ <strong>{c.strategy2}</strong>: {c.reason}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Strategy list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Pricing Rules ({strategies.length})
            </div>
            <Button size="sm" className="gap-1.5 text-[12px]" onClick={startCreate}>
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </Button>
          </div>

          {strategies.map(s => (
            <div
              key={s.id}
              className={cn(
                "rounded-xl border-[1.5px] bg-card p-4 transition-all cursor-pointer",
                editingId === s.id ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/30"
              )}
              onClick={() => startEdit(s)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-foreground">{s.name}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    s.enabled ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground"
                  )}>
                    {s.enabled ? "Active" : "Disabled"}
                  </span>
                  {!s.combinable && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-status-amber-light text-status-amber">Exclusive</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); updatePricingStrategy(s.id, { enabled: !s.enabled }); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {s.enabled ? <ToggleRight className="h-4 w-4 text-status-green" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary font-mono">
                  {s.discountType === "percentage" ? `${s.discountValue}% OFF` : `$${s.discountValue} OFF`}
                </span>
                <span>·</span>
                <span>{s.targetCategories.join(", ")}</span>
                <span>·</span>
                <span className="font-mono">{s.timeStart} – {s.timeEnd}</span>
                <span>·</span>
                <span>{s.weekdays.join(", ")}</span>
              </div>
            </div>
          ))}

          {strategies.length === 0 && (
            <div className="py-12 text-center text-[13px] text-muted-foreground rounded-xl border border-dashed border-border">
              No pricing strategies yet. Click "Add Rule" to create one.
            </div>
          )}
        </div>

        {/* Editor panel */}
        {draft && (
          <div className="h-fit rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {editingId ? "Edit Pricing Rule" : "Create Pricing Rule"}
              </div>
              <div className="mt-1 text-[16px] font-bold text-foreground">
                {draft.name || "New Rule"}
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 max-h-[calc(100vh-320px)] overflow-y-auto pos-scrollbar">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Rule Name</label>
                <input
                  value={draft.name}
                  onChange={e => setDraft(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  placeholder="e.g. Happy Hour 50% Off Drinks"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Discount</label>
                <div className="flex gap-2">
                  <div className="flex gap-1 bg-accent rounded-lg p-0.5">
                    <button
                      onClick={() => setDraft(prev => prev ? { ...prev, discountType: "percentage" } : prev)}
                      className={cn("px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                        draft.discountType === "percentage" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >%</button>
                    <button
                      onClick={() => setDraft(prev => prev ? { ...prev, discountType: "fixed" } : prev)}
                      className={cn("px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                        draft.discountType === "fixed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >$</button>
                  </div>
                  <input
                    type="number"
                    value={draft.discountValue}
                    onChange={e => setDraft(prev => prev ? { ...prev, discountValue: parseFloat(e.target.value) || 0 } : prev)}
                    className="h-10 w-24 rounded-xl border border-border bg-background px-3 text-[13px] font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Target Categories */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Target Categories</label>
                <div className="flex flex-wrap gap-1.5">
                  {pricingCategories.map(cat => {
                    const isActive = draft.targetCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setDraft(prev => {
                            if (!prev) return prev;
                            if (cat === "All") return { ...prev, targetCategories: isActive ? [] : ["All"] };
                            const filtered = prev.targetCategories.filter(c => c !== "All" && c !== cat);
                            return { ...prev, targetCategories: isActive ? filtered : [...filtered, cat] };
                          });
                        }}
                        className={cn(
                          "px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                          isActive ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time window */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Time Window</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={draft.timeStart}
                    onChange={e => setDraft(prev => prev ? { ...prev, timeStart: e.target.value } : prev)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-muted-foreground text-[13px]">to</span>
                  <input
                    type="time"
                    value={draft.timeEnd}
                    onChange={e => setDraft(prev => prev ? { ...prev, timeEnd: e.target.value } : prev)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Weekdays */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Days</label>
                <div className="flex gap-1.5">
                  {ALL_WEEKDAYS.map(day => {
                    const isActive = draft.weekdays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => setDraft(prev => {
                          if (!prev) return prev;
                          return { ...prev, weekdays: isActive ? prev.weekdays.filter(d => d !== day) : [...prev.weekdays, day] };
                        })}
                        className={cn(
                          "w-10 h-10 rounded-lg text-[11px] font-bold transition-colors",
                          isActive ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority & combinability */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={draft.priority}
                    onChange={e => setDraft(prev => prev ? { ...prev, priority: parseInt(e.target.value) || 1 } : prev)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">Lower = higher priority</span>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Combinable</label>
                  <button
                    onClick={() => setDraft(prev => prev ? { ...prev, combinable: !prev.combinable } : prev)}
                    className={cn(
                      "w-full h-10 rounded-xl border text-[13px] font-medium transition-colors",
                      draft.combinable
                        ? "border-status-green bg-status-green-light text-status-green"
                        : "border-status-amber bg-status-amber-light text-status-amber"
                    )}
                  >
                    {draft.combinable ? "Can stack with others" : "Exclusive (no stacking)"}
                  </button>
                </div>
              </div>

              {/* Date range */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Validity Period (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draft.dateStart || ""}
                    onChange={e => setDraft(prev => prev ? { ...prev, dateStart: e.target.value || undefined } : prev)}
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-muted-foreground text-[13px]">to</span>
                  <input
                    type="date"
                    value={draft.dateEnd || ""}
                    onChange={e => setDraft(prev => prev ? { ...prev, dateEnd: e.target.value || undefined } : prev)}
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <Button variant="outline" size="sm" className="text-[12px]" onClick={cancelEdit}>Cancel</Button>
              <Button size="sm" className="gap-1.5 text-[12px]" onClick={saveDraft} disabled={!draft.name.trim()}>
                <Zap className="h-3.5 w-3.5" /> {editingId ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
