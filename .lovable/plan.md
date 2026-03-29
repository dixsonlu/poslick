

# Complete Implementation Plan

This plan restores ALL previously approved items (A1–A4, B1–B6, C1–C4, D) and fixes the drag handle style.

---

## A1. Drag Handle — Lovable Style with Hover Gradient Highlight

**Problem**: Current handles are a constant 2px blue line — always highlighted, looks garish.

**Lovable's actual behavior**: Default state is a subtle 1px border-color divider with a small pill indicator. On hover/touch, the line highlights with a gradient that fades at both ends (top and bottom).

**File**: `src/pages/TabletPOS.tsx` (both handles ~line 378 and ~413)

Default state:
- `w-[2px] bg-border` — subtle gray divider, blends with panel borders
- Pill capsule: `w-1.5 h-10 rounded-full bg-border/60` — visible but quiet

Hover/active state (CSS-driven via group-hover):
- Wrap handle div with `group` class
- Add an overlay `<div>` inside using `absolute inset-0` with a vertical gradient: `bg-gradient-to-b from-transparent via-primary/50 to-transparent` with `opacity-0 group-hover:opacity-100 transition-opacity`
- Pill on hover: `group-hover:bg-primary`

This means: idle = normal divider line; touch/hover = blue gradient glow fading at top and bottom edges.

**File**: `src/index.css` — no changes needed (pure Tailwind approach)

---

## A2. Hide Scrollbars Until Hover

**File**: `src/index.css`
- Default: `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`
- On `.pos-scrollbar:hover`: restore `scrollbar-width: thin` + `::-webkit-scrollbar { display: block; width: 4px }`

---

## A3. Unified Header Heights

**Files**: `FloorPanel.tsx`, `MenuComposer.tsx`, `TabletPOS.tsx`
- All three panel headers → `h-[52px] flex items-center px-3 border-b border-border`

---

## A4. Order History List Layout

**File**: `src/components/tablet/history/OrderHistoryList.tsx`
- Order ID `#xxxx` → top-right absolute label
- Replace rigid grid with flex-wrap layout
- Add `overflow-hidden text-ellipsis`

---

## B1. Financial Calculations (2-decimal rounding)

**Files**: `TabletPOS.tsx`, `CheckPanel.tsx`, `MobilePOS.tsx`
- All money math: `Math.round(x * 100) / 100`
- Order: discount → svc charge (10%) → GST (9% of subtotal+svc)
- Split bill: equal division, remainder to last share

## B2. Order Lifecycle State Machine

**New file**: `src/lib/order-state-machine.ts`
- States: `open → sent → preparing → ready → served → paid`; `void` from any
- Void requires manager PIN
- `paid` → table status `dirty`
- Table cleaning: `dirty → cleaning → available`

## B3. Inventory Deduction Stub

**File**: `TabletPOS.tsx`
- On `sent` transition, call placeholder `deductInventory(order)`

## B4–B6. Discount→Payment, Transfer Sync, Split Bill fixes

As previously planned — pass `finalTotal` to PaymentSheet, sync order on transfer, enforce min 1 seat on split.

---

## C1. Inventory Management (`/admin/inventory`)

**New files**: `src/state/inventory-store.ts`, `src/pages/admin/AdminInventory.tsx`
- KPI cards, Stock List/Purchase Orders/Movement Log tabs
- Searchable table with stock-level progress bars
- Stock adjustment modal, PO creation form
- ~20 mock inventory items in `mock-data.ts`

## C2. Professional CRM Upgrade

**Files**: Expand `Customer` type in `mock-data.ts`, new `src/state/customer-store.ts`, rewrite `AdminCRM.tsx`
- KPI dashboard, segment filters, expandable detail panel
- Search, bulk actions, loyalty/birthday tracking

## C3. Floor Plan Editor (`/admin/floorplan`)

**New files**: `src/state/floorplan-store.ts`, `src/pages/admin/AdminFloorPlan.tsx`
- Grid canvas with pointer-event drag-and-drop
- Table shapes, zone management, snap-to-grid, preview mode

## C4. Queue Management (`/admin/queue` + `/queue`)

**New files**: `src/state/queue-store.ts`, `src/pages/admin/AdminQueue.tsx`, `src/pages/QueueKiosk.tsx`
- Queue board, walk-in form, call-next action
- Public kiosk at `/queue`

---

## D. Routes & Navigation

**File**: `App.tsx` — add `/admin/inventory`, `/admin/floorplan`, `/admin/queue`, `/queue`

**File**: `AdminLayout.tsx` — add sidebar items: Inventory (Package), Floor Plan (Map), Queue (ListOrdered)

---

## Implementation Order

1. Drag handle fix (A1) + scrollbar (A2) + header alignment (A3) + order history (A4)
2. Financial rounding (B1) + discount-payment fix (B4) + transfer sync (B5) + split bill (B6)
3. Order state machine (B2) + inventory stub (B3)
4. New stores (inventory, customer, floorplan, queue)
5. New pages (Inventory, CRM rewrite, FloorPlan, Queue + Kiosk)
6. Routes + navigation

