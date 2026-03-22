-- Gadget Inventory & Sales Tracker - Database Schema
-- Run this in Supabase SQL Editor (greenfield / full reset)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'General',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    tracking_mode TEXT NOT NULL DEFAULT 'quantity' CHECK (tracking_mode IN ('quantity', 'unit')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN products.tracking_mode IS 'quantity: aggregate stock; unit: one row per device in inventory_units';
COMMENT ON COLUMN products.price IS 'Default/suggested price; actual revenue uses sale_items.unit_price';

-- ============================================
-- SALES (transaction header)
-- ============================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sold_by TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVENTORY UNITS (serialized devices)
-- ============================================
CREATE TABLE inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
    identifier_kind TEXT NOT NULL CHECK (identifier_kind IN ('imei', 'serial', 'other')),
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold')),
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT inventory_units_identifier_unique UNIQUE (identifier)
);

CREATE INDEX idx_inventory_units_product_status ON inventory_units (product_id, status);
CREATE INDEX idx_inventory_units_identifier ON inventory_units (identifier);

-- ============================================
-- SALE LINE ITEMS
-- ============================================
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
    inventory_unit_id UUID REFERENCES inventory_units(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items (product_id);
CREATE INDEX idx_sale_items_created ON sale_items (created_at DESC);
CREATE INDEX idx_sales_created_at ON sales (created_at DESC);

-- ============================================
-- VIEW: sale line ledger (paginated activity / reports)
-- ============================================
CREATE OR REPLACE VIEW public.sale_line_details
WITH (security_invoker = true) AS
SELECT
    si.id AS sale_item_id,
    si.sale_id,
    s.created_at AS sale_created_at,
    s.sold_by,
    s.customer_name,
    s.customer_phone,
    COALESCE(p.name, 'Product') AS product_name,
    si.quantity_sold,
    si.unit_price,
    iu.identifier AS unit_identifier,
    iu.identifier_kind AS unit_identifier_kind
FROM public.sale_items si
INNER JOIN public.sales s ON s.id = si.sale_id
INNER JOIN public.products p ON p.id = si.product_id
LEFT JOIN public.inventory_units iu ON iu.id = si.inventory_unit_id;

COMMENT ON VIEW public.sale_line_details IS 'Flattened sale lines for reporting and activity (paginated queries)';

GRANT SELECT ON public.sale_line_details TO authenticated;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS helper functions
-- ============================================
CREATE OR REPLACE FUNCTION public.has_profile(p_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_uid AND p.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on products"
    ON products FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Staff read-only on products"
    ON products FOR SELECT TO authenticated
    USING (public.has_profile());

CREATE POLICY "Authenticated users can create sales"
    ON sales FOR INSERT TO authenticated
    WITH CHECK (public.has_profile());

CREATE POLICY "Authenticated users can read sales"
    ON sales FOR SELECT TO authenticated
    USING (public.has_profile());

CREATE POLICY "Authenticated users can insert sale_items"
    ON sale_items FOR INSERT TO authenticated
    WITH CHECK (public.has_profile());

CREATE POLICY "Authenticated users can read sale_items"
    ON sale_items FOR SELECT TO authenticated
    USING (public.has_profile());

CREATE POLICY "Admin full access on inventory_units"
    ON inventory_units FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Staff read inventory_units"
    ON inventory_units FOR SELECT TO authenticated
    USING (public.has_profile());

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Admin can read all profiles"
    ON profiles FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admin can update all profiles"
    ON profiles FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- ============================================
-- TRIGGERS: inventory units + sale lines
-- ============================================
CREATE OR REPLACE FUNCTION public.enforce_inventory_unit_product_mode()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mode text;
BEGIN
  SELECT tracking_mode INTO mode FROM products WHERE id = NEW.product_id;
  IF mode IS DISTINCT FROM 'unit' THEN
    RAISE EXCEPTION 'Inventory units only apply to serialized (unit) products';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_units_enforce_mode
    BEFORE INSERT OR UPDATE OF product_id ON inventory_units
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_inventory_unit_product_mode();

CREATE OR REPLACE FUNCTION public.sync_inventory_unit_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mode text;
  pid uuid;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  SELECT tracking_mode INTO mode FROM products WHERE id = pid;
  IF mode IS DISTINCT FROM 'unit' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'in_stock' THEN
      UPDATE products SET stock_quantity = stock_quantity + 1 WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'in_stock' THEN
      UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = OLD.product_id;
      IF (SELECT stock_quantity FROM products WHERE id = OLD.product_id) < 0 THEN
        RAISE EXCEPTION 'Stock cannot be negative';
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF OLD.status = 'in_stock' AND NEW.status = 'sold' THEN
        UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = NEW.product_id;
      ELSIF OLD.status = 'sold' AND NEW.status = 'in_stock' THEN
        UPDATE products SET stock_quantity = stock_quantity + 1 WHERE id = NEW.product_id;
      END IF;
    END IF;
    IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
      RAISE EXCEPTION 'Stock cannot be negative';
    END IF;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER inventory_units_sync_stock
    AFTER INSERT OR UPDATE OR DELETE ON inventory_units
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_inventory_unit_stock();

CREATE OR REPLACE FUNCTION public.handle_sale_item_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mode text;
  upd int;
BEGIN
  SELECT tracking_mode INTO mode FROM products WHERE id = NEW.product_id;
  IF mode IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF mode = 'quantity' THEN
    IF NEW.inventory_unit_id IS NOT NULL THEN
      RAISE EXCEPTION 'Quantity-tracked product must not reference an inventory unit';
    END IF;
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity_sold
    WHERE id = NEW.product_id;
    IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for this sale';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.inventory_unit_id IS NULL THEN
    RAISE EXCEPTION 'Serialized product requires an inventory unit';
  END IF;
  IF NEW.quantity_sold <> 1 THEN
    RAISE EXCEPTION 'Serialized sale line must have quantity 1';
  END IF;

  UPDATE inventory_units
  SET status = 'sold', sold_at = NOW()
  WHERE id = NEW.inventory_unit_id AND product_id = NEW.product_id AND status = 'in_stock';
  GET DIAGNOSTICS upd = ROW_COUNT;
  IF upd = 0 THEN
    RAISE EXCEPTION 'Inventory unit not available';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sale_items_after_insert
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_item_insert();

-- ============================================
-- RPC: atomic sale (bypasses multi-statement client limits)
-- ============================================
CREATE OR REPLACE FUNCTION public.record_sale(
  p_items jsonb,
  p_sold_by text,
  p_customer_name text,
  p_customer_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_sold_by IS NULL OR trim(p_sold_by) = '' THEN
    RAISE EXCEPTION 'sold_by is required';
  END IF;
  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  IF p_customer_phone IS NULL OR trim(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required';
  END IF;

  INSERT INTO sales (sold_by, customer_name, customer_phone)
  VALUES (trim(p_sold_by), trim(p_customer_name), trim(p_customer_phone))
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (sale_id, product_id, unit_price, quantity_sold, inventory_unit_id)
  SELECT
    v_sale_id,
    (x->>'product_id')::uuid,
    (x->>'unit_price')::numeric,
    (x->>'quantity_sold')::int,
    CASE
      WHEN x ? 'inventory_unit_id' AND nullif(trim(x->>'inventory_unit_id'), '') IS NOT NULL
      THEN (x->>'inventory_unit_id')::uuid
      ELSE NULL
    END
  FROM jsonb_array_elements(p_items) AS x;

  RETURN v_sale_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_sale(jsonb, text, text, text) TO authenticated;

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE (images bucket — create bucket in Dashboard)
-- ============================================
CREATE POLICY "Public read access for images"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'images'
        AND (storage.foldername(name))[1] = 'products'
    );

CREATE POLICY "Admin can delete images"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'images'
        AND public.is_admin()
    );
