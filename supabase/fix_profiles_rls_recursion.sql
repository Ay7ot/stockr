-- Fix: "infinite recursion detected in policy for relation 'profiles'"
--
-- Cause: Policies on products/sales/storage that do EXISTS (SELECT ... FROM profiles)
-- re-apply RLS on profiles. Policies on profiles that also SELECT from profiles recurse.
--
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL → New query).

-- ---------------------------------------------------------------------------
-- Helper functions: SECURITY DEFINER reads profiles without RLS recursion
-- ---------------------------------------------------------------------------

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

COMMENT ON FUNCTION public.has_profile(uuid) IS 'RLS-safe: true if auth user has a profiles row.';
COMMENT ON FUNCTION public.is_admin(uuid) IS 'RLS-safe: true if auth user has role admin.';

-- ---------------------------------------------------------------------------
-- Drop policies that subquery profiles directly
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
DROP POLICY IF EXISTS "Staff read-only on products" ON public.products;

DROP POLICY IF EXISTS "Authenticated users can create sales" ON public.sales;
DROP POLICY IF EXISTS "Admin can read all sales" ON public.sales;
DROP POLICY IF EXISTS "Staff can read all sales" ON public.sales;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

CREATE POLICY "Admin full access on products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Staff read-only on products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (public.has_profile());

-- ---------------------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------------------

CREATE POLICY "Authenticated users can create sales"
  ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_profile());

CREATE POLICY "Authenticated users can read sales"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (public.has_profile());

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage (images bucket)
-- ---------------------------------------------------------------------------

CREATE POLICY "Admin can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND public.is_admin()
  );
