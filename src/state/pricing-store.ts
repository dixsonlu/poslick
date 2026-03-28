import { useSyncExternalStore } from "react";

export interface PricingStrategy {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  targetCategories: string[]; // e.g. ["Alcohol", "All"]
  targetItemIds: string[]; // optional specific items
  timeStart: string; // "15:00"
  timeEnd: string; // "17:00"
  weekdays: string[]; // ["Mon","Tue","Wed","Thu"]
  dateStart?: string; // "2026-01-01"
  dateEnd?: string; // "2026-12-31"
  combinable: boolean;
}

// Sample strategies
const initialStrategies: PricingStrategy[] = [
  {
    id: "ps1",
    name: "Happy Hour Drinks 50% Off",
    enabled: true,
    priority: 1,
    discountType: "percentage",
    discountValue: 50,
    targetCategories: ["Alcohol"],
    targetItemIds: [],
    timeStart: "17:00",
    timeEnd: "20:00",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    combinable: false,
  },
  {
    id: "ps2",
    name: "Weekday Afternoon 20% Off",
    enabled: true,
    priority: 2,
    discountType: "percentage",
    discountValue: 20,
    targetCategories: ["All"],
    targetItemIds: [],
    timeStart: "15:00",
    timeEnd: "17:00",
    weekdays: ["Mon", "Tue", "Wed", "Thu"],
    combinable: false,
  },
  {
    id: "ps3",
    name: "Weekend Brunch $3 Off Mains",
    enabled: false,
    priority: 3,
    discountType: "fixed",
    discountValue: 3,
    targetCategories: ["Mains"],
    targetItemIds: [],
    timeStart: "10:00",
    timeEnd: "14:00",
    weekdays: ["Sat", "Sun"],
    combinable: true,
  },
];

type Listener = () => void;
let strategiesState: PricingStrategy[] = [...initialStrategies];
const listeners = new Set<Listener>();

const emitChange = () => listeners.forEach(l => l());
const subscribe = (l: Listener) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => strategiesState;

export const usePricingStrategies = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const getPricingStrategiesSnapshot = () => strategiesState;

export const addPricingStrategy = (s: PricingStrategy) => {
  strategiesState = [...strategiesState, s];
  emitChange();
};

export const updatePricingStrategy = (id: string, updates: Partial<PricingStrategy>) => {
  strategiesState = strategiesState.map(s => s.id === id ? { ...s, ...updates } : s);
  emitChange();
};

export const deletePricingStrategy = (id: string) => {
  strategiesState = strategiesState.filter(s => s.id !== id);
  emitChange();
};

// Check which strategies are currently active
export const getActiveStrategies = (): PricingStrategy[] => {
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return strategiesState.filter(s => {
    if (!s.enabled) return false;
    if (s.weekdays.length > 0 && !s.weekdays.includes(currentDay)) return false;
    if (s.timeStart && s.timeEnd && (currentTime < s.timeStart || currentTime > s.timeEnd)) return false;
    if (s.dateStart && now.toISOString().slice(0, 10) < s.dateStart) return false;
    if (s.dateEnd && now.toISOString().slice(0, 10) > s.dateEnd) return false;
    return true;
  });
};

// Get discount for a specific item
export const getItemDiscount = (
  itemPrice: number,
  itemCategory: string,
  itemId: string,
): { discountedPrice: number; strategyName: string } | null => {
  const active = getActiveStrategies();
  if (active.length === 0) return null;

  // Sort by priority, apply highest priority that matches
  const sorted = [...active].sort((a, b) => a.priority - b.priority);
  
  for (const s of sorted) {
    const categoryMatch = s.targetCategories.includes("All") || s.targetCategories.includes(itemCategory);
    const itemMatch = s.targetItemIds.length === 0 || s.targetItemIds.includes(itemId);
    
    if (categoryMatch && itemMatch) {
      const discount = s.discountType === "percentage"
        ? itemPrice * (s.discountValue / 100)
        : Math.min(s.discountValue, itemPrice);
      return {
        discountedPrice: Math.max(0, itemPrice - discount),
        strategyName: s.name,
      };
    }
  }
  return null;
};

// Check for conflicts between non-combinable strategies
export const detectConflicts = (): { strategy1: string; strategy2: string; reason: string }[] => {
  const conflicts: { strategy1: string; strategy2: string; reason: string }[] = [];
  const enabled = strategiesState.filter(s => s.enabled && !s.combinable);

  for (let i = 0; i < enabled.length; i++) {
    for (let j = i + 1; j < enabled.length; j++) {
      const a = enabled[i];
      const b = enabled[j];

      // Check weekday overlap
      const dayOverlap = a.weekdays.some(d => b.weekdays.includes(d));
      if (!dayOverlap) continue;

      // Check time overlap
      const timeOverlap = a.timeStart < b.timeEnd && b.timeStart < a.timeEnd;
      if (!timeOverlap) continue;

      // Check category overlap
      const catOverlap =
        a.targetCategories.includes("All") ||
        b.targetCategories.includes("All") ||
        a.targetCategories.some(c => b.targetCategories.includes(c));
      if (!catOverlap) continue;

      conflicts.push({
        strategy1: a.name,
        strategy2: b.name,
        reason: `Time overlap on shared days with overlapping categories`,
      });
    }
  }
  return conflicts;
};
