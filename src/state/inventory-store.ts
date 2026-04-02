import { useSyncExternalStore } from "react";

export interface SupplierPrice {
  supplier: string;
  unitCost: number;
  leadTimeDays: number;
  minOrderQty: number;
  lastUpdated: string;
}

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
  soldOut?: boolean; // marks item as sold out in QR ordering
  supplierPrices?: SupplierPrice[]; // multi-supplier pricing
  dailyUsageAvg?: number; // average daily usage for COGS
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

export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: "low_stock" | "overstock" | "expiring";
  message: string;
  suggestedAction?: string;
}

// Mock data
const mockInventory: InventoryItem[] = [
  { id: "inv-1", name: "Chicken Breast", nameZh: "鸡胸肉", category: "Proteins", unit: "kg", currentStock: 25, minStock: 10, maxStock: 50, costPerUnit: 8.50, supplier: "Fresh Farms SG", lastRestocked: "2026-03-28", dailyUsageAvg: 8,
    supplierPrices: [
      { supplier: "Fresh Farms SG", unitCost: 8.50, leadTimeDays: 1, minOrderQty: 10, lastUpdated: "2026-03-28" },
      { supplier: "Quality Meats", unitCost: 9.20, leadTimeDays: 2, minOrderQty: 5, lastUpdated: "2026-03-25" },
      { supplier: "Hai Sia Seafood", unitCost: 8.80, leadTimeDays: 1, minOrderQty: 8, lastUpdated: "2026-03-20" },
    ]},
  { id: "inv-2", name: "Jasmine Rice", nameZh: "茉莉香米", category: "Grains", unit: "kg", currentStock: 80, minStock: 20, maxStock: 200, costPerUnit: 2.80, supplier: "Golden Grain Pte", lastRestocked: "2026-03-25", dailyUsageAvg: 25,
    supplierPrices: [
      { supplier: "Golden Grain Pte", unitCost: 2.80, leadTimeDays: 2, minOrderQty: 50, lastUpdated: "2026-03-25" },
      { supplier: "Rice King SG", unitCost: 3.00, leadTimeDays: 1, minOrderQty: 25, lastUpdated: "2026-03-22" },
    ]},
  { id: "inv-3", name: "Laksa Paste", nameZh: "叻沙酱", category: "Sauces", unit: "jar", currentStock: 12, minStock: 5, maxStock: 30, costPerUnit: 6.00, supplier: "Spice World", dailyUsageAvg: 3,
    supplierPrices: [
      { supplier: "Spice World", unitCost: 6.00, leadTimeDays: 3, minOrderQty: 10, lastUpdated: "2026-03-20" },
      { supplier: "Prima Taste", unitCost: 6.50, leadTimeDays: 2, minOrderQty: 5, lastUpdated: "2026-03-18" },
    ]},
  { id: "inv-4", name: "Tiger Prawns", nameZh: "虎虾", category: "Seafood", unit: "kg", currentStock: 5, minStock: 8, maxStock: 25, costPerUnit: 28.00, supplier: "Ocean Fresh", lastRestocked: "2026-03-27", dailyUsageAvg: 4,
    supplierPrices: [
      { supplier: "Ocean Fresh", unitCost: 28.00, leadTimeDays: 1, minOrderQty: 5, lastUpdated: "2026-03-27" },
      { supplier: "Hai Sia Seafood", unitCost: 26.50, leadTimeDays: 1, minOrderQty: 10, lastUpdated: "2026-03-25" },
      { supplier: "SeaFresh SG", unitCost: 29.00, leadTimeDays: 2, minOrderQty: 3, lastUpdated: "2026-03-20" },
    ]},
  { id: "inv-5", name: "Coconut Milk", nameZh: "椰浆", category: "Dairy", unit: "can", currentStock: 40, minStock: 15, maxStock: 60, costPerUnit: 2.20, supplier: "Kara Foods", dailyUsageAvg: 6 },
  { id: "inv-6", name: "Bean Sprouts", nameZh: "豆芽", category: "Vegetables", unit: "kg", currentStock: 8, minStock: 5, maxStock: 20, costPerUnit: 1.50, supplier: "Fresh Farms SG", lastRestocked: "2026-03-29", dailyUsageAvg: 5 },
  { id: "inv-7", name: "Egg Noodles", nameZh: "蛋面", category: "Grains", unit: "kg", currentStock: 15, minStock: 8, maxStock: 40, costPerUnit: 3.20, supplier: "Golden Grain Pte", dailyUsageAvg: 7 },
  { id: "inv-8", name: "Pork Belly", nameZh: "五花肉", category: "Proteins", unit: "kg", currentStock: 18, minStock: 10, maxStock: 35, costPerUnit: 12.00, supplier: "Fresh Farms SG", dailyUsageAvg: 6,
    supplierPrices: [
      { supplier: "Fresh Farms SG", unitCost: 12.00, leadTimeDays: 1, minOrderQty: 10, lastUpdated: "2026-03-28" },
      { supplier: "Quality Meats", unitCost: 13.50, leadTimeDays: 2, minOrderQty: 5, lastUpdated: "2026-03-24" },
    ]},
  { id: "inv-9", name: "Sambal Chili", nameZh: "参巴辣椒", category: "Sauces", unit: "jar", currentStock: 3, minStock: 5, maxStock: 20, costPerUnit: 4.50, supplier: "Spice World", dailyUsageAvg: 2 },
  { id: "inv-10", name: "Pandan Leaves", nameZh: "班兰叶", category: "Herbs", unit: "bunch", currentStock: 20, minStock: 5, maxStock: 30, costPerUnit: 1.00, supplier: "Fresh Farms SG", dailyUsageAvg: 3 },
  { id: "inv-11", name: "Sesame Oil", nameZh: "麻油", category: "Oils", unit: "bottle", currentStock: 10, minStock: 4, maxStock: 15, costPerUnit: 5.50, supplier: "Spice World", dailyUsageAvg: 1 },
  { id: "inv-12", name: "Soy Sauce", nameZh: "酱油", category: "Sauces", unit: "bottle", currentStock: 8, minStock: 5, maxStock: 20, costPerUnit: 3.80, supplier: "Kikkoman", dailyUsageAvg: 2 },
  { id: "inv-13", name: "Crab Meat", nameZh: "蟹肉", category: "Seafood", unit: "kg", currentStock: 3, minStock: 5, maxStock: 15, costPerUnit: 45.00, supplier: "Ocean Fresh", dailyUsageAvg: 2,
    supplierPrices: [
      { supplier: "Ocean Fresh", unitCost: 45.00, leadTimeDays: 1, minOrderQty: 3, lastUpdated: "2026-03-27" },
      { supplier: "Hai Sia Seafood", unitCost: 42.00, leadTimeDays: 1, minOrderQty: 5, lastUpdated: "2026-03-26" },
    ]},
  { id: "inv-14", name: "Kangkong", nameZh: "空心菜", category: "Vegetables", unit: "kg", currentStock: 6, minStock: 3, maxStock: 15, costPerUnit: 2.00, supplier: "Fresh Farms SG", dailyUsageAvg: 4 },
  { id: "inv-15", name: "Tiger Beer", nameZh: "虎牌啤酒", category: "Beverages", unit: "carton", currentStock: 15, minStock: 5, maxStock: 30, costPerUnit: 38.00, supplier: "APB SG", dailyUsageAvg: 3 },
  { id: "inv-16", name: "Condensed Milk", nameZh: "炼乳", category: "Dairy", unit: "can", currentStock: 25, minStock: 10, maxStock: 40, costPerUnit: 2.50, supplier: "F&N", dailyUsageAvg: 4 },
  { id: "inv-17", name: "Fish Cake", nameZh: "鱼饼", category: "Proteins", unit: "pack", currentStock: 12, minStock: 6, maxStock: 25, costPerUnit: 4.00, supplier: "Fresh Farms SG", dailyUsageAvg: 3 },
  { id: "inv-18", name: "Tapioca Starch", nameZh: "木薯淀粉", category: "Grains", unit: "kg", currentStock: 7, minStock: 3, maxStock: 15, costPerUnit: 2.00, supplier: "Golden Grain Pte", dailyUsageAvg: 1 },
  { id: "inv-19", name: "Lemongrass", nameZh: "香茅", category: "Herbs", unit: "bunch", currentStock: 10, minStock: 4, maxStock: 20, costPerUnit: 1.20, supplier: "Fresh Farms SG", dailyUsageAvg: 2 },
  { id: "inv-20", name: "Cooking Oil", nameZh: "食用油", category: "Oils", unit: "bottle", currentStock: 12, minStock: 5, maxStock: 20, costPerUnit: 6.00, supplier: "Knife Brand", dailyUsageAvg: 2 },
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

export function toggleSoldOut(itemId: string) {
  inventory = inventory.map(i => i.id === itemId ? { ...i, soldOut: !i.soldOut } : i);
  emit();
}

export function getInventoryAlerts(): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  inventory.forEach(item => {
    if (item.currentStock <= item.minStock) {
      alerts.push({
        id: `alert-low-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        type: "low_stock",
        message: `${item.name} is below minimum (${item.currentStock}/${item.minStock} ${item.unit})`,
        suggestedAction: "Mark as sold out in QR ordering, reorder from supplier",
      });
    }
    if (item.currentStock >= item.maxStock * 0.9) {
      alerts.push({
        id: `alert-over-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        type: "overstock",
        message: `${item.name} near max capacity (${item.currentStock}/${item.maxStock} ${item.unit})`,
        suggestedAction: "Consider running a promotion to move excess stock",
      });
    }
  });
  return alerts;
}

export function getDailyCOGS(): { totalCOGS: number; cogsPercent: number; breakdown: { name: string; dailyCost: number }[] } {
  const breakdown = inventory
    .filter(i => i.dailyUsageAvg && i.dailyUsageAvg > 0)
    .map(i => ({
      name: i.name,
      dailyCost: Math.round((i.dailyUsageAvg || 0) * i.costPerUnit * 100) / 100,
    }))
    .sort((a, b) => b.dailyCost - a.dailyCost);
  
  const totalCOGS = Math.round(breakdown.reduce((s, b) => s + b.dailyCost, 0) * 100) / 100;
  // Assume daily revenue ~$16k for mock
  const dailyRevenue = 16234.50;
  const cogsPercent = Math.round(totalCOGS / dailyRevenue * 10000) / 100;
  
  return { totalCOGS, cogsPercent, breakdown };
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
