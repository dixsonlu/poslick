import React from "react";
import { Clock, ChefHat, CheckCircle2, AlertCircle, MessageSquare, Package } from "lucide-react";
import { sampleOrders } from "@/data/mock-data";

const statusConfig: Record<string, { label: string; border: string; bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
  new: { label: "NEW", border: "border-primary", bg: "bg-status-blue-light", text: "text-primary", icon: Clock },
  preparing: { label: "PREPARING", border: "border-status-amber", bg: "bg-status-amber-light", text: "text-status-amber", icon: ChefHat },
  ready: { label: "READY", border: "border-status-green", bg: "bg-status-green-light", text: "text-status-green", icon: CheckCircle2 },
};

function getElapsedMin(firedAt?: string) {
  if (!firedAt) return 0;
  // Simulate elapsed for demo
  const fired = new Date(firedAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - fired) / 60000));
}

const AdminKDS: React.FC = () => {
  const allTickets = sampleOrders.flatMap(order =>
    order.items.filter(i => i.status !== "served").map(item => ({
      ...item,
      orderId: order.id,
      tableNumber: order.tableNumber,
      serviceMode: order.serviceMode,
      guestCount: order.guestCount,
    }))
  );

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">KDS Monitor</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{allTickets.length} active tickets</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {(["new", "preparing", "ready"] as const).map(status => {
          const config = statusConfig[status];
          const tickets = allTickets.filter(t => t.status === status);
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <config.icon className={`h-4 w-4 ${config.text}`} />
                <span className="section-label">{config.label}</span>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                  {tickets.length}
                </span>
              </div>
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const elapsed = getElapsedMin(ticket.firedAt);
                  const isUrgent = status === "new" && elapsed > 10 || status === "preparing" && elapsed > 20;
                  return (
                    <div key={ticket.id} className={`uniweb-card border-l-4 ${config.border} p-4 ${isUrgent ? "animate-pulse" : ""}`}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-[14px]">T{ticket.tableNumber}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">{ticket.serviceMode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isUrgent && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                          <span className={`text-[11px] font-bold font-mono ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                            {elapsed}m
                          </span>
                        </div>
                      </div>

                      {/* Item name + qty */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-[14px] font-semibold text-foreground leading-tight">{ticket.name}</div>
                        <span className="text-[13px] font-bold text-foreground bg-accent px-2 py-0.5 rounded-md ml-2 shrink-0">
                          ×{ticket.quantity}
                        </span>
                      </div>

                      {/* Combo items */}
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

                      {/* Modifiers */}
                      {ticket.modifiers.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {ticket.modifiers.map((m, idx) => (
                            <span key={idx} className="text-[11px] bg-accent text-foreground px-2 py-0.5 rounded-md font-medium">
                              {m.name}
                              {m.price > 0 && <span className="text-muted-foreground ml-0.5">(+${m.price.toFixed(2)})</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {ticket.notes && (
                        <div className="mt-2 flex items-start gap-1.5 bg-status-amber-light/50 rounded-md px-2.5 py-1.5">
                          <MessageSquare className="h-3 w-3 text-status-amber mt-0.5 shrink-0" />
                          <span className="text-[11px] text-foreground font-medium leading-snug">{ticket.notes}</span>
                        </div>
                      )}

                      {/* Flow progress */}
                      <div className="mt-3 flex items-center gap-1">
                        {["new", "preparing", "ready", "served"].map((step, idx) => {
                          const stepIdx = ["new", "preparing", "ready", "served"].indexOf(ticket.status);
                          const thisIdx = idx;
                          const isDone = thisIdx < stepIdx;
                          const isCurrent = thisIdx === stepIdx;
                          return (
                            <React.Fragment key={step}>
                              <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                                isDone ? "bg-status-green" : isCurrent ? config.text.replace("text-", "bg-") : "bg-border"
                              }`} />
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground">FIRED</span>
                        <span className="text-[9px] text-muted-foreground">PREP</span>
                        <span className="text-[9px] text-muted-foreground">READY</span>
                        <span className="text-[9px] text-muted-foreground">SERVED</span>
                      </div>
                    </div>
                  );
                })}
                {tickets.length === 0 && (
                  <div className="uniweb-card p-6 flex items-center justify-center">
                    <span className="text-[12px] text-muted-foreground">No tickets</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminKDS;
