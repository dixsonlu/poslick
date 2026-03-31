

# UI Upgrade: Tailwind CSS Design Language for Uniweb Admin

## Design Analysis — Tailwind CSS Website

From the Tailwind site and docs, the key design characteristics:

1. **Typography**: `tracking-tighter` on headings, `text-balance` for hero text, clean hierarchy with generous line-height
2. **Sidebar**: Left border indicator (3px `border-l-primary`) for active nav item instead of full background fill; gray-50 hover state; uppercase section labels with wide tracking
3. **Color approach**: Very restrained — white surfaces, gray-50/100 subtle accents, gray-950 text; primary color used sparingly as accents (left borders, links, badges)
4. **Cards**: No colored kpi-stripe bars — instead, subtle `border` with generous padding, slight shadow (`shadow-sm`), rounded-xl
5. **Dark mode**: Deep slate-900/950 backgrounds, slate-800 cards, white/gray-200 text; borders become slate-700/800; transitions smooth via CSS
6. **Spacing**: Very generous — `p-8` page padding, `gap-6` grids, breathing room everywhere
7. **Animations**: Subtle fade-in on page load, hover transitions (150ms-200ms), no flashy effects
8. **Tables**: Clean with `divide-y`, no colored header backgrounds — just font-weight + uppercase + tracking
9. **Code blocks**: Dark navy `bg-gray-950` with syntax highlighting — applicable to our mono/ID elements

## What Changes

### 1. Sidebar Redesign (AdminLayout.tsx)
- Active nav: Replace `bg-primary text-primary-foreground` fill → `border-l-[3px] border-primary text-foreground font-semibold bg-transparent` (Tailwind docs style left-border indicator)
- Hover: `hover:bg-gray-50 dark:hover:bg-white/5` subtle tint
- Group labels: Add uppercase section dividers between nav groups (e.g., "OPERATIONS", "ANALYTICS", "SYSTEM")
- Remove merchant strip colored background → use plain text with a subtle divider
- Brand area: Slightly larger padding, cleaner spacing

### 2. Top Header Bar (AdminLayout.tsx)
- Reduce height to `h-14` (56px) for Tailwind-like density
- Remove page title from header (redundant — each page has its own h1)
- Keep only: breadcrumb trail (optional), ThemeToggle, Bell, Avatar
- Add subtle `shadow-sm` instead of `border-b` for depth

### 3. Color Token Refinement (index.css)
- Light mode: Shift `--background` from warm `36 14% 95%` to neutral `0 0% 98%` (closer to Tailwind gray-50)
- `--card`: Keep `0 0% 100%` (pure white)
- `--border`: Shift to `0 0% 90%` (neutral gray-200 feel)
- `--muted-foreground`: `0 0% 45%` (gray-500 equivalent)
- Dark mode: Shift to deeper slate tones — `--background: 222 47% 6%`, `--card: 222 47% 9%`
- Keep Uniweb primary blue `221 63% 33%` unchanged — just use it more sparingly

### 4. KPI Cards Refinement (all admin pages)
- Remove `kpi-stripe` colored top bar → replace with a small colored dot or icon tint
- Use `shadow-sm hover:shadow-md transition-shadow` for depth instead of stripe
- Larger values text with `tracking-tighter`
- Change badges to pill-style: `rounded-full px-2.5 py-0.5 text-[11px]`

### 5. Table Styling (index.css + all admin pages)
- Remove `.table-header` colored/bold uppercase approach
- New style: `text-xs font-medium text-muted-foreground` headers, simple `divide-y` rows
- Hover: `hover:bg-muted/50` (very subtle)
- Remove explicit `border-b` per row → use `divide-y divide-border` on tbody

### 6. Page Layout Pattern (all admin pages)
- Increase page padding from `p-7` to `p-8`
- Page title: `text-2xl font-bold tracking-tight` (already close, keep)
- Subtitle: `text-sm text-muted-foreground` (increase from 13px)
- Grid gaps: `gap-6` instead of `gap-4`

### 7. Button & Badge Refinement
- Primary buttons: `rounded-lg` (already done), add `shadow-sm`
- Outline buttons: `border-border hover:bg-muted` (already close)
- Status badges: Move to pill shape `rounded-full` with lighter backgrounds

### 8. Animation & Transitions
- Page enter: Keep existing `fadeUp` but adjust to `0.2s` (snappier)
- Card hover: Add `transition-all duration-150` for shadow/border changes
- Sidebar nav: `transition-colors duration-150`

### 9. Scrollbar Update (index.css)
- Already hidden by default per A2 plan — keep that
- When visible: Use very thin (3px) neutral thumb, no track

### 10. uniweb-card Class Update (index.css)
- Add `shadow-sm` to base `.uniweb-card` definition
- Remove `border-[1.5px]` → use standard `border`
- Add `hover:shadow-md transition-shadow duration-150` as optional `.uniweb-card-interactive`

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Color tokens (light+dark), `.uniweb-card`, `.table-header`, `.section-label`, `.status-badge`, scrollbar, page-enter timing |
| `src/pages/admin/AdminLayout.tsx` | Sidebar nav with left-border active style, section group labels, remove header page title, add shadow |
| `src/pages/admin/AdminDashboard.tsx` | Remove kpi-stripe, use shadow cards, increase gaps/padding |
| `src/pages/admin/AdminFinance.tsx` | Same card/table refinements |
| `src/pages/admin/AdminSales.tsx` | Same card/table refinements |
| `src/pages/admin/AdminStaff.tsx` | Table divide-y style |
| `src/pages/admin/AdminMenu.tsx` | Table/card refinements |
| `src/pages/admin/AdminSettings.tsx` | Card hover shadow style |
| `src/pages/admin/AdminCRM.tsx` | Card/table refinements |
| `src/pages/admin/AdminInventory.tsx` | Card/table refinements |
| `src/pages/admin/AdminPromotions.tsx` | Card/table refinements |
| `src/pages/admin/AdminKDS.tsx` | Card refinements |
| `src/pages/admin/AdminQueue.tsx` | Card/table refinements |
| `src/pages/admin/AdminFloorPlan.tsx` | Card refinements |
| `tailwind.config.ts` | No major changes needed — existing tokens are sufficient |

## Implementation Order

1. **Foundation**: Update `index.css` color tokens + utility classes (cards, tables, badges, animations)
2. **Sidebar**: Redesign `AdminLayout.tsx` with left-border nav and section groups
3. **Dashboard**: Apply new card/spacing pattern as reference page
4. **Remaining pages**: Apply consistent pattern across all admin pages
5. **Dark mode verification**: Ensure all tokens produce clean dark mode

## What Stays the Same
- Uniweb primary blue (`221 63% 33%`)
- DM Sans / DM Mono fonts
- Overall layout structure (sidebar + main content)
- All business logic and data
- TabletPOS and MobilePOS (this upgrade focuses on admin portal)

