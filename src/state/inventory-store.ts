import { useSyncExternalStore } from "react";

export interface InventoryItem {
  id: string;
  name: string;
  nameZh?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier?: string;
  lastRestocked?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: { itemId: string; itemName: string; qty: number; unitCost: number }[];
  status: "draft" | "submitted" | "received" | "cancelled";
  createdAt: string;
  total: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "restock" | "deduction" | "adjustment" | "waste";
  quantity: number;
  note?: string;
  timestamp: string;
}

// Mock data
const mockInventory: InventoryItem[] = [
  { id: "inv-1", name: "Chicken Breast", nameZh: "鸡胸肉", category: "Proteins", unit: "kg", currentStock: 25, minStock: 10, maxStock: 50, costPerUnit: 8.50, supplier: "Fresh Farms SG", lastRestocked: "2026-03-28" },
  { id: "inv-2", name: "Jasmine Rice", nameZh: "茉莉香米", category: "Grains", unit: "kg", currentStock: 80, minStock: 20, maxStock: 200, costPerUnit: 2.80, supplier: "Golden Grain Pte", lastRestocked: "2026-03-25" },
  { id: "inv-3", name: "Laksa Paste", nameZh: "叻沙酱", category: "Sauces", unit: "jar", currentStock: 12, minStock: 5, maxStock: 30, costPerUnit: 6.00, supplier: "Spice World" },
  { id: "inv-4", name: "Tiger Prawns", nameZh: "虎虾", category: "Seafood", unit: "kg", currentStock: 5, minStock: 8, maxStock: 25, costPerUnit: 28.00, supplier: "Ocean Fresh", lastRestocked: "2026-03-27" },
  { id: "inv-5", name: "Coconut Milk", nameZh: "椰浆", category: "Dairy", unit: "can", currentStock: 40, minStock: 15, maxStock: 60, costPerUnit: 2.20, supplier: "Kara Foods" },
  { id: "inv-6", name: "Bean Sprouts", nameZh: "豆芽", category: "Vegetables", unit: "kg", currentStock: 8, minStock: 5, maxStock: 20, costPerUnit: 1.50, supplier: "Fresh Farms SG", lastRestocked: "2026-03-29" },
  { id: "inv-7", name: "Egg Noodles", nameZh: "蛋面", category: "Grains", unit: "kg", currentStock: 15, minStock: 8, maxStock: 40, costPerUnit: 3.20, supplier: "Golden Grain Pte" },
  { id: "inv-8", name: "Pork Belly", nameZh: "五花肉", category: "Proteins", unit: "kg", currentStock: 18, minStock: 10, maxStock: 35, costPerUnit: 12.00, supplier: "Fresh Farms SG" },
  { id: "inv-9", name: "Sambal Chili", nameZh: "参巴辣椒", category: "Sauces", unit: "jar", currentStock: 3, minStock: 5, maxStock: 20, costPerUnit: 4.50, supplier: "Spice World" },
  { id: "inv-10", name: "Pandan Leaves", nameZh: "班兰叶", category: "Herbs", unit: "bunch", currentStock: 20, minStock: 5, maxStock: 30, costPerUnit: 1.00, supplier: "Fresh Farms SG" },
  { id: "inv-11", name: "Sesame Oil", nameZh: "麻油", category: "Oils", unit: "bottle", currentStock: 10, minStock: 4, maxStock: 15, costPerUnit: 5.50, supplier: "Spice World" },
  { id: "inv-12", name: "Soy Sauce", nameZh: "酱油", category: "Sauces", unit: "bottle", currentStock: 8, minStock: 5, maxStock: 20, costPerUnit: 3.80, supplier: "Kikkoman" },
  { id: "inv-13", name: "Crab Meat", nameZh: "蟹肉", category: "Seafood", unit: "kg", currentStock: 3, minStock: 5, maxStock: 15, costPerUnit: 45.00, supplier: "Ocean Fresh" },
  { id: "inv-14", name: "Kangkong", nameZh: "空心菜", category: "Vegetables", unit: "kg", currentStock: 6, minStock: 3, maxStock: 15, costPerUnit: 2.00, supplier: "Fresh Farms SG" },
  { id: "inv-15", name: "Tiger Beer", nameZh: "虎牌啤酒", category: "Beverages", unit: "carton", currentStock: 15, minStock: 5, maxStock: 30, costPerUnit: 38.00, supplier: "APB SG" },
  { id: "inv-16", name: "Condensed Milk", nameZh: "炼乳", category: "Dairy", unit: "can", currentStock: 25, minStock: 10, maxStock: 40, costPerUnit: 2.50, supplier: "F&N" },
  { id: "inv-17", name: "Fish Cake", nameZh: "鱼饼", category: "Proteins", unit: "pack", currentStock: 12, minStock: 6, maxStock: 25, costPerUnit: 4.00, supplier: "Fresh Farms SG" },
  { id: "inv-18", name: "Tapioca Starch", nameZh: "木薯淀粉", category: "Grains", unit: "kg", currentStock: 7, minStock: 3, maxStock: 15, costPerUnit: 2.00, supplier: "Golden Grain Pte" },
  { id: "inv-19", name: "Lemongrass", nameZh: "香茅", category: "Herbs", unit: "bunch", currentStock: 10, minStock: 4, maxStock: 20, costPerUnit: 1.20, supplier: "Fresh Farms SG" },
  { id: "inv-20", name: "Cooking Oil", nameZh: "食用油", category: "Oils", unit: "bottle", currentStock: 12, minStock: 5, maxStock: 20, costPerUnit: 6.00, supplier: "Knife Brand" },
];

