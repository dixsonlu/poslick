import React, { useState } from "react";
import { Search, Package, AlertTriangle, TrendingUp, DollarSign, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useInventory, usePurchaseOrders, useMovements, adjustStock } from "@/state/inventory-store";

const AdminInventory: React.FC = () => {
  const inventory = useInventory();
  const purchaseOrders = usePurchaseOrders();
  const movements = useMovements();
  const [search, setSearch] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalItems} items tracked</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Items", value: totalItems, icon: Package },
          { label: "Low Stock", value: lowStockCount, icon: AlertTriangle, danger: true },
          { label: "Stock Value", value: `$${totalValue.toFixed(0)}`, icon: DollarSign, mono: true },
          { label: "Active POs", value: purchaseOrders.filter(p => p.status === "submitted").length, icon: TrendingUp },
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

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock">Stock List</TabsTrigger>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="log">Movement Log</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="relative w-72 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all" />
          </div>

          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead className="table-header"><tr>
                <th>Item</th><th>Category</th><th>Stock Level</th><th>Unit</th><th>Cost</th><th>Supplier</th><th>Action</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const stockPct = Math.min(100, (item.currentStock / item.maxStock) * 100);
                  const isLow = item.currentStock <= item.minStock;
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
                            <div className={cn("h-full rounded-full transition-all", isLow ? "bg-destructive" : stockPct > 70 ? "bg-status-green" : "bg-status-amber")} style={{ width: `${stockPct}%` }} />
                          </div>
                          <span className={cn("text-[12px] font-mono font-semibold min-w-[40px] text-right", isLow ? "text-destructive" : "text-foreground")}>
                            {item.currentStock}
                          </span>
                        </div>
                        {isLow && <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5"><AlertTriangle className="h-3 w-3" />Below min ({item.minStock})</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[13px]">{item.unit}</td>
                      <td className="px-4 py-3 font-mono text-[13px]">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">{item.supplier || "—"}</td>
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
      </Tabs>
    </div>
  );
};

export default AdminInventory;
