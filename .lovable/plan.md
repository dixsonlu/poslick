

# Tablet POS & Admin Promotions Fixes

## 1. Drag Handle: Pill-style instead of wide column
Replace the current `w-3` drag handle divs with a thin divider line (`w-px border`) that has a centered pill element (rounded capsule, ~6px wide x 40px tall, like the uploaded screenshot). Remove the `GripVertical` icon and extra padding.

**File**: `src/pages/TabletPOS.tsx`
- Left handle (line ~374-382): Change from `w-3` div with `GripVertical` to `w-px` border with absolute-positioned pill capsule centered on it
- Right handle (line ~409-416): Same treatment
- Pill style: `w-1.5 h-10 rounded-full bg-border hover:bg-primary` centered via `absolute left-1/2 -translate-x-1/2`

## 2. Align top borders of all 3 panels
Currently FloorPanel, MenuComposer, and CheckPanel headers sit at different heights. Fix by ensuring all three panels have the same top structure:
- FloorPanel header, MenuComposer header, and CheckPanel controls bar should all use the same `border-b border-border` and consistent padding/height
- Remove any extra top padding or margins that cause misalignment
- All three panels' first `border-b` row should be at the same vertical position

**Files**: `src/components/tablet/FloorPanel.tsx`, `src/components/tablet/MenuComposer.tsx`, `src/pages/TabletPOS.tsx` (right panel controls bar)

## 3. Fix drag constraints: each panel max 1/3
Currently `MIN_PANEL_FRAC = 1/6` and `MAX_PANEL_FRAC = 1/3` which is correct, but the middle panel can become less than 1/3 because both side panels can be 1/3 simultaneously (1/3 + 1/3 = 2/3, leaving only 1/3 for middle -- that's actually correct). The user says middle is getting less than 1/3 -- this is likely because the drag handle itself takes `w-3` (12px each = 24px total) eating into middle space. With the pill redesign (w-px), this is solved. Also verify the calculation doesn't allow both sides to exceed 1/3 combined.

## 4. MenuComposer responsive grid columns
Currently hardcoded `grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`. Change to use CSS container queries or calculate columns based on available width. Use `auto-fill` with `minmax` to auto-adapt:

**File**: `src/components/tablet/MenuComposer.tsx` (line 124)
- Replace fixed breakpoint grid with: `grid` + `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`

## 5. Restore Promotions page "Create Promotion" button and Quick Create cards
The original shoppos had a `+ Create Promotion` button in the header and Quick Create template cards. When we added the Tabs (Promotions / Dynamic Pricing), we removed them. Restore:

**File**: `src/pages/admin/AdminPromotions.tsx`
- Add `+ Create Promotion` button back in the header (line ~266-271)
- Add Quick Create template cards section (QUICK CREATE label + 4 cards) above the filters in the `PromotionsListView` component, between KPI cards and filters

## 6. Payment Sheet: Add Card/Cash/QR flow from unipos
Replace the current simple PaymentSheet with the unipos version that has:
- 3 payment method tabs: Card (CreditCard icon), Cash (Banknote icon), QR (QrCode icon)
- Card: no sub-selection of Visa/Mastercard (remove cardTypes selector), just show "Tap, insert or swipe" instruction
- Cash: numpad for entering cash amount, quick amount buttons ($10/$20/$50/$100), change calculation
- QR: sub-options Alipay/WeChat Pay/PayNow, "Scan QR" instruction
- Pay button uses `variant="pay"` (uniweb blue via `--pos-pay` CSS var)

**File**: `src/components/tablet/PaymentSheet.tsx` - Full rewrite

## 7. Pay button in CheckPanel uses uniweb blue
The Pay button in CheckPanel already uses `variant="pay"` (line 341-342), which maps to `bg-pos-pay`. Verify `--pos-pay` CSS variable is set to the uniweb blue color. If not, update in `src/index.css`.

**File**: `src/index.css` - Verify/update `--pos-pay` variable

## Technical Summary
- **TabletPOS.tsx**: Pill drag handles, remove `GripVertical` import, `w-px` dividers
- **MenuComposer.tsx**: `auto-fill minmax` grid
- **PaymentSheet.tsx**: Full rewrite with card/cash/QR tabs, no card brand selection, numpad for cash
- **AdminPromotions.tsx**: Restore Create button + Quick Create cards
- **CheckPanel.tsx**: Ensure pay button uses `variant="pay"`
- **FloorPanel.tsx + MenuComposer.tsx**: Align header heights