const mockPOs: PurchaseOrder[] = [
  { id: "po-1", supplier: "Fresh Farms SG", items: [{ itemId: "inv-4", itemName: "Tiger Prawns", qty: 20, unitCost: 28 }, { itemId: "inv-1", itemName: "Chicken Breast", qty: 30, unitCost: 8.5 }], status: "submitted", createdAt: "2026-03-28", total: 815 },
  { id: "po-2", supplier: "Spice World", items: [{ itemId: "inv-9", itemName: "Sambal Chili", qty: 15, unitCost: 4.5 }], status: "draft", createdAt: "2026-03-29", total: 67.5 },
];

const mockMovements: StockMovement[] = [
  { id: "mv-1", itemId: "inv-1", itemName: "Chicken Breast", type: "deduction", quantity: -5, timestamp: "2026-03-29T10:00:00Z", note: "Daily usage" },
  { id: "mv-2", itemId: "inv-2", itemName: "Jasmine Rice", type: "restock", quantity: 50, timestamp: "2026-03-28T08:00:00Z", note: "PO received" },
  { id: "mv-3", itemId: "inv-9", itemName: "Sambal Chili", type: "waste", quantity: -2, timestamp: "2026-03-28T16:00:00Z", note: "Expired" },
  { id: "mv-4", itemId: "inv-4", itemName: "Tiger Prawns", type: "deduction", quantity: -3, timestamp: "2026-03-29T12:00:00Z" },
];

let inventory = [...mockInventory];
let purchaseOrders = [...mockPOs];
let movements = [...mockMovements];
let listeners = new Set<() => void>();

function emit() { listeners.forEach(fn => fn()); }

export function getInventory() { return inventory; }
export function getPurchaseOrders() { return purchaseOrders; }
export function getMovements() { return movements; }

export function adjustStock(itemId: string, qty: number, note?: string) {
  inventory = inventory.map(i => i.id === itemId ? { ...i, currentStock: Math.max(0, i.currentStock + qty) } : i);
  movements = [{ id: `mv-${Date.now()}`, itemId, itemName: inventory.find(i => i.id === itemId)?.name || "", type: qty > 0 ? "restock" : "adjustment", quantity: qty, note, timestamp: new Date().toISOString() }, ...movements];
  emit();
}

export function useInventory() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getInventory);
}
export function usePurchaseOrders() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getPurchaseOrders);
}
export function useMovements() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getMovements);
}
