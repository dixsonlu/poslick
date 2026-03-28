import React from "react";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Table, type ServiceMode, type OrderItem } from "@/data/mock-data";

interface Props {
  table: Table;
  serviceMode: ServiceMode;
  items: OrderItem[];
  totals: { subtotal: number; serviceCharge: number; gst: number; total: number };
  onUpdateQty: (id: string, delta: number) => void;
  onPay: () => void;
  onBack: () => void;
}

export const MobileReviewScreen: React.FC<Props> = ({ table, serviceMode, items, totals, onUpdateQty, onPay, onBack }) => (
  <div className="flex flex-col h-screen bg-background">
    <div className="bg-card border-b border-border px-4 pt-12 pb-3 flex items-center gap-3">
      <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>
      <div>
        <h1 className="text-base font-bold text-foreground tracking-tight">Review Order</h1>
        <p className="text-[11px] text-muted-foreground">Table {table.number} · <span className="capitalize">{serviceMode}</span></p>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-4 py-4 pb-48">
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-xl border-1.5 border-border p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-[13px] text-foreground">{item.name}</h3>
                {item.modifiers.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.modifiers.map(m => m.name).join(", ")}</p>
                )}
                {item.notes && <p className="text-[11px] text-status-amber mt-0.5">📝 {item.notes}</p>}
              </div>
              <span className="font-semibold text-[13px] text-foreground font-mono">
                ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onUpdateQty(item.id, -1)}
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-secondary transition-colors">
                {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : <Minus className="h-3.5 w-3.5 text-foreground" />}
              </button>
              <span className="text-[13px] font-semibold text-foreground w-6 text-center">{item.quantity}</span>
              <button onClick={() => onUpdateQty(item.id, 1)}
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-secondary transition-colors">
                <Plus className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-2">
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>Subtotal</span><span className="font-mono">${totals.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>Service (10%)</span><span className="font-mono">${totals.serviceCharge.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>GST (9%)</span><span className="font-mono">${totals.gst.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
        <span>Total</span><span className="font-mono">${totals.total.toFixed(2)}</span>
      </div>
      <Button variant="pay" size="xl" className="w-full mt-2 rounded-lg" onClick={onPay}>
        Go to Payment · ${totals.total.toFixed(2)}
      </Button>
    </div>
  </div>
);
