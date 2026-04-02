import React, { useState } from "react";
import { MobileMenuScreen } from "@/components/mobile/MobileMenuScreen";
import { MobileReviewScreen } from "@/components/mobile/MobileReviewScreen";
import { MobilePaymentSheet } from "@/components/mobile/MobilePaymentSheet";
import { menuItems, type Table, type OrderItem, type ServiceMode } from "@/data/mock-data";
import { useSearchParams } from "react-router-dom";

/**
 * QR Order flow: Customer scans QR → goes directly to menu → review → payment.
 * No table selection needed. Table info comes from QR code URL params.
 * e.g. /order?table=5&mode=dine-in
 */
type QRStep = "menu" | "review" | "payment";

const QROrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || "QR";
  const mode = (searchParams.get("mode") as ServiceMode) || "dine-in";

  const [step, setStep] = useState<QRStep>("menu");
  const [serviceMode] = useState<ServiceMode>(mode);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Virtual table from QR
  const virtualTable: Table = {
    id: `qr-${tableNumber}`,
    number: tableNumber,
    zone: "QR Order",
    seats: 4,
    status: "ordering",
  };

  const recalc = (items: OrderItem[]) => {
    const subtotal = Math.round(items.reduce((s, i) => s + (i.price + i.modifiers.reduce((ms, m) => ms + m.price, 0)) * i.quantity, 0) * 100) / 100;
    const sc = Math.round(subtotal * 0.1 * 100) / 100;
    const gst = Math.round((subtotal + sc) * 0.09 * 100) / 100;
    return { subtotal, serviceCharge: sc, gst, total: Math.round((subtotal + sc + gst) * 100) / 100 };
  };

  const handleAddItem = (menuItemId: string, modifiers: { name: string; price: number }[], notes?: string) => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem) return;
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers));
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        id: `oi-${Date.now()}`, menuItemId, name: menuItem.name, price: menuItem.price,
        quantity: 1, modifiers, notes, status: "new" as const,
      }];
    });
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setOrderItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handlePaymentComplete = () => {
    setStep("menu");
    setOrderItems([]);
  };

  const totals = recalc(orderItems);

  switch (step) {
    case "menu":
      return (
        <MobileMenuScreen
          table={virtualTable}
          serviceMode={serviceMode}
          orderItems={orderItems}
          onAddItem={handleAddItem}
          onReview={() => setStep("review")}
          onBack={() => {}} // No back from QR — already at start
          total={totals.total}
          itemCount={orderItems.reduce((s, i) => s + i.quantity, 0)}
        />
      );
    case "review":
      return (
        <MobileReviewScreen
          table={virtualTable}
          serviceMode={serviceMode}
          items={orderItems}
          totals={totals}
          onUpdateQty={handleUpdateQty}
          onPay={() => setStep("payment")}
          onBack={() => setStep("menu")}
        />
      );
    case "payment":
      return (
        <MobilePaymentSheet
          total={totals.total}
          onComplete={handlePaymentComplete}
          onBack={() => setStep("review")}
        />
      );
  }
};

export default QROrder;
