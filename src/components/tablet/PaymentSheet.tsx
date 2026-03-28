import React, { useState } from "react";
import { X, Check, CreditCard, Banknote, QrCode, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface PaymentSheetProps {
  order: Order;
  onClose: () => void;
  onComplete: (method?: string, cashReceived?: number) => void;
}

type PaymentTab = "card" | "cash" | "qr";

const qrMethods = [
  { id: "alipay", label: "Alipay" },
  { id: "wechat", label: "WeChat Pay" },
  { id: "paynow", label: "PayNow" },
];

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ order, onClose, onComplete }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<PaymentTab>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completedMethod, setCompletedMethod] = useState("");
  const [cashInput, setCashInput] = useState("");
  const [selectedQr, setSelectedQr] = useState("alipay");

  const cashAmount = parseFloat(cashInput) || 0;
  const changeDue = cashAmount - order.total;

  const handlePay = async (method: string) => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsProcessing(false);
    setIsComplete(true);
    setCompletedMethod(method);
  };

  const handleNumpad = (val: string) => {
    if (val === "del") {
      setCashInput(prev => prev.slice(0, -1));
    } else if (val === "." && cashInput.includes(".")) {
      return;
    } else {
      setCashInput(prev => prev + val);
    }
  };

  const handleQuickCash = (amount: number) => {
    setCashInput(String(amount));
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={() => onComplete(completedMethod, completedMethod === "Cash" ? cashAmount : undefined)}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-status-green-light flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-status-green" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">{t("payment_complete")}</h3>
          <p className="text-muted-foreground text-[13px] mb-1">${order.total.toFixed(2)} · {completedMethod}</p>
          {completedMethod === "Cash" && changeDue > 0 && (
            <p className="text-status-green text-[13px] font-semibold">Change: ${changeDue.toFixed(2)}</p>
          )}
          <Button className="w-full mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" size="xl" onClick={() => onComplete(completedMethod, completedMethod === "Cash" ? cashAmount : undefined)}>{t("done")}</Button>
        </div>
      </div>
    );
  }

  const tabs: { id: PaymentTab; icon: React.ReactNode; label: string }[] = [
    { id: "card", icon: <CreditCard className="h-4 w-4" />, label: "Card" },
    { id: "cash", icon: <Banknote className="h-4 w-4" />, label: "Cash" },
    { id: "qr", icon: <QrCode className="h-4 w-4" />, label: "QR" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{t("payment")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-5 pt-5 pb-3 text-center">
          <p className="section-label mb-1">{t("amount_due")}</p>
          <p className="text-3xl font-bold text-foreground tracking-tighter font-mono">${order.total.toFixed(2)}</p>
        </div>

        {/* Tabs */}
        <div className="flex mx-5 bg-accent rounded-lg p-0.5 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-5 pb-5">
          {tab === "card" && (
            <div className="text-center space-y-4">
              <div className="py-6">
                <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[13px] text-muted-foreground">Tap, insert or swipe</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Powered by Uniweb</p>
              </div>
              <Button
                variant="pay"
                size="xl"
                className="w-full rounded-lg font-semibold"
                disabled={isProcessing}
                onClick={() => handlePay("Card")}
              >
                {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
              </Button>
            </div>
          )}

          {tab === "cash" && (
            <div className="space-y-3">
              {/* Cash received display */}
              <div className="bg-accent rounded-lg p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Cash Received</p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  ${cashInput || "0.00"}
                </p>
                {cashAmount >= order.total && (
                  <p className="text-[13px] text-status-green font-semibold mt-1">
                    Change: ${changeDue.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleQuickCash(amt)}
                    className={cn(
                      "h-10 rounded-lg text-[13px] font-semibold transition-colors active:scale-95",
                      cashInput === String(amt) ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-secondary"
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-1.5">
                {["1","2","3","4","5","6","7","8","9",".","0","del"].map(key => (
                  <button
                    key={key}
                    onClick={() => handleNumpad(key)}
                    className="h-11 rounded-lg bg-accent text-foreground text-[15px] font-semibold hover:bg-secondary transition-colors active:scale-95 flex items-center justify-center"
                  >
                    {key === "del" ? <Delete className="h-4 w-4" /> : key}
                  </button>
                ))}
              </div>

              <Button
                variant="pay"
                size="xl"
                className="w-full rounded-lg font-semibold"
                disabled={isProcessing || cashAmount < order.total}
                onClick={() => handlePay("Cash")}
              >
                {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
              </Button>
            </div>
          )}

          {tab === "qr" && (
            <div className="space-y-4">
              {/* QR method selection */}
              <div className="flex gap-2">
                {qrMethods.map(qr => (
                  <button
                    key={qr.id}
                    onClick={() => setSelectedQr(qr.id)}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-[12px] font-medium transition-colors active:scale-95",
                      selectedQr === qr.id ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-secondary"
                    )}
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              <div className="py-4 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[13px] text-muted-foreground">Scan QR code to pay</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">{qrMethods.find(q => q.id === selectedQr)?.label}</p>
              </div>

              <Button
                variant="pay"
                size="xl"
                className="w-full rounded-lg font-semibold"
                disabled={isProcessing}
                onClick={() => handlePay(qrMethods.find(q => q.id === selectedQr)?.label || "QR")}
              >
                {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
              </Button>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
