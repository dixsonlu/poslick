import React, { useState } from "react";
import { Search, Package, AlertTriangle, TrendingUp, DollarSign, Plus, Minus, Ban, Zap, ArrowUpDown, BarChart3, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useInventory, usePurchaseOrders, useMovements, adjustStock, toggleSoldOut, getInventoryAlerts, getDailyCOGS, type SupplierPrice } from "@/state/inventory-store";

const AdminInventory: React.FC = () => {
  const inventory = useInventory();
  const purchaseOrders = usePurchaseOrders();
  const movements = useMovements();
  const [search, setSearch] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [comparingId, setComparingId] = useState<string | null>(null);

  const alerts = getInventoryAlerts();
  const cogs = getDailyCOGS();
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;
  const overstockCount = inventory.filter(i => i.currentStock >= i.maxStock * 0.9).length;
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);
  const totalItems = inventory.length;

  const filtered = inventory.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.nameZh?.includes(q) || i.category.toLowerCase().includes(q);
  });

  const handleAdjust = (id: string) => {
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty === 0) return;
    adjustStock(id, qty, adjustNote || undefined);
    setAdjustingId(null);
    setAdjustQty("");
    setAdjustNote("");
  };

  const comparingItem = comparingId ? inventory.find(i => i.id === comparingId) : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalItems} items tracked</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {[
          { label: "Total Items", value: totalItems, icon: Package },
          { label: "Low Stock", value: lowStockCount, icon: AlertTriangle, danger: true },
          { label: "Overstock", value: overstockCount, icon: TrendingUp, warn: true },
          { label: "Stock Value", value: `$${totalValue.toFixed(0)}`, icon: DollarSign, mono: true },
          { label: "Daily COGS", value: `$${cogs.totalCOGS.toFixed(0)}`, icon: BarChart3, mono: true, sub: `${cogs.cogsPercent}% of rev` },
        ].map(s => (
          <div key={s.label} className="uniweb-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className={cn("text-[28px] font-bold tracking-tighter leading-none", s.danger ? "text-destructive" : s.warn ? "text-status-amber" : "text-foreground", s.mono && "font-mono")}>{s.value}</div>
            {s.sub && <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Inventory-Driven Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-status-amber" />
            <span className="text-[13px] font-bold text-foreground">Smart Alerts</span>
          </div>
          {alerts.slice(0, 4).map(alert => (
            <div key={alert.id} className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              alert.type === "low_stock" ? "bg-destructive/5 border-destructive/20" : "bg-status-amber-light border-status-amber/20"
            )}>
              {alert.type === "low_stock" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0" /> : <Zap className="h-4 w-4 text-status-amber shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-foreground">{alert.message}</div>
                {alert.suggestedAction && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">💡 {alert.suggestedAction}</div>
                )}
              </div>
              {alert.type === "low_stock" && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive border-destructive/30" onClick={() => toggleSoldOut(alert.itemId)}>
                  <Ban className="h-3 w-3 mr-1" /> Mark Sold Out
                </Button>
              )}
              {alert.type === "overstock" && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] text-status-amber border-status-amber/30">
                  <Zap className="h-3 w-3 mr-1" /> Suggest Promo
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supplier Price Comparison Modal */}
      {comparingItem && comparingItem.supplierPrices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={() => setComparingId(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">Supplier Comparison</h3>
            <p className="text-[13px] text-muted-foreground mb-4">{comparingItem.name} ({comparingItem.unit})</p>
            <div className="space-y-2">
              {comparingItem.supplierPrices
                .sort((a, b) => a.unitCost - b.unitCost)
                .map((sp, idx) => {
                  const cheapest = idx === 0;
                  return (
                    <div key={sp.supplier} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      cheapest ? "border-status-green bg-status-green-light/50" : "border-border"
                    )}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{sp.supplier}</span>
                          {cheapest && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-status-green text-white">BEST PRICE</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Lead: {sp.leadTimeDays}d · Min order: {sp.minOrderQty} {comparingItem.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-[16px] font-bold font-mono", cheapest ? "text-status-green" : "text-foreground")}>
                          ${sp.unitCost.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">per {comparingItem.unit}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-muted-foreground" onClick={() => setComparingId(null)}>Close</Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock">Stock List</TabsTrigger>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="log">Movement Log</TabsTrigger>
          <TabsTrigger value="cogs">COGS Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="relative w-72 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all" />
          </div>

          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead className="table-header"><tr>
                <th>Item</th><th>Category</th><th>Stock Level</th><th>Unit</th><th>Cost</th><th>Supplier</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const stockPct = Math.min(100, (item.currentStock / item.maxStock) * 100);
                  const isLow = item.currentStock <= item.minStock;
                  const isOver = item.currentStock >= item.maxStock * 0.9;
                  return (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground text-[13px]">{item.name}</div>
                        {item.nameZh && <div className="text-[11px] text-muted-foreground">{item.nameZh}</div>}
                      </td>
                      <td className="px-4 py-3"><span className="status-badge bg-accent text-muted-foreground">{item.category}</span></td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", isLow ? "bg-destructive" : isOver ? "bg-status-amber" : stockPct > 70 ? "bg-status-green" : "bg-status-amber")} style={{ width: `${stockPct}%` }} />
                          </div>
                          <span className={cn("text-[12px] font-mono font-semibold min-w-[40px] text-right", isLow ? "text-destructive" : "text-foreground")}>
                            {item.currentStock}
                          </span>
                        </div>
                        {isLow && <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5"><AlertTriangle className="h-3 w-3" />Below min ({item.minStock})</div>}
                        {isOver && <div className="flex items-center gap-1 text-[10px] text-status-amber mt-0.5"><TrendingUp className="h-3 w-3" />Near max ({item.maxStock})</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[13px]">{item.unit}</td>
                      <td className="px-4 py-3 font-mono text-[13px]">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="text-muted-foreground text-[12px]">{item.supplier || "—"}</div>
                        {item.supplierPrices && item.supplierPrices.length > 1 && (
                          <button onClick={() => setComparingId(item.id)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-0.5">
                            <ArrowUpDown className="h-3 w-3" /> Compare {item.supplierPrices.length} suppliers
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.soldOut ? (
                          <button onClick={() => toggleSoldOut(item.id)} className="status-badge bg-destructive/10 text-destructive cursor-pointer hover:bg-destructive/20 transition-colors">
                            <Ban className="h-3 w-3 mr-0.5" /> Sold Out
                          </button>
                        ) : (
                          <span className="status-badge bg-status-green-light text-status-green">In Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {adjustingId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="+/-" className="w-16 h-8 px-2 rounded-lg border border-border text-[12px] text-center bg-background" />
                            <Button size="sm" variant="default" onClick={() => handleAdjust(item.id)} className="h-8 text-[11px]">OK</Button>
                            <Button size="sm" variant="ghost" onClick={() => setAdjustingId(null)} className="h-8 text-[11px]">✕</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setAdjustingId(item.id)} className="h-8 text-[11px]">Adjust</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="po">
          <div className="space-y-3">
            {purchaseOrders.map(po => (
              <div key={po.id} className="uniweb-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-foreground text-[13px]">{po.supplier}</span>
                    <span className="ml-2 mono text-muted-foreground">#{po.id}</span>
                  </div>
                  <span className={cn("status-badge", po.status === "submitted" ? "bg-status-blue-light text-primary" : po.status === "received" ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground")}>{po.status}</span>
                </div>
                <div className="text-[12px] text-muted-foreground">{po.items.length} items · <span className="font-mono font-semibold text-foreground">${po.total.toFixed(2)}</span></div>
                <div className="text-[11px] text-muted-foreground mt-1">Created: {po.createdAt}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log">
          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead className="table-header"><tr>
                <th>Time</th><th>Item</th><th>Type</th><th>Qty</th><th>Note</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {movements.map(mv => (
                  <tr key={mv.id} className="hover:bg-muted/50 transition-colors duration-150">
                    <td className="px-4 py-3 mono text-muted-foreground">{new Date(mv.timestamp).toLocaleString("en-SG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 font-semibold text-foreground text-[13px]">{mv.itemName}</td>
                    <td className="px-4 py-3"><span className={cn("status-badge", mv.type === "restock" ? "bg-status-green-light text-status-green" : mv.type === "waste" ? "bg-status-red-light text-status-red" : "bg-accent text-muted-foreground")}>{mv.type}</span></td>
                    <td className={cn("px-4 py-3 font-mono font-semibold text-[13px]", mv.quantity > 0 ? "text-status-green" : "text-destructive")}>{mv.quantity > 0 ? "+" : ""}{mv.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">{mv.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="cogs">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="uniweb-card p-5">
              <div className="section-label mb-2">Daily COGS</div>
              <div className="text-[28px] font-bold text-foreground tracking-tighter font-mono">${cogs.totalCOGS.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Based on avg daily usage</div>
            </div>
            <div className="uniweb-card p-5">
              <div className="section-label mb-2">COGS %</div>
              <div className={cn("text-[28px] font-bold tracking-tighter font-mono", cogs.cogsPercent > 35 ? "text-destructive" : cogs.cogsPercent > 30 ? "text-status-amber" : "text-status-green")}>{cogs.cogsPercent}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Target: &lt;30%</div>
            </div>
            <div className="uniweb-card p-5">
              <div className="section-label mb-2">Est. Daily Revenue</div>
              <div className="text-[28px] font-bold text-foreground tracking-tighter font-mono">$16,235</div>
              <div className="text-[11px] text-muted-foreground mt-1">30-day average</div>
            </div>
          </div>

          <div className="uniweb-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-[13px] font-bold text-foreground">Daily Cost Breakdown by Ingredient</h3>
            </div>
            <table className="w-full">
              <thead className="table-header"><tr>
                <th>Ingredient</th><th>Avg Daily Usage</th><th>Unit Cost</th><th>Daily Cost</th><th>% of COGS</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {cogs.breakdown.map(item => {
                  const inv = inventory.find(i => i.name === item.name);
                  const pctOfCogs = Math.round(item.dailyCost / cogs.totalCOGS * 10000) / 100;
                  return (
                    <tr key={item.name} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2.5 text-[13px] font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground font-mono">{inv?.dailyUsageAvg} {inv?.unit}/day</td>
                      <td className="px-4 py-2.5 text-[13px] font-mono">${inv?.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-[13px] font-mono font-semibold text-foreground">${item.dailyCost.toFixed(2)}</td>
                      <td className="px-4 py-2.5 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, pctOfCogs)}%` }} />
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">{pctOfCogs}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventory;
