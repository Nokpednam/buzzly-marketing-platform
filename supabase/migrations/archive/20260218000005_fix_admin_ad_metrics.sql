-- Migration: Fix Admin Visibility for Ad Accounts
-- Description: Allows users with 'admin' or 'owner' system roles to view all ad accounts.

-- Policies for public.ad_accounts
-- This policy allows system admins to see all ad accounts for reporting purposes
CREATE POLICY "Admins can view all ad accounts"
ON public.ad_accounts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);
