-- Migration: college_domains table for email domain allowlisting
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)

CREATE TABLE IF NOT EXISTS public.college_domains (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name text NOT NULL,
  domain      text UNIQUE NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.college_domains ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated OR anonymous user to READ active domains
-- (needed so the pre-signup domain check works without a session)
CREATE POLICY "Anyone can read active college domains"
  ON public.college_domains
  FOR SELECT
  USING (is_active = true);

-- Only service-role / postgres (i.e. Supabase dashboard / migrations) can INSERT/UPDATE/DELETE
-- No public INSERT / UPDATE / DELETE policies → anon/authenticated users cannot modify the table
