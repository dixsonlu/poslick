import type { OrderStatus } from "@/data/mock-data";

// Valid transitions for order lifecycle
const transitions: Record<OrderStatus, OrderStatus[]> = {
  open: ["sent", "void"],
  sent: ["preparing", "void"],
  preparing: ["ready", "void"],
  ready: ["served", "void"],
  served: ["paid", "void"],
  paid: [],
  void: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const allowed = transitions[current]?.filter(s => s !== "void");
  return allowed?.length ? allowed[0] : null;
}

export function canVoid(status: OrderStatus): boolean {
  return status !== "paid" && status !== "void";
}

// Manager PIN verification stub
const MANAGER_PIN = "1234";

export function verifyManagerPin(pin: string): boolean {
  return pin === MANAGER_PIN;
}

// Inventory deduction stub — called when order transitions to "sent"
export function deductInventory(orderItems: { menuItemId: string; quantity: number }[]): void {
  console.log("[Inventory] Deducting stock for", orderItems.length, "items");
}

// Cancel an order item — notifies kitchen (KDS) and optionally restores inventory
export function cancelOrderItem(itemId: string, reason: string): { success: boolean; message: string } {
  console.log(`[Cancel] Item ${itemId} cancelled: ${reason}`);
  // In real system: push notification to KDS, update order status, restore inventory
  return { success: true, message: `Item cancelled: ${reason}. Kitchen notified.` };
}
