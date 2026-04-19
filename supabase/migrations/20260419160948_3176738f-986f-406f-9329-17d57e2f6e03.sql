
-- =============================================
-- BASE SCHEMA
-- =============================================
CREATE TYPE public.table_status AS ENUM ('available', 'reserved', 'ordering', 'ordered', 'dirty', 'cleaning');
CREATE TYPE public.service_mode AS ENUM ('dine-in', 'takeaway', 'delivery', 'pickup', 'buffet');
CREATE TYPE public.order_status AS ENUM ('open', 'sent', 'preparing', 'ready', 'served', 'paid', 'void');
CREATE TYPE public.kds_status AS ENUM ('new', 'preparing', 'ready', 'served');
CREATE TYPE public.customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.staff_role AS ENUM ('server', 'cashier', 'manager', 'kitchen');
CREATE TYPE public.inventory_category AS ENUM ('raw_ingredients', 'packaging', 'beverages', 'supplies');
CREATE TYPE public.inventory_unit AS ENUM ('kg', 'L', 'pcs', 'box', 'pack', 'bottle');
CREATE TYPE public.po_status AS ENUM ('draft', 'ordered', 'received', 'cancelled');
CREATE TYPE public.movement_type AS ENUM ('receive', 'waste', 'transfer', 'sale', 'adjustment');
CREATE TYPE public.queue_status AS ENUM ('waiting', 'called', 'seated', 'no_show', 'cancelled');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- 1. Restaurant Tables (with floor layout)
-- =============================================
CREATE TABLE public.restaurant_tables (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  zone TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 2,
  status public.table_status NOT NULL DEFAULT 'available',
  guest_count INTEGER,
  server TEXT,
  open_amount NUMERIC(10,2),
  elapsed_minutes INTEGER,
  order_id TEXT,
  merged_with TEXT[],
  reservation_name TEXT,
  reservation_phone TEXT,
  reservation_at TIMESTAMPTZ,
  reservation_notes TEXT,
  linked_customer_id TEXT,
  linked_customer_name TEXT,
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 100,
  height INTEGER NOT NULL DEFAULT 100,
  shape TEXT NOT NULL DEFAULT 'square' CHECK (shape IN ('round', 'square', 'rectangular', 'booth')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on restaurant_tables" ON public.restaurant_tables FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_restaurant_tables_zone ON public.restaurant_tables(zone);
CREATE INDEX idx_restaurant_tables_status ON public.restaurant_tables(status);

-- =============================================
-- 2. Menu Items + Modifiers + Combos
-- =============================================
CREATE TABLE public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  popular BOOLEAN NOT NULL DEFAULT false,
  is_combo BOOLEAN NOT NULL DEFAULT false,
  is_flex_combo BOOLEAN NOT NULL DEFAULT false,
  combo_includes TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(available);

CREATE TABLE public.modifier_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  multi_select BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on modifier_groups" ON public.modifier_groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.modifier_options (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_zh TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on modifier_options" ON public.modifier_options FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_modifier_options_group_id ON public.modifier_options(group_id);

CREATE TABLE public.menu_item_modifier_groups (
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  modifier_group_id TEXT NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, modifier_group_id)
);
ALTER TABLE public.menu_item_modifier_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on menu_item_modifier_groups" ON public.menu_item_modifier_groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.combo_groups (
  id TEXT PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_zh TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  max_select INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.combo_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on combo_groups" ON public.combo_groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.combo_group_items (
  combo_group_id TEXT NOT NULL REFERENCES public.combo_groups(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  PRIMARY KEY (combo_group_id, menu_item_id)
);
ALTER TABLE public.combo_group_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on combo_group_items" ON public.combo_group_items FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 3. Customers
-- =============================================
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  visits INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  tier public.customer_tier NOT NULL DEFAULT 'bronze',
  last_visit DATE,
  stored_balance NUMERIC NOT NULL DEFAULT 0,
  total_top_up NUMERIC NOT NULL DEFAULT 0,
  date_of_birth DATE,
  address TEXT,
  tags TEXT[] DEFAULT '{}',
  total_spend NUMERIC NOT NULL DEFAULT 0,
  average_ticket NUMERIC NOT NULL DEFAULT 0,
  preferred_items TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. Staff
-- =============================================
CREATE TABLE public.staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role public.staff_role NOT NULL,
  pin TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on staff_members" ON public.staff_members FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. Buffet plans (must come before orders FK)
-- =============================================
CREATE TABLE public.buffet_plans (
  id TEXT PRIMARY KEY DEFAULT ('bp-' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  name_zh TEXT,
  price_per_pax NUMERIC(10,2) NOT NULL CHECK (price_per_pax >= 0),
  time_slots JSONB DEFAULT '[]'::jsonb,
  included_categories JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  child_price NUMERIC(10,2),
  child_age_max INTEGER DEFAULT 12,
  service_charge_exempt BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.buffet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on buffet_plans" ON public.buffet_plans FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_buffet_plans_active ON public.buffet_plans(active) WHERE active = true;

-- =============================================
-- 6. Orders + Order Items + Modifiers
-- =============================================
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  table_id TEXT REFERENCES public.restaurant_tables(id),
  table_number TEXT,
  service_mode public.service_mode NOT NULL DEFAULT 'dine-in',
  status public.order_status NOT NULL DEFAULT 'open',
  guest_count INTEGER NOT NULL DEFAULT 1,
  customer_id TEXT REFERENCES public.customers(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  serve_together BOOLEAN NOT NULL DEFAULT false,
  payment_method TEXT DEFAULT 'card',
  buffet_plan_id TEXT REFERENCES public.buffet_plans(id),
  buffet_adults INTEGER DEFAULT 0,
  buffet_children INTEGER DEFAULT 0,
  buffet_subtotal NUMERIC(10,2) DEFAULT 0,
  buffet_started_at TIMESTAMPTZ,
  buffet_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_orders_table_id ON public.orders(table_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TABLE public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  seat INTEGER,
  status public.kds_status NOT NULL DEFAULT 'new',
  fired_at TIMESTAMPTZ,
  combo_items JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

CREATE TABLE public.order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id TEXT NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on order_item_modifiers" ON public.order_item_modifiers FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 7. Inventory
-- =============================================
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_zh TEXT,
  sku TEXT UNIQUE,
  category public.inventory_category NOT NULL DEFAULT 'raw_ingredients',
  unit public.inventory_unit NOT NULL DEFAULT 'pcs',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  reorder_point NUMERIC NOT NULL DEFAULT 10,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier TEXT NOT NULL,
  status public.po_status NOT NULL DEFAULT 'draft',
  expected_delivery DATE,
  notes TEXT,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0
);
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on purchase_order_items" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type public.movement_type NOT NULL,
  quantity NUMERIC NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on stock_movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_stock_movements_item ON public.stock_movements(inventory_item_id);

CREATE TABLE public.menu_item_ingredients (
  menu_item_id TEXT NOT NULL,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity_per_serving NUMERIC NOT NULL DEFAULT 1,
  PRIMARY KEY (menu_item_id, inventory_item_id)
);
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on menu_item_ingredients" ON public.menu_item_ingredients FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 8. Queue
-- =============================================
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_size INTEGER NOT NULL DEFAULT 2,
  customer_name TEXT,
  customer_phone TEXT,
  estimated_wait INTEGER NOT NULL DEFAULT 15,
  status public.queue_status NOT NULL DEFAULT 'waiting',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  called_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  notes TEXT,
  preferred_zone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on queue_entries" ON public.queue_entries FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_queue_entries_status ON public.queue_entries(status);

-- =============================================
-- 9. Membership tiers + wallet
-- =============================================
CREATE TABLE public.membership_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT,
  min_spend NUMERIC NOT NULL DEFAULT 0,
  min_visits INTEGER NOT NULL DEFAULT 0,
  discount_pct NUMERIC NOT NULL DEFAULT 0,
  top_up_bonus_pct NUMERIC NOT NULL DEFAULT 0,
  perks TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on membership_tiers" ON public.membership_tiers FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.member_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('top_up', 'bonus', 'payment', 'refund')),
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL DEFAULT 0,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.member_wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on member_wallet_transactions" ON public.member_wallet_transactions FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 10. Floor zones
-- =============================================
CREATE TABLE public.floor_zones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.floor_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on floor_zones" ON public.floor_zones FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_floor_zones_updated_at BEFORE UPDATE ON public.floor_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 11. Promotions
-- =============================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discount', 'bogo', 'gift', 'coupon', 'loyalty', 'happy_hour')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'scheduled', 'expired', 'draft')),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2),
  min_spend NUMERIC(10,2) DEFAULT 0,
  code TEXT UNIQUE,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  time_window_start TIME,
  time_window_end TIME,
  weekdays TEXT[] DEFAULT '{}',
  combinable BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  target_categories TEXT[] DEFAULT '{}',
  target_item_ids TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on promotions" ON public.promotions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_promotions_status ON public.promotions(status);
CREATE INDEX idx_promotions_type ON public.promotions(type);

-- =============================================
-- 12. Pricing strategies
-- =============================================
CREATE TABLE public.pricing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  target_categories TEXT[] DEFAULT '{}',
  target_item_ids TEXT[] DEFAULT '{}',
  time_start TIME,
  time_end TIME,
  weekdays TEXT[] DEFAULT '{}',
  date_start DATE,
  date_end DATE,
  combinable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pricing_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on pricing_strategies" ON public.pricing_strategies FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_pricing_strategies_updated_at BEFORE UPDATE ON public.pricing_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pricing_enabled ON public.pricing_strategies(enabled);

-- =============================================
-- 13. Merchant settings
-- =============================================
CREATE TABLE public.merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);
ALTER TABLE public.merchant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on merchant_settings" ON public.merchant_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_merchant_settings_updated_at BEFORE UPDATE ON public.merchant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.floor_zones;

-- =============================================
-- SEEDS
-- =============================================
INSERT INTO public.membership_tiers (id, name, name_zh, min_spend, min_visits, discount_pct, top_up_bonus_pct, perks, sort_order) VALUES
  ('tier-bronze', 'Bronze', '铜卡', 0, 0, 0, 0, '{"Welcome drink"}', 0),
  ('tier-silver', 'Silver', '银卡', 300, 5, 5, 3, '{"5% discount","Birthday treat"}', 1),
  ('tier-gold', 'Gold', '金卡', 1000, 15, 10, 5, '{"10% discount","Priority seating","Birthday treat"}', 2),
  ('tier-platinum', 'Platinum', '铂金卡', 3000, 30, 15, 8, '{"15% discount","VIP lounge","Dedicated server","Birthday treat"}', 3);

INSERT INTO public.floor_zones (id, name, sort_order) VALUES
  ('zone-main-hall', 'Main Hall', 1),
  ('zone-patio', 'Patio', 2),
  ('zone-private', 'Private', 3),
  ('zone-bar', 'Bar', 4);

INSERT INTO public.buffet_plans (id, name, name_zh, price_per_pax, time_slots, included_categories, duration_minutes, child_price, service_charge_exempt, sort_order) VALUES
  ('bp-weekday-lunch', 'Weekday Lunch Buffet', '工作日午市自助餐', 38.80,
   '[{"day":1,"start":"11:00","end":"14:30"},{"day":2,"start":"11:00","end":"14:30"},{"day":3,"start":"11:00","end":"14:30"},{"day":4,"start":"11:00","end":"14:30"},{"day":5,"start":"11:00","end":"14:30"}]'::jsonb,
   '["Starters","Mains","Noodles","Rice","Sides","Desserts","Beverages"]'::jsonb,
   120, 19.90, false, 1),
  ('bp-weekend-brunch', 'Weekend Brunch Buffet', '周末早午自助餐', 58.80,
   '[{"day":0,"start":"10:00","end":"15:00"},{"day":6,"start":"10:00","end":"15:00"}]'::jsonb,
   '["Starters","Mains","Noodles","Rice","Sides","Desserts","Beverages"]'::jsonb,
   150, 29.90, false, 2),
  ('bp-seafood-dinner', 'Seafood Dinner Buffet', '海鲜晚市自助餐', 88.80,
   '[{"day":0,"start":"17:30","end":"22:00"},{"day":1,"start":"17:30","end":"22:00"},{"day":2,"start":"17:30","end":"22:00"},{"day":3,"start":"17:30","end":"22:00"},{"day":4,"start":"17:30","end":"22:00"},{"day":5,"start":"17:30","end":"22:30"},{"day":6,"start":"17:30","end":"22:30"}]'::jsonb,
   '["Starters","Mains","Noodles","Rice","Sides","Desserts","Beverages","Alcohol"]'::jsonb,
   180, 44.90, true, 3);

INSERT INTO public.promotions (id, name, type, status, discount_type, discount_value, min_spend, usage_count, usage_limit, start_date, end_date, time_window_start, time_window_end, weekdays, combinable, priority) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lunch Special 20% Off', 'discount', 'active', 'percentage', 20, 30, 142, 500, '2026-01-01', '2026-06-30', '11:00', '14:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], false, 1),
  ('00000000-0000-0000-0000-000000000002', 'New Customer $5 Off', 'coupon', 'active', 'fixed', 5, 0, 87, 200, '2026-02-01', NULL, NULL, NULL, ARRAY[]::text[], true, 2),
  ('00000000-0000-0000-0000-000000000003', 'Weekend BOGO Drinks', 'bogo', 'active', NULL, NULL, 0, 63, NULL, '2026-03-01', NULL, NULL, NULL, ARRAY['Sat','Sun'], false, 3),
  ('00000000-0000-0000-0000-000000000004', 'Happy Hour 30% Off', 'happy_hour', 'scheduled', 'percentage', 30, 20, 0, NULL, '2026-04-01', '2026-04-30', '15:00', '18:00', ARRAY[]::text[], false, 1),
  ('00000000-0000-0000-0000-000000000005', 'VIP Member 10%', 'loyalty', 'active', 'percentage', 10, 0, 234, NULL, '2026-01-01', NULL, NULL, NULL, ARRAY[]::text[], true, 5),
  ('00000000-0000-0000-0000-000000000006', 'CNY Free Dessert', 'gift', 'expired', NULL, NULL, 0, 180, 200, '2026-01-25', '2026-02-10', NULL, NULL, ARRAY[]::text[], true, 4),
  ('00000000-0000-0000-0000-000000000007', 'IG Follower $3 Off', 'coupon', 'active', 'fixed', 3, 0, 45, 100, '2026-03-01', '2026-05-31', NULL, NULL, ARRAY[]::text[], true, 6);

INSERT INTO public.pricing_strategies (id, name, enabled, priority, discount_type, discount_value, target_categories, time_start, time_end, weekdays, combinable) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Happy Hour Drinks 50% Off', true, 1, 'percentage', 50, ARRAY['Alcohol'], '17:00', '20:00', ARRAY['Mon','Tue','Wed','Thu','Fri'], false),
  ('00000000-0000-0000-0000-000000000102', 'Weekday Afternoon 20% Off', true, 2, 'percentage', 20, ARRAY['All'], '15:00', '17:00', ARRAY['Mon','Tue','Wed','Thu'], false),
  ('00000000-0000-0000-0000-000000000103', 'Weekend Brunch $3 Off Mains', false, 3, 'fixed', 3, ARRAY['Mains'], '10:00', '14:00', ARRAY['Sat','Sun'], true);

INSERT INTO public.merchant_settings (key, value) VALUES
  ('country_code', '"SG"'::jsonb),
  ('merchant_info', '{"name": "Song Fa Bak Kut Teh", "brand": "Song Fa", "logo": "/src/assets/uniweb-logo.jpg"}'::jsonb),
  ('tax_config', '{"gstRate": 0.09, "gstName": "GST", "serviceChargeRate": 0.10, "serviceChargeEnabled": true}'::jsonb),
  ('currency_config', '{"code": "SGD", "symbol": "$", "locale": "en-SG"}'::jsonb);
