import React, { useState, useCallback, useMemo } from "react";
import { Receipt } from "lucide-react";
import { FloorPanel } from "@/components/tablet/FloorPanel";
import { MenuComposer } from "@/components/tablet/MenuComposer";
import { CheckPanel } from "@/components/tablet/CheckPanel";
import { PaymentSheet } from "@/components/tablet/PaymentSheet";
import { OrderHistory } from "@/components/tablet/OrderHistory";
import type { PaidOrder } from "@/components/tablet/history/types";
import { tables as mockTables, sampleOrders, menuItems, type Table, type Order, type OrderItem, type ServiceMode } from "@/data/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { getMenuItemsSnapshot } from "@/state/menu-store";

// Generate 30 mock historical orders for demo
const generateMockHistory = (): PaidOrder[] => {
  const methods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];
  const modes: ("dine-in" | "takeaway" | "delivery")[] = ["dine-in", "takeaway", "delivery"];
  const itemNames = ["Chicken Rice", "Laksa", "Char Kway Teow", "Nasi Lemak", "Satay", "Teh Tarik", "Hokkien Mee", "Bak Kut Teh", "Chilli Crab", "Milo Dinosaur"];
  const result: PaidOrder[] = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const mode = modes[i % modes.length];
    const method = methods[i % methods.length];
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const items: PaidOrder["items"] = [];
    for (let j = 0; j < itemCount; j++) {
      const price = 3 + Math.random() * 35;
      items.push({
        name: itemNames[(i + j) % itemNames.length],
        quantity: 1 + Math.floor(Math.random() * 2),
        price: Math.round(price * 100) / 100,
        modifiers: j === 0 ? [{ name: "Spicy", price: 0 }] : [],
      });
    }
    const subtotal = items.reduce((s, it) => s + (it.price + it.modifiers.reduce((ms, m) => ms + m.price, 0)) * it.quantity, 0);
    const serviceCharge = subtotal * 0.1;
    const gst = (subtotal + serviceCharge) * 0.09;
    const total = subtotal + serviceCharge + gst;

    const isCash = method === "Cash";
    const cashReceived = isCash ? Math.ceil(total / 10) * 10 : undefined;
    const changeDue = isCash && cashReceived ? cashReceived - total : undefined;

    result.push({
      id: `hist-${i}-${Date.now()}`,
      tableNumber: mode === "dine-in" ? String(1 + (i % 15)) : undefined,
      serviceMode: mode,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: i % 7 === 0 ? Math.round(subtotal * 0.1 * 100) / 100 : 0,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      total: Math.round(total * 100) / 100,
      paidAt: new Date(now - i * 3600000 * (0.5 + Math.random())).toISOString(),
      paymentMethod: method,
      cashReceived: cashReceived ? Math.round(cashReceived * 100) / 100 : undefined,
      changeDue: changeDue ? Math.round(changeDue * 100) / 100 : undefined,
    });
  }
  return result;
};

