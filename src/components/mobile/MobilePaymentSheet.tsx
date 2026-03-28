import React, { useState } from "react";
import { ArrowLeft, CreditCard, Banknote, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  onComplete: () => void;
  onBack: () => void;
}

type Method = "card" | "cash" | "qr";

export const MobilePaymentSheet: React.FC<Props> = ({ total, onComplete, onBack }) => {
  const [method, setMethod] = useState<Method>("card");
  const [cashAmt, setCashAmt] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const cash = parseFloat(cashAmt) || 0;
  const change = Math.max(0, cash - total);

  const handleKey = (v: string) => {
    if (v === "C") { setCashAmt(""); return; }
    if (v === "." && cashAmt.includes(".")) return;
    setCashAmt(p => p + v);
  };

  const handlePay = async () => {
    if (method === "cash" && cash < total) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    setProcessing(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-pos-pay/15 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-pos-pay" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Complete</h2>
        <p className="text-muted-foreground mb-1">${total.toFixed(2)} paid via {method}</p>
        {method === "cash" && change > 0 && (
          <p className="text-lg font-semibold text-pos-pay mb-4">Change: ${change.toFixed(2)}</p>
        )}
        <Button variant="pay" size="xl" className="w-full max-w-sm mt-6" onClick={onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-card border-b border-border px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Payment</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
          <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
        </div>

        <div className="flex gap-2 px-4 mb-4">
          {([
            { id: "card" as Method, icon: CreditCard, label: "Card" },
            { id: "cash" as Method, icon: Banknote, label: "Cash" },
            { id: "qr" as Method, icon: QrCode, label: "SGQR" },
          ]).map(m => (
            <button key={m.id} onClick={() => { setMethod(m.id); setCashAmt(""); }}
              className={cn("flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors",
                method === m.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground")}>
              <m.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {method === "cash" && (
          <div className="px-4 space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cash Received</p>
              <p className="text-2xl font-bold text-foreground">${cashAmt || "0.00"}</p>
              {cash >= total && <p className="text-sm text-pos-pay font-medium">Change: ${change.toFixed(2)}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9",".","0","C"].map(k => (
                <button key={k} onClick={() => handleKey(k)}
                  className={cn("h-14 rounded-xl text-lg font-medium",
                    k === "C" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground active:bg-secondary")}>
                  {k}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(a => (
                <button key={a} onClick={() => setCashAmt(a.toFixed(2))}
                  className="flex-1 h-10 rounded-lg bg-muted text-sm font-medium text-foreground active:bg-secondary">${a}</button>
              ))}
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="px-4 py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tap, insert, or swipe card</p>
          </div>
        )}
        {method === "qr" && (
          <div className="px-4 py-8 text-center">
            <div className="w-32 h-32 bg-muted rounded-xl mx-auto mb-3 flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">Scan SGQR / PayNow</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-border">
        <Button variant="pay" size="xl" className="w-full"
          disabled={processing || (method === "cash" && cash < total)} onClick={handlePay}>
          {processing ? "Processing..." : `Confirm $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};
