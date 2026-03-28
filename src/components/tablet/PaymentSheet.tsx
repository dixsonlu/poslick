import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface PaymentSheetProps {
  order: Order;
  onClose: () => void;
  onComplete: (method?: string) => void;
}

const paymentMethods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ order, onClose, onComplete }) => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Auto-assign a random payment method (simulating terminal auto-detection)
  const autoMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={() => onComplete(autoMethod)}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-status-green-light flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-status-green" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">{t("payment_complete")}</h3>
          <p className="text-muted-foreground text-[13px] mb-1">${order.total.toFixed(2)}</p>
          <Button className="w-full mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" size="xl" onClick={() => onComplete(autoMethod)}>{t("done")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{t("payment")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <p className="section-label mb-2">{t("amount_due")}</p>
          <p className="text-4xl font-bold text-foreground tracking-tighter font-mono mb-2">${order.total.toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground">Powered by Uniweb</p>
        </div>

        <div className="p-5 border-t border-border">
          <Button
            size="xl"
            className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            disabled={isProcessing}
            onClick={handlePay}
          >
            {isProcessing ? t("processing") : `${t("confirm_payment")} $${order.total.toFixed(2)}`}
          </Button>
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