const TabletPOS: React.FC = () => {
  const { t } = useLanguage();
  const [tables, setTables] = useState(mockTables);
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>(() => generateMockHistory());
  const [floorFullscreen, setFloorFullscreen] = useState(false);
  const [tableManagement, setTableManagement] = useState(true); // QSR toggle

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const handleSelectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setFloorFullscreen(false);
    const table = tables.find(t => t.id === tableId);
    if (table?.orderId) {
      const order = orders.find(o => o.id === table.orderId);
      setCurrentOrder(order || null);
    } else if (table?.status === "available") {
      const newOrder: Order = {
        id: `o-${Date.now()}`,
        tableId,
        tableNumber: table.number,
        serviceMode: "dine-in",
        items: [],
        status: "open",
        guestCount: 1,
        createdAt: new Date().toISOString(),
        subtotal: 0, serviceCharge: 0, gst: 0, total: 0,
      };
      setCurrentOrder(newOrder);
      setOrders(prev => [...prev, newOrder]);
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, status: "ordering" as const, guestCount: 1, orderId: newOrder.id, elapsedMinutes: 0 } : t
      ));
    } else {
      setCurrentOrder(null);
    }
  }, [tables, orders]);

  const handleCreateWalkIn = useCallback((mode: ServiceMode) => {
    const newOrder: Order = {
      id: `o-${Date.now()}`,
      serviceMode: mode,
      items: [],
      status: "open",
      guestCount: 1,
      createdAt: new Date().toISOString(),
      subtotal: 0, serviceCharge: 0, gst: 0, total: 0,
    };
    setCurrentOrder(newOrder);
    setOrders(prev => [...prev, newOrder]);
    setSelectedTableId(null);
  }, []);

  const recalcOrder = (items: OrderItem[]): Pick<Order, "subtotal" | "serviceCharge" | "gst" | "total"> => {
    const subtotal = items.reduce((sum, item) => {
      const modTotal = item.modifiers.reduce((ms, m) => ms + m.price, 0);
      return sum + (item.price + modTotal) * item.quantity;
    }, 0);
    const serviceCharge = subtotal * 0.1;
    const gst = (subtotal + serviceCharge) * 0.09;
    return { subtotal, serviceCharge, gst, total: subtotal + serviceCharge + gst };
  };

  const handleAddItem = useCallback((menuItemId: string, modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => {
    if (!currentOrder) return;
    const menuItem = getMenuItemsSnapshot().find(m => m.id === menuItemId);
    if (!menuItem) return;

    setCurrentOrder(prev => {
      if (!prev) return prev;
      const existing = !comboItems && prev.items.find(i => i.menuItemId === menuItemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers) && i.notes === notes);
      let newItems: OrderItem[];
      if (existing) {
        newItems = prev.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const newItem: OrderItem = {
          id: `oi-${Date.now()}`,
          menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          modifiers,
          notes,
          status: "new",
          comboItems,
        };
        newItems = [...prev.items, newItem];
      }
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });

    if (selectedTableId) {
      setTables(prev => prev.map(t =>
        t.id === selectedTableId && t.status === "ordering" ? { ...t, openAmount: undefined } : t
      ));
    }
  }, [currentOrder, selectedTableId]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      ).filter(i => i.quantity > 0);
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(i => i.id !== itemId);
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const paymentMethods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];

  const handlePaymentComplete = useCallback((method?: string) => {
    if (currentOrder) {
      const isCash = method === "Cash";
      const cashReceived = isCash ? Math.ceil(currentOrder.total / 10) * 10 : undefined;
      const changeDue = isCash && cashReceived ? cashReceived - currentOrder.total : undefined;

      const paid: PaidOrder = {
        id: currentOrder.id,
        tableNumber: currentOrder.tableNumber,
        serviceMode: currentOrder.serviceMode,
        items: currentOrder.items.map(i => ({
          name: i.name, quantity: i.quantity, price: i.price,
          modifiers: i.modifiers,
        })),
        subtotal: currentOrder.subtotal,
        discount: 0,
        serviceCharge: currentOrder.serviceCharge,
        gst: currentOrder.gst,
        total: currentOrder.total,
        paidAt: new Date().toISOString(),
        paymentMethod: method || paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        cashReceived,
        changeDue,
      };
      setPaidOrders(prev => [paid, ...prev]);
    }
    setShowPayment(false);
    if (currentOrder?.tableId) {
      setTables(prev => prev.map(t =>
        t.id === currentOrder.tableId ? { ...t, status: "dirty" as const, guestCount: undefined, openAmount: undefined, orderId: undefined, elapsedMinutes: undefined } : t
      ));
    }
    setCurrentOrder(null);
    setSelectedTableId(null);
  }, [currentOrder]);

  const handleTransferTable = useCallback((fromId: string, toId: string) => {
    setTables(prev => {
      const fromTable = prev.find(t => t.id === fromId);
      const toTable = prev.find(t => t.id === toId);
      if (!fromTable || !toTable) return prev;
      return prev.map(t => {
        if (t.id === fromId) return { ...t, status: "available" as const, guestCount: undefined, server: undefined, openAmount: undefined, elapsedMinutes: undefined, orderId: undefined };
        if (t.id === toId) return { ...t, status: fromTable.status, guestCount: fromTable.guestCount, server: fromTable.server, openAmount: fromTable.openAmount, elapsedMinutes: fromTable.elapsedMinutes, orderId: fromTable.orderId };
        return t;
      });
    });
    if (currentOrder) {
      const toTable = tables.find(t => t.id === toId);
      setCurrentOrder(prev => prev ? { ...prev, tableId: toId, tableNumber: toTable?.number } : prev);
      setSelectedTableId(toId);
    }
  }, [currentOrder, tables]);

  const handleMergeTables = useCallback((tableIds: string[]) => {
    if (tableIds.length < 2) return;
    const primary = tableIds[0];
    const others = tableIds.slice(1);
    setTables(prev => prev.map(t => {
      if (t.id === primary) {
        const totalSeats = tableIds.reduce((sum, id) => sum + (prev.find(x => x.id === id)?.seats || 0), 0);
        return { ...t, seats: totalSeats, mergedWith: others };
      }
      if (others.includes(t.id)) return { ...t, status: "available" as const, mergedWith: undefined };
      return t;
    }));
  }, []);

  const handleSplitTable = useCallback((tableId: string, count: number) => {
    setTables(prev => {
      const table = prev.find(t => t.id === tableId);
      if (!table) return prev;
      const seatsEach = Math.max(2, Math.floor(table.seats / count));
      const newTables: Table[] = [];
      for (let i = 1; i < count; i++) {
        newTables.push({
          id: `${tableId}-s${i}`,
          number: `${table.number}${String.fromCharCode(65 + i)}`,
          zone: table.zone,
          seats: seatsEach,
          status: "available",
        });
      }
      return [
        ...prev.map(t => t.id === tableId ? { ...t, seats: seatsEach, number: `${table.number}A` } : t),
        ...newTables,
      ];
    });
  }, []);

  // When history is shown, replace CheckPanel with OrderHistory side panel
  const showCheckPanel = !showHistory;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Floor Panel — only when table management is enabled */}
      {tableManagement && (
        <FloorPanel
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={handleSelectTable}
          onCreateWalkIn={handleCreateWalkIn}
          onTransferTable={handleTransferTable}
          onMergeTables={handleMergeTables}
          onSplitTable={handleSplitTable}
          isFullscreen={floorFullscreen}
          onToggleFullscreen={() => setFloorFullscreen(f => !f)}
        />
      )}

      {!floorFullscreen && (
        <>
          <MenuComposer
            onAddItem={handleAddItem}
            selectedTable={selectedTable}
            currentOrder={currentOrder}
          />
          {showCheckPanel ? (
            <CheckPanel
              order={currentOrder}
              table={selectedTable}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onPay={() => setShowPayment(true)}
            />
          ) : (
            <div className="w-[340px] shrink-0 border-l border-border">
              <OrderHistory orders={paidOrders} onClose={() => setShowHistory(false)} />
            </div>
          )}
        </>
      )}

      {/* Top-right controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowHistory(h => !h)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-1.5 text-[11px] font-medium transition-colors min-h-[44px]",
            showHistory
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Receipt className="h-3.5 w-3.5" />
          {t("history")}
          {paidOrders.length > 0 && (
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
              showHistory ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
            )}>
              {paidOrders.length}
            </span>
          )}
        </button>
        <ThemeToggle />
      </div>

      {showPayment && currentOrder && (
        <PaymentSheet
          order={currentOrder}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

// Helper
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default TabletPOS;
