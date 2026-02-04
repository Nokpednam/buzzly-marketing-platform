-- Add policies for the remaining 2 tables with RLS enabled but no policies

-- loyalty_points (scoped by loyalty_tier_id - admin/owner only for now)
CREATE POLICY "authenticated_read" ON public.loyalty_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.loyalty_points FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- employees_profile (scoped by employees_id / user_id)
CREATE POLICY "employee_self_select" ON public.employees_profile FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employees_profile.employees_id AND e.user_id = auth.uid()));
CREATE POLICY "employee_self_update" ON public.employees_profile FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employees_profile.employees_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employees_profile.employees_id AND e.user_id = auth.uid()));
CREATE POLICY "admin_owner_manage" ON public.employees_profile FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));