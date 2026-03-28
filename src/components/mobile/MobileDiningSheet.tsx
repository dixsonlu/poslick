import React from "react";
import { ArrowLeft, UtensilsCrossed, ShoppingBag, Truck, Package } from "lucide-react";
import { type Table, type ServiceMode } from "@/data/mock-data";

interface Props {
  table: Table;
  onSelect: (mode: ServiceMode) => void;
  onBack: () => void;
}

const modes = [
  { id: "dine-in" as ServiceMode, icon: UtensilsCrossed, label: "Dine In", desc: "Serve at table" },
  { id: "takeaway" as ServiceMode, icon: ShoppingBag, label: "Takeaway", desc: "Pack and go" },
  { id: "pickup" as ServiceMode, icon: Package, label: "Pickup", desc: "Customer collects" },
  { id: "delivery" as ServiceMode, icon: Truck, label: "Delivery", desc: "Send to address" },
];

export const MobileDiningSheet: React.FC<Props> = ({ table, onSelect, onBack }) => (
  <div className="flex flex-col h-screen bg-background">
    <div className="bg-card border-b border-border px-4 pt-12 pb-3 flex items-center gap-3">
      <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">Table {table.number}</h1>
        <p className="text-[11px] text-muted-foreground">{table.seats} seats · {table.zone}</p>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <h2 className="text-[13px] font-semibold text-foreground mb-6">Select Service Mode</h2>
      <div className="w-full max-w-sm space-y-3">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border-1.5 border-border hover:border-primary/40 transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-[11px] bg-status-blue-light flex items-center justify-center">
              <mode.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-[13px]">{mode.label}</div>
              <div className="text-[11px] text-muted-foreground">{mode.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);
