-- Read-only view for paginated sale line ledger (RLS applies via security invoker)

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
