import { useSyncExternalStore } from "react";

export interface FloorTable {
  id: string;
  number: string;
  x: number; // grid column
  y: number; // grid row
  width: number; // grid span
  height: number; // grid span
  seats: number;
  shape: "square" | "round" | "rectangle";
  zone: string;
  rotation?: number;
}

export interface FloorZone {
  id: string;
  name: string;
  color: string; // HSL CSS variable key
}

const defaultZones: FloorZone[] = [
  { id: "z1", name: "Main Hall", color: "primary" },
  { id: "z2", name: "Patio", color: "status-green" },
  { id: "z3", name: "Private", color: "status-amber" },
  { id: "z4", name: "Bar", color: "destructive" },
];

const defaultTables: FloorTable[] = [
  { id: "ft-1", number: "1", x: 0, y: 0, width: 1, height: 1, seats: 2, shape: "square", zone: "Main Hall" },
  { id: "ft-2", number: "2", x: 2, y: 0, width: 1, height: 1, seats: 4, shape: "round", zone: "Main Hall" },
  { id: "ft-3", number: "3", x: 4, y: 0, width: 2, height: 1, seats: 6, shape: "rectangle", zone: "Main Hall" },
  { id: "ft-4", number: "4", x: 0, y: 2, width: 1, height: 1, seats: 2, shape: "round", zone: "Patio" },
  { id: "ft-5", number: "5", x: 2, y: 2, width: 1, height: 1, seats: 4, shape: "square", zone: "Patio" },
  { id: "ft-6", number: "6", x: 4, y: 2, width: 2, height: 1, seats: 8, shape: "rectangle", zone: "Private" },
  { id: "ft-7", number: "7", x: 0, y: 4, width: 1, height: 1, seats: 2, shape: "round", zone: "Bar" },
  { id: "ft-8", number: "8", x: 2, y: 4, width: 1, height: 1, seats: 2, shape: "square", zone: "Bar" },
];

let floorTables = [...defaultTables];
let zones = [...defaultZones];
let listeners = new Set<() => void>();
function emit() { listeners.forEach(fn => fn()); }

export function getFloorTables() { return floorTables; }
export function getFloorZones() { return zones; }

export function useFloorTables() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getFloorTables);
}
export function useFloorZones() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getFloorZones);
}

export function moveTable(id: string, x: number, y: number) {
  floorTables = floorTables.map(t => t.id === id ? { ...t, x, y } : t);
  emit();
}

export function addFloorTable(table: FloorTable) {
  floorTables = [...floorTables, table];
  emit();
}

export function removeFloorTable(id: string) {
  floorTables = floorTables.filter(t => t.id !== id);
  emit();
}

export function updateFloorTable(id: string, updates: Partial<FloorTable>) {
  floorTables = floorTables.map(t => t.id === id ? { ...t, ...updates } : t);
  emit();
}
