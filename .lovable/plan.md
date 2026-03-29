

# Fix Drag Handles to Match Lovable's Style

## What the user wants
The screenshot shows Lovable's own panel divider: a thin (~2px) vertical line in **primary blue color**, spanning the full height. No wide handles, no gradients — just a clean, slim blue divider line with the existing pill capsule kept for visual identification.

## Current state
- `w-px bg-border` (1px, gray border color) with a centered pill overlay
- Pill: `w-1.5 h-10 rounded-full bg-border`

## Changes

**File: `src/pages/TabletPOS.tsx`** (lines 378-384 and 413-419)

Both drag handles:
- Change from `w-px bg-border` to `w-[2px] bg-primary` — thin blue line like Lovable's divider
- Keep the pill capsule but update its color to match: `bg-primary/40 hover:bg-primary`
- Keep `cursor-col-resize`, `relative z-10`, and existing drag event handlers unchanged

Result: A 2px primary-blue vertical line with a subtle pill indicator at center — matching Lovable's own panel resizer aesthetic.

