import React from "react";
import { useQueue, getWaitingCount, type QueueEntry } from "@/state/queue-store";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const QueueKiosk: React.FC = () => {
  const queue = useQueue();
  const waitingEntries = queue.filter(q => q.status === "waiting" || q.status === "called")
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const getPosition = (entry: QueueEntry) => {
    const waiting = queue.filter(q => q.status === "waiting").sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    return waiting.findIndex(q => q.id === entry.id) + 1;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Queue Status</h1>
        <p className="text-lg text-muted-foreground mt-2">{getWaitingCount()} parties waiting</p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        {waitingEntries.map(entry => (
          <div
            key={entry.id}
            className={cn(
              "uniweb-card p-6 flex items-center gap-4",
              entry.status === "called" && "border-primary ring-2 ring-primary/20 animate-pulse"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
              entry.status === "called" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
            )}>
              {entry.status === "called" ? "!" : getPosition(entry)}
            </div>

            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">{entry.partyName}</div>
              <div className="flex items-center gap-3 text-[13px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{entry.partySize} pax</span>
                {entry.status === "called" && (
                  <span className="text-primary font-semibold animate-pulse">Please proceed to counter</span>
                )}
              </div>
            </div>

            <div className={cn(
              "px-3 py-1.5 rounded-full text-[12px] font-semibold",
              entry.status === "called" ? "bg-primary text-primary-foreground" : "bg-status-amber-light text-status-amber"
            )}>
              {entry.status === "called" ? "Your Turn!" : "Waiting"}
            </div>
          </div>
        ))}

        {waitingEntries.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No parties in queue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueKiosk;
