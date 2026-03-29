import { useSyncExternalStore } from "react";

export type QueueStatus = "waiting" | "called" | "seated" | "no_show";

export interface QueueEntry {
  id: string;
  partyName: string;
  partySize: number;
  phone?: string;
  status: QueueStatus;
  joinedAt: string;
  calledAt?: string;
  seatedAt?: string;
  notes?: string;
  preferredZone?: string;
}

const mockQueue: QueueEntry[] = [
  { id: "q1", partyName: "Tan Family", partySize: 4, phone: "+65 9123 4567", status: "waiting", joinedAt: "2026-03-29T11:30:00Z", preferredZone: "Main Hall" },
  { id: "q2", partyName: "Mr. Lee", partySize: 2, status: "waiting", joinedAt: "2026-03-29T11:35:00Z" },
  { id: "q3", partyName: "Wong Party", partySize: 6, phone: "+65 8234 5678", status: "called", joinedAt: "2026-03-29T11:20:00Z", calledAt: "2026-03-29T11:40:00Z", preferredZone: "Private" },
  { id: "q4", partyName: "Ahmad", partySize: 3, status: "seated", joinedAt: "2026-03-29T11:10:00Z", calledAt: "2026-03-29T11:25:00Z", seatedAt: "2026-03-29T11:28:00Z" },
  { id: "q5", partyName: "Sarah & Friends", partySize: 5, status: "no_show", joinedAt: "2026-03-29T10:50:00Z", calledAt: "2026-03-29T11:15:00Z" },
];

let queue = [...mockQueue];
let listeners = new Set<() => void>();
function emit() { listeners.forEach(fn => fn()); }

export function getQueue() { return queue; }

export function useQueue() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getQueue);
}

export function addToQueue(entry: Omit<QueueEntry, "id" | "status" | "joinedAt">) {
  queue = [...queue, { ...entry, id: `q-${Date.now()}`, status: "waiting", joinedAt: new Date().toISOString() }];
  emit();
}

export function callNext() {
  const waiting = queue.filter(q => q.status === "waiting").sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  if (waiting.length === 0) return null;
  const next = waiting[0];
  queue = queue.map(q => q.id === next.id ? { ...q, status: "called" as const, calledAt: new Date().toISOString() } : q);
  emit();
  return next;
}

export function seatEntry(id: string) {
  queue = queue.map(q => q.id === id ? { ...q, status: "seated" as const, seatedAt: new Date().toISOString() } : q);
  emit();
}

export function markNoShow(id: string) {
  queue = queue.map(q => q.id === id ? { ...q, status: "no_show" as const } : q);
  emit();
}

export function removeFromQueue(id: string) {
  queue = queue.filter(q => q.id !== id);
  emit();
}

export function getWaitingCount() {
  return queue.filter(q => q.status === "waiting").length;
}

export function getAverageWaitTime() {
  const seated = queue.filter(q => q.status === "seated" && q.seatedAt);
  if (seated.length === 0) return 0;
  const totalMinutes = seated.reduce((sum, q) => {
    const wait = (new Date(q.seatedAt!).getTime() - new Date(q.joinedAt).getTime()) / 60000;
    return sum + wait;
  }, 0);
  return Math.round(totalMinutes / seated.length);
}
