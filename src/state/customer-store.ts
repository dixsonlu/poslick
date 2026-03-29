import { useSyncExternalStore } from "react";
import type { Customer } from "@/data/mock-data";

export interface EnhancedCustomer extends Customer {
  birthday?: string;
  segment: "new" | "regular" | "vip" | "at_risk";
  totalSpent: number;
  avgOrderValue: number;
  notes?: string;
  tags?: string[];
  joinedAt: string;
}

const mockCustomers: EnhancedCustomer[] = [
  { id: "c1", name: "Tan Wei Ming", phone: "+65 9123 4567", email: "weiming@email.com", visits: 45, points: 2250, tier: "platinum", lastVisit: "2026-03-28", birthday: "1988-06-15", segment: "vip", totalSpent: 3850, avgOrderValue: 85.56, joinedAt: "2024-01-15", tags: ["birthday-june", "seafood-lover"] },
  { id: "c2", name: "Sarah Lim", phone: "+65 8234 5678", email: "sarah.lim@gmail.com", visits: 28, points: 1400, tier: "gold", lastVisit: "2026-03-25", segment: "regular", totalSpent: 2100, avgOrderValue: 75, joinedAt: "2024-06-20", tags: ["vegetarian"] },
  { id: "c3", name: "Ahmad bin Hassan", phone: "+65 9345 6789", visits: 12, points: 600, tier: "silver", lastVisit: "2026-03-20", segment: "regular", totalSpent: 890, avgOrderValue: 74.17, joinedAt: "2025-01-10" },
  { id: "c4", name: "Lisa Chen", phone: "+65 8456 7890", email: "lisa.c@hotmail.com", visits: 5, points: 250, tier: "bronze", lastVisit: "2026-02-15", segment: "at_risk", totalSpent: 320, avgOrderValue: 64, joinedAt: "2025-08-01", notes: "Hasn't visited in 6 weeks" },
  { id: "c5", name: "Raj Kumar", phone: "+65 9567 8901", email: "raj.k@work.com", visits: 62, points: 3100, tier: "platinum", lastVisit: "2026-03-29", birthday: "1985-11-22", segment: "vip", totalSpent: 5200, avgOrderValue: 83.87, joinedAt: "2023-09-05", tags: ["corporate", "spicy-preference"] },
  { id: "c6", name: "Michelle Wong", phone: "+65 8678 9012", visits: 3, points: 150, tier: "bronze", lastVisit: "2026-03-27", segment: "new", totalSpent: 180, avgOrderValue: 60, joinedAt: "2026-03-01" },
  { id: "c7", name: "David Ong", phone: "+65 9789 0123", email: "david.ong@email.com", visits: 35, points: 1750, tier: "gold", lastVisit: "2026-03-22", segment: "regular", totalSpent: 2800, avgOrderValue: 80, joinedAt: "2024-04-12", tags: ["group-dining"] },
  { id: "c8", name: "Nurul Aisyah", phone: "+65 8890 1234", visits: 8, points: 400, tier: "silver", lastVisit: "2026-01-10", segment: "at_risk", totalSpent: 560, avgOrderValue: 70, joinedAt: "2025-05-20", notes: "Prefers halal options" },
];

let customers = [...mockCustomers];
let listeners = new Set<() => void>();
function emit() { listeners.forEach(fn => fn()); }

export function getCustomers() { return customers; }

export function useCustomers() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getCustomers);
}

export function updateCustomerNotes(id: string, notes: string) {
  customers = customers.map(c => c.id === id ? { ...c, notes } : c);
  emit();
}

export function getSegmentCounts() {
  const counts = { new: 0, regular: 0, vip: 0, at_risk: 0 };
  customers.forEach(c => counts[c.segment]++);
  return counts;
}
