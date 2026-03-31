import React, { useState } from "react";
import { Users, Clock, Phone, Plus, ChevronRight, Check, X, Bell, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueue, addToQueue, callNext, seatEntry, markNoShow, removeFromQueue, getWaitingCount, getAverageWaitTime, type QueueEntry } from "@/state/queue-store";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  waiting: { bg: "bg-status-amber-light", text: "text-status-amber", label: "Waiting" },
  called: { bg: "bg-status-blue-light", text: "text-primary", label: "Called" },
  seated: { bg: "bg-status-green-light", text: "text-status-green", label: "Seated" },
  no_show: { bg: "bg-status-red-light", text: "text-destructive", label: "No Show" },
};

const AdminQueue: React.FC = () => {
  const queue = useQueue();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState(2);
  const [newPhone, setNewPhone] = useState("");

  const waitingCount = getWaitingCount();
  const avgWait = getAverageWaitTime();
  const activeQueue = queue.filter(q => q.status === "waiting" || q.status === "called");
  const historyQueue = queue.filter(q => q.status === "seated" || q.status === "no_show");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addToQueue({ partyName: newName, partySize: newSize, phone: newPhone || undefined });
    setNewName("");
    setNewSize(2);
    setNewPhone("");
    setShowAddForm(false);
  };

  const getWaitMinutes = (joinedAt: string) => {
    return Math.round((Date.now() - new Date(joinedAt).getTime()) / 60000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Queue Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{waitingCount} parties waiting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => callNext()} disabled={waitingCount === 0}>
            <Bell className="h-4 w-4 mr-2" />Call Next
          </Button>
          <Button className="shadow-sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />Walk-in
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Waiting", value: waitingCount, icon: Clock },
          { label: "Called", value: queue.filter(q => q.status === "called").length, icon: Bell },
          { label: "Seated Today", value: queue.filter(q => q.status === "seated").length, icon: Check },
          { label: "Avg Wait", value: `${avgWait} min`, icon: Clock },
        ].map(s => (
          <div key={s.label} className="uniweb-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="text-[28px] font-bold text-foreground tracking-tighter leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Walk-in Form */}
      {showAddForm && (
        <div className="uniweb-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Add Walk-in</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="section-label">Party Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border text-[13px] bg-background mt-1" placeholder="Name..." />
            </div>
            <div className="w-24">
              <label className="section-label">Party Size</label>
              <input type="number" min={1} value={newSize} onChange={e => setNewSize(parseInt(e.target.value) || 1)} className="w-full h-9 px-3 rounded-xl border border-border text-[13px] bg-background mt-1" />
            </div>
            <div className="w-40">
              <label className="section-label">Phone (optional)</label>
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border text-[13px] bg-background mt-1" placeholder="+65..." />
            </div>
            <Button onClick={handleAdd} className="h-9 shadow-sm">Add</Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)} className="h-9"><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Active Queue */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Active Queue</h2>
          <div className="space-y-2">
            {activeQueue.length === 0 ? (
              <div className="uniweb-card p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No parties in queue</p>
              </div>
            ) : (
              activeQueue.map(entry => {
                const st = statusConfig[entry.status];
                return (
                  <div key={entry.id} className="uniweb-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-foreground">{entry.partyName}</h3>
                        <span className={cn("status-badge text-[10px]", st.bg, st.text)}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getWaitMinutes(entry.joinedAt)} min
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{entry.partySize} pax</span>
                      {entry.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{entry.phone}</span>}
                      {entry.preferredZone && <span className="text-primary text-[11px]">{entry.preferredZone}</span>}
                    </div>
                    <div className="flex gap-1.5 mt-3">
                      {entry.status === "waiting" && (
                        <Button size="sm" variant="default" onClick={() => callNext()} className="h-7 text-[11px] shadow-sm">
                          <Bell className="h-3 w-3 mr-1" />Call
                        </Button>
                      )}
                      {entry.status === "called" && (
                        <Button size="sm" variant="default" onClick={() => seatEntry(entry.id)} className="h-7 text-[11px] bg-status-green hover:bg-status-green/80 shadow-sm">
                          <Check className="h-3 w-3 mr-1" />Seat
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => markNoShow(entry.id)} className="h-7 text-[11px] text-destructive hover:text-destructive">
                        <UserX className="h-3 w-3 mr-1" />No Show
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Today's History</h2>
          <div className="space-y-2">
            {historyQueue.map(entry => {
              const st = statusConfig[entry.status];
              return (
                <div key={entry.id} className="uniweb-card p-3 opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{entry.partyName}</span>
                      <span className={cn("status-badge text-[10px]", st.bg, st.text)}>{st.label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{entry.partySize} pax</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;
