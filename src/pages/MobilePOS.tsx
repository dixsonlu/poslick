import React, { useState } from "react";
import { MobileTablesScreen } from "@/components/mobile/MobileTablesScreen";
import { MobileDiningSheet } from "@/components/mobile/MobileDiningSheet";
import { MobileMenuScreen } from "@/components/mobile/MobileMenuScreen";
import { MobileReviewScreen } from "@/components/mobile/MobileReviewScreen";
import { MobilePaymentSheet } from "@/components/mobile/MobilePaymentSheet";
import { tables as mockTables, menuItems, type Table, type OrderItem, type ServiceMode } from "@/data/mock-data";

type MobileStep = "tables" | "dining" | "menu" | "review" | "payment";

const MobilePOS: React.FC = () => {
  const [step, setStep] = useState<MobileStep>("tables");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("dine-in");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const recalc = (items: OrderItem[]) => {
    const subtotal = items.reduce((s, i) => s + (i.price + i.modifiers.reduce((ms, m) => ms + m.price, 0)) * i.quantity, 0);
    const sc = subtotal * 0.1;
    const gst = (subtotal + sc) * 0.09;
    return { subtotal, serviceCharge: sc, gst, total: subtotal + sc + gst };
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setStep("dining");
  };

  const handleSelectDining = (mode: ServiceMode) => {
    setServiceMode(mode);
    setStep("menu");
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
    setStep("tables");
    setSelectedTable(null);
    setOrderItems([]);
  };

  const totals = recalc(orderItems);

  switch (step) {
    case "tables":
      return <MobileTablesScreen tables={mockTables} onSelectTable={handleSelectTable} />;
    case "dining":
      return <MobileDiningSheet table={selectedTable!} onSelect={handleSelectDining} onBack={() => setStep("tables")} />;
    case "menu":
      return (
        <MobileMenuScreen
          table={selectedTable!}
          serviceMode={serviceMode}
          orderItems={orderItems}
          onAddItem={handleAddItem}
          onReview={() => setStep("review")}
          onBack={() => setStep("dining")}
          total={totals.total}
          itemCount={orderItems.reduce((s, i) => s + i.quantity, 0)}
        />
      );
    case "review":
      return (
        <MobileReviewScreen
          table={selectedTable!}
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

export default MobilePOS;
