-- Customer name + phone on each sale; extends record_sale RPC

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';

DROP FUNCTION IF EXISTS public.record_sale(jsonb, text);

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
