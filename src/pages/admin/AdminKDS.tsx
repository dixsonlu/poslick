import React, { useState, useEffect, useCallback } from "react";
import { Clock, ChefHat, CheckCircle2, AlertCircle, MessageSquare, Package, XCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleOrders, type OrderItem, type KDSStatus } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface KDSTicket extends OrderItem {
  orderId: string;
  tableNumber?: string;
  serviceMode: string;
  guestCount: number;
  startedAt?: string; // when chef tapped "start"
  cancelledAt?: string;
  cancelReason?: string;
}

function getElapsedMin(firedAt?: string) {
  if (!firedAt) return 0;
  const fired = new Date(firedAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - fired) / 60000));
}

function getTimeColor(elapsed: number, status: KDSStatus): { bg: string; text: string; label: string } {
  if (status === "ready" || status === "served") return { bg: "bg-status-green-light", text: "text-status-green", label: "READY" };
  if (elapsed <= 5) return { bg: "bg-status-green-light", text: "text-status-green", label: "ON TIME" };
  if (elapsed <= 10) return { bg: "bg-status-amber-light", text: "text-status-amber", label: "MONITOR" };
  return { bg: "bg-status-red-light", text: "text-destructive", label: "URGENT" };
}

const AdminKDS: React.FC = () => {
  const [tickets, setTickets] = useState<KDSTicket[]>(() =>
    sampleOrders.flatMap(order =>
      order.items.filter(i => i.status !== "served").map(item => ({
        ...item,
        orderId: order.id,
        tableNumber: order.tableNumber,
        serviceMode: order.serviceMode,
        guestCount: order.guestCount,
      }))
    )
  );
  const [, setTick] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Tick every 30s to update elapsed times
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = useCallback((id: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: "preparing" as KDSStatus, startedAt: new Date().toISOString() } : t
    ));
  }, []);

  const handleReady = useCallback((id: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: "ready" as KDSStatus } : t
    ));
  }, []);

  const handleCancel = useCallback((id: string, reason: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, cancelledAt: new Date().toISOString(), cancelReason: reason } : t
    ));
    setCancellingId(null);
  }, []);

  const activeTickets = tickets.filter(t => !t.cancelledAt);
  const cancelledTickets = tickets.filter(t => t.cancelledAt);

  const columns: { status: KDSStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
    { status: "new", label: "NEW", icon: Clock },
    { status: "preparing", label: "PREPARING", icon: ChefHat },
    { status: "ready", label: "READY", icon: CheckCircle2 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">KDS Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeTickets.length} active tickets · {cancelledTickets.length} cancelled</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-status-green" /> ≤5m
            <span className="w-2.5 h-2.5 rounded-full bg-status-amber ml-2" /> 5-10m
            <span className="w-2.5 h-2.5 rounded-full bg-destructive ml-2" /> &gt;10m
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={() => setCancellingId(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">Cancel Order Item</h3>
            <p className="text-[13px] text-muted-foreground mb-4">This will notify the kitchen immediately. Select reason:</p>
            <div className="space-y-2">
              {["Customer cancelled", "Out of stock", "Kitchen error", "Duplicate order"].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleCancel(cancellingId, reason)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/5 text-[13px] font-medium text-foreground transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-muted-foreground" onClick={() => setCancellingId(null)}>
              Go Back
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {columns.map(col => {
          const colTickets = activeTickets.filter(t => t.status === col.status);
          return (
            <div key={col.status}>
              <div className="flex items-center gap-2 mb-3">
                <col.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{col.label}</span>
                <span className="ml-auto status-badge bg-accent text-muted-foreground">
                  {colTickets.length}
                </span>
              </div>
              <div className="space-y-3">
                {colTickets.map(ticket => {
                  const elapsed = getElapsedMin(ticket.firedAt);
                  const timeColor = getTimeColor(elapsed, ticket.status);
                  return (
                    <div key={ticket.id} className={cn(
                      "uniweb-card p-4 border-l-[3px] transition-all",
                      elapsed > 10 && ticket.status !== "ready" ? "border-l-destructive" : elapsed > 5 && ticket.status !== "ready" ? "border-l-status-amber" : "border-l-status-green"
                    )}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-[14px]">T{ticket.tableNumber}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">{ticket.serviceMode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", timeColor.bg, timeColor.text)}>
                            {timeColor.label}
                          </span>
                          <span className={cn("text-[11px] font-bold font-mono", elapsed > 10 ? "text-destructive" : elapsed > 5 ? "text-status-amber" : "text-muted-foreground")}>
                            {elapsed}m
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between mb-1">
                        <div className="text-[14px] font-semibold text-foreground leading-tight">{ticket.name}</div>
                        <span className="text-[13px] font-bold text-foreground bg-accent px-2 py-0.5 rounded-full ml-2 shrink-0">
                          ×{ticket.quantity}
                        </span>
                      </div>

                      {ticket.comboItems && ticket.comboItems.length > 0 && (
                        <div className="mt-2 mb-1 pl-2 border-l-2 border-primary/20 space-y-0.5">
                          <div className="flex items-center gap-1 mb-1">
                            <Package className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Combo</span>
                          </div>
                          {ticket.comboItems.map((ci, idx) => (
                            <div key={idx} className="text-[12px] text-foreground">
                              <span className="text-muted-foreground">{ci.groupName}:</span>{" "}
                              <span className="font-medium">{ci.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ticket.modifiers.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {ticket.modifiers.map((m, idx) => (
                            <span key={idx} className="text-[11px] bg-accent text-foreground px-2 py-0.5 rounded-full font-medium">
                              {m.name}
                              {m.price > 0 && <span className="text-muted-foreground ml-0.5">(+${m.price.toFixed(2)})</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {ticket.notes && (
                        <div className="mt-2 flex items-start gap-1.5 bg-status-amber-light rounded-lg px-2.5 py-1.5">
                          <MessageSquare className="h-3 w-3 text-status-amber mt-0.5 shrink-0" />
                          <span className="text-[11px] text-foreground font-medium leading-snug">{ticket.notes}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3 flex gap-1.5">
                        {ticket.status === "new" && (
                          <Button size="sm" className="flex-1 h-8 text-[11px] rounded-lg gap-1" onClick={() => handleStart(ticket.id)}>
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        )}
                        {ticket.status === "preparing" && (
                          <Button size="sm" className="flex-1 h-8 text-[11px] rounded-lg gap-1 bg-status-green hover:bg-status-green/90 text-white" onClick={() => handleReady(ticket.id)}>
                            <CheckCircle2 className="h-3 w-3" /> Ready
                          </Button>
                        )}
                        {ticket.status !== "ready" && (
                          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-lg gap-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setCancellingId(ticket.id)}>
                            <XCircle className="h-3 w-3" /> Cancel
                          </Button>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-1">
                        {["new", "preparing", "ready", "served"].map((step, idx) => {
                          const stepIdx = ["new", "preparing", "ready", "served"].indexOf(ticket.status);
                          const isDone = idx < stepIdx;
                          const isCurrent = idx === stepIdx;
                          return (
                            <div key={step} className={cn(
                              "h-1.5 flex-1 rounded-full transition-colors",
                              isDone ? "bg-status-green" : isCurrent
                                ? elapsed > 10 ? "bg-destructive" : elapsed > 5 ? "bg-status-amber" : "bg-status-green"
                                : "bg-border"
                            )} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {colTickets.length === 0 && (
                  <div className="uniweb-card p-6 flex items-center justify-center">
                    <span className="text-[12px] text-muted-foreground">No tickets</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled tickets log */}
      {cancelledTickets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Cancelled Items ({cancelledTickets.length})
          </h2>
          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th>Item</th><th>Table</th><th>Reason</th><th>Cancelled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cancelledTickets.map(t => (
                  <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-foreground">{t.name} ×{t.quantity}</td>
                    <td className="px-4 py-2.5 text-[13px] text-muted-foreground">T{t.tableNumber}</td>
                    <td className="px-4 py-2.5"><span className="status-badge bg-destructive/10 text-destructive">{t.cancelReason}</span></td>
                    <td className="px-4 py-2.5 text-[12px] text-muted-foreground font-mono">{t.cancelledAt ? new Date(t.cancelledAt).toLocaleTimeString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKDS;
