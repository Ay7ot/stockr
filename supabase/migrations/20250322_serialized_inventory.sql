-- Migration: serialized inventory, sale_items, variable pricing
-- Run in Supabase SQL Editor on an existing DB that already has the old `sales` shape
-- (sales with product_id + quantity_sold + handle_new_sale trigger).

-- 1. Remove legacy sale trigger (stock was already decremented on each historical sale)
DROP TRIGGER IF EXISTS on_sale_created ON public.sales;
DROP FUNCTION IF EXISTS public.handle_new_sale();

-- 2. Product tracking mode
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tracking_mode text NOT NULL DEFAULT 'quantity'
  CHECK (tracking_mode IN ('quantity', 'unit'));

COMMENT ON COLUMN public.products.tracking_mode IS 'quantity: aggregate stock; unit: one row per device in inventory_units';

-- 3. inventory_units
CREATE TABLE IF NOT EXISTS public.inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
    identifier_kind TEXT NOT NULL CHECK (identifier_kind IN ('imei', 'serial', 'other')),
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold')),
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT inventory_units_identifier_unique UNIQUE (identifier)
);

CREATE INDEX IF NOT EXISTS idx_inventory_units_product_status ON public.inventory_units (product_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_units_identifier ON public.inventory_units (identifier);

-- 4. sale_items (no trigger yet — backfill must not re-decrement stock)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
    inventory_unit_id UUID REFERENCES public.inventory_units(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items (product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_created ON public.sale_items (created_at DESC);

-- 5. Backfill line items from legacy sales (unit_price snapshot = current catalog price at migration time)
INSERT INTO public.sale_items (sale_id, product_id, unit_price, quantity_sold)
SELECT s.id, s.product_id, p.price, s.quantity_sold
FROM public.sales s
JOIN public.products p ON p.id = s.product_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.sale_items si WHERE si.sale_id = s.id
);

-- 6. Slim sales to header-only
ALTER TABLE public.sales DROP COLUMN IF EXISTS product_id;
ALTER TABLE public.sales DROP COLUMN IF EXISTS quantity_sold;

-- 7. RLS
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on inventory_units" ON public.inventory_units;
CREATE POLICY "Admin full access on inventory_units"
    ON public.inventory_units FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Staff read inventory_units" ON public.inventory_units;
CREATE POLICY "Staff read inventory_units"
    ON public.inventory_units FOR SELECT TO authenticated
    USING (public.has_profile());

DROP POLICY IF EXISTS "Authenticated users can insert sale_items" ON public.sale_items;
CREATE POLICY "Authenticated users can insert sale_items"
    ON public.sale_items FOR INSERT TO authenticated
    WITH CHECK (public.has_profile());

DROP POLICY IF EXISTS "Authenticated users can read sale_items" ON public.sale_items;
CREATE POLICY "Authenticated users can read sale_items"
    ON public.sale_items FOR SELECT TO authenticated
    USING (public.has_profile());

-- 8. Trigger functions (idempotent replace)
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

DROP TRIGGER IF EXISTS inventory_units_enforce_mode ON public.inventory_units;
CREATE TRIGGER inventory_units_enforce_mode
    BEFORE INSERT OR UPDATE OF product_id ON public.inventory_units
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

DROP TRIGGER IF EXISTS inventory_units_sync_stock ON public.inventory_units;
CREATE TRIGGER inventory_units_sync_stock
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_units
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

DROP TRIGGER IF EXISTS sale_items_after_insert ON public.sale_items;
CREATE TRIGGER sale_items_after_insert
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_item_insert();

CREATE OR REPLACE FUNCTION public.record_sale(p_items jsonb, p_sold_by text)
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
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required';
  END IF;

  INSERT INTO sales (sold_by) VALUES (trim(p_sold_by)) RETURNING id INTO v_sale_id;

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

GRANT EXECUTE ON FUNCTION public.record_sale(jsonb, text) TO authenticated;
