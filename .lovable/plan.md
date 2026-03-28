

# ShopPOS Iteration Plan

## Overview
Import the shoppos GitHub repository code into this project, then implement 6 feature improvements across the Tablet POS and Admin sections.

## Step 1: Import shoppos codebase
Copy all source files from `https://github.com/dixsonlv/shoppos` into the current project. This includes:
- `src/pages/` (TabletPOS, MobilePOS, admin pages)
- `src/components/` (tablet/, mobile/, ThemeToggle)
- `src/data/mock-data.ts`, `src/state/menu-store.ts`, `src/hooks/useLanguage.ts`
- `src/assets/` (all food images, logo)
- `src/App.tsx` with all routes
- `src/index.css` with custom theme variables
- Dependencies: `next-themes`

## Step 2: Fix Tablet POS History button overlap
**Problem**: The History button in `TabletPOS.tsx` overlaps with the order panel content. It's positioned absolutely in the top-right corner.
**Solution**:
- Move the History button into the same row as the ThemeToggle and language switcher (top-right controls area)
- Align them at the same height
- Increase the History button width slightly to show full content (badge + text)
- Push the order content (CheckPanel / OrderHistory) down below the controls bar

## Step 3: Add resizable panel drag handles
**Problem**: Left (FloorPanel) and right (CheckPanel) panels have fixed widths.
**Solution**:
- Add a vertical drag handle (grip bar) on the right edge of FloorPanel and left edge of CheckPanel
- Use mouse/touch drag events to resize panels
- Constrain each panel to min 1/6 and max 1/3 of screen width
- The middle MenuComposer panel fills the remaining space
- Store a simple width percentage in state; use `onMouseDown`/`onTouchStart` listeners

## Step 4: Add table reservation functionality
**Problem**: Clicking a "reserved" table does nothing useful -- it doesn't create an order or allow seating.
**Solution**:
- In `FloorPanel.tsx`, when a reserved table is selected, show a "Seat Guests" action button
- Clicking "Seat Guests" changes the table status from `reserved` to `ordering` and creates a new order
- Add a "Reserve Table" action for available tables (set status to `reserved`, optionally set guest count and time)
- Add a reservation dialog with guest count, reservation time, and customer name fields

## Step 5: Fix Combo editing and display in Admin Menu
**Problem**: The `AdminMenu.tsx` Combos tab only shows basic info -- cannot edit combo groups, view combo details, or manage allowed items.
**Solution** (reference: unipos.lovable.app/admin/menu Combos tab):
- In the Combos tab, display each combo as an expanded card showing:
  - Combo image, name, COMBO badge, price, status, edit button
  - Below the card: combo group panels in a horizontal row (MAIN, SIDE, DRINK, etc.)
  - Each group shows: group name, "Required / max N", list of allowed items with thumbnails
- In the combo editor (right panel), add a "Combo Groups" section:
  - Add/remove combo groups
  - For each group: name, nameZh, required toggle, maxSelect number
  - Searchable item picker to add/remove allowed items from each group
- Wire up `updateMenuItemInStore` to save `comboGroups` changes

## Step 6: Add Dynamic Pricing Strategies
**Problem**: No time-based or conditional pricing rules exist.
**Solution**:
- Create a new data model `PricingStrategy` with fields:
  - `id`, `name`, `enabled`, `priority`
  - `discountType` (percentage/fixed), `discountValue`
  - `targetCategories` (e.g., ["Alcohol", "All"])
  - `targetItemIds` (optional specific items)
  - `timeStart`, `timeEnd` (e.g., "15:00" - "17:00")
  - `weekdays` (e.g., ["Mon","Tue","Wed","Thu"])
  - `dateStart`, `dateEnd` (validity period)
  - `combinable` (boolean -- whether this can stack with other strategies)
- Add a "Dynamic Pricing" section in `AdminPromotions.tsx` (or a new admin page)
  - List of pricing strategies with enable/disable toggles
  - Create/edit form with all fields above
  - Conflict detection: warn when non-combinable strategies overlap in time
- Apply pricing in the POS:
  - In `TabletPOS.tsx` `recalcOrder`, check active strategies against current time/day
  - Show discounted prices with strikethrough original price in `MenuComposer`
  - Show applied strategy name on order items in `CheckPanel`

## Technical Details

### Files to create/modify:
- **Copy from GitHub**: ~30+ files across src/pages, src/components, src/data, src/state, src/hooks, src/assets
- **TabletPOS.tsx**: Restructure top-right controls, add resize state, add reservation handlers
- **FloorPanel.tsx**: Add reserve/seat-guests actions
- **AdminMenu.tsx**: Redesign Combos tab with expanded cards and group display; add combo group editor
- **AdminPromotions.tsx** (or new file): Add dynamic pricing strategy CRUD
- **mock-data.ts**: Add `PricingStrategy` type and sample data
- **menu-store.ts**: Add pricing strategy store

### Dependencies:
- `next-themes` (already used in shoppos)
- No new external dependencies needed; resizable panels will use native drag events

