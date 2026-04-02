import React, { useState, useCallback } from "react";
import { CheckCircle2, Clock, UtensilsCrossed, Truck, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleOrders, type OrderItem, type KDSStatus } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface PickupTicket {
  id: string;
  orderId: string;
  tableNumber?: string;
  serviceMode: string;
  itemName: string;
  quantity: number;
  readyAt: string;
}

const AdminPickupDisplay: React.FC = () => {
  const [readyItems, setReadyItems] = useState<PickupTicket[]>(() => {
    const items: PickupTicket[] = [];
    sampleOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.status === "ready") {
          items.push({
            id: item.id,
            orderId: order.id,
            tableNumber: order.tableNumber,
            serviceMode: order.serviceMode,
            itemName: item.name,
            quantity: item.quantity,
            readyAt: new Date().toISOString(),
          });
        }
      });
    });
    return items;
  });

  const [completedItems, setCompletedItems] = useState<(PickupTicket & { completedAt: string })[]>([]);

  const handlePickup = useCallback((id: string) => {
    const item = readyItems.find(i => i.id === id);
    if (!item) return;
    setReadyItems(prev => prev.filter(i => i.id !== id));
    setCompletedItems(prev => [{ ...item, completedAt: new Date().toISOString() }, ...prev].slice(0, 20));
  }, [readyItems]);

  const handlePickupAll = useCallback((orderId: string) => {
    const items = readyItems.filter(i => i.orderId === orderId);
    setReadyItems(prev => prev.filter(i => i.orderId !== orderId));
    setCompletedItems(prev => [
      ...items.map(i => ({ ...i, completedAt: new Date().toISOString() })),
      ...prev,
    ].slice(0, 20));
  }, [readyItems]);

  // Group by order
  const orderGroups = readyItems.reduce<Record<string, PickupTicket[]>>((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {});

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Order Pickup Display</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {readyItems.length} items ready for pickup · {completedItems.length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-status-green font-medium">
            <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {readyItems.length === 0 ? (
        <div className="uniweb-card p-16 flex flex-col items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-status-green/30 mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-1">All Clear!</h2>
          <p className="text-[13px] text-muted-foreground">No items waiting for pickup</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(orderGroups).map(([orderId, items]) => {
            const first = items[0];
            const isDineIn = first.serviceMode === "dine-in";
            return (
              <div
                key={orderId}
                className="uniweb-card p-5 border-l-[4px] border-l-status-green animate-pulse-subtle"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {isDineIn ? (
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                    ) : (
                      <Truck className="h-4 w-4 text-status-amber" />
                    )}
                    <span className="font-bold text-foreground text-lg">
                      {isDineIn ? `Table ${first.tableNumber}` : first.serviceMode.toUpperCase()}
                    </span>
                  </div>
                  <span className="status-badge bg-status-green-light text-status-green font-bold">
                    READY
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-[14px] font-medium text-foreground">{item.itemName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-foreground bg-accent px-2 py-0.5 rounded-full">
                          ×{item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] rounded-md"
                          onClick={() => handlePickup(item.id)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="w-full h-9 text-[12px] rounded-lg gap-1.5 bg-status-green hover:bg-status-green/90 text-white"
                  onClick={() => handlePickupAll(orderId)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isDineIn ? "Served to Table" : "Handed to Customer"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent completions */}
      {completedItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Recently Completed</h2>
          <div className="flex flex-wrap gap-2">
            {completedItems.slice(0, 10).map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-muted-foreground text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-status-green" />
                {item.tableNumber ? `T${item.tableNumber}` : item.serviceMode} · {item.itemName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPickupDisplay;
