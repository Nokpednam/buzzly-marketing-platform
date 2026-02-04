-- =============================================================
-- RLS POLICIES BATCH 1: Reference/Lookup Tables (Authenticated Read, Admin Manage)
-- =============================================================

-- aarrr_categories
CREATE POLICY "authenticated_read" ON public.aarrr_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.aarrr_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- action_type
CREATE POLICY "authenticated_read" ON public.action_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.action_type FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- action_type_employees
CREATE POLICY "authenticated_read" ON public.action_type_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.action_type_employees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- ad_buying_types
CREATE POLICY "authenticated_read" ON public.ad_buying_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.ad_buying_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- app_features
CREATE POLICY "authenticated_read" ON public.app_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.app_features FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- attribution_types
CREATE POLICY "authenticated_read" ON public.attribution_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.attribution_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- business_types
CREATE POLICY "authenticated_read" ON public.business_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.business_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- countries
CREATE POLICY "authenticated_read" ON public.countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.countries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- creative_types
CREATE POLICY "authenticated_read" ON public.creative_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.creative_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- currencies
CREATE POLICY "authenticated_read" ON public.currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.currencies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- event_categories
CREATE POLICY "authenticated_read" ON public.event_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.event_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- event_definition
CREATE POLICY "authenticated_read" ON public.event_definition FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.event_definition FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- event_types
CREATE POLICY "authenticated_read" ON public.event_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.event_types FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- genders
CREATE POLICY "authenticated_read" ON public.genders FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.genders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- industries
CREATE POLICY "authenticated_read" ON public.industries FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.industries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- mapping_categories
CREATE POLICY "authenticated_read" ON public.mapping_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.mapping_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- payment_providers
CREATE POLICY "authenticated_read" ON public.payment_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.payment_providers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- persona_definition
CREATE POLICY "authenticated_read" ON public.persona_definition FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.persona_definition FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- pipeline_type
CREATE POLICY "authenticated_read" ON public.pipeline_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.pipeline_type FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- priority_level
CREATE POLICY "authenticated_read" ON public.priority_level FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.priority_level FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- rating
CREATE POLICY "authenticated_read" ON public.rating FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.rating FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- security_level
CREATE POLICY "authenticated_read" ON public.security_level FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.security_level FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- tags
CREATE POLICY "authenticated_read" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.tags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- funnel_stages
CREATE POLICY "authenticated_read" ON public.funnel_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.funnel_stages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- provinces
CREATE POLICY "authenticated_read" ON public.provinces FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.provinces FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- time_zones
CREATE POLICY "authenticated_read" ON public.time_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.time_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- change_type
CREATE POLICY "authenticated_read" ON public.change_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.change_type FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- payment_methods
CREATE POLICY "authenticated_read" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.payment_methods FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- mapping_groups
CREATE POLICY "authenticated_read" ON public.mapping_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.mapping_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- metric_templates
CREATE POLICY "authenticated_read" ON public.metric_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.metric_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- group_template_settings
CREATE POLICY "authenticated_read" ON public.group_template_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.group_template_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- platform_mapping_events
CREATE POLICY "authenticated_read" ON public.platform_mapping_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.platform_mapping_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- platform_standard_mappings
CREATE POLICY "authenticated_read" ON public.platform_standard_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.platform_standard_mappings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- product_categories
CREATE POLICY "authenticated_read" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.product_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- variant_products
CREATE POLICY "authenticated_read" ON public.variant_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.variant_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- discounts
CREATE POLICY "authenticated_read" ON public.discounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.discounts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- ai_parameters
CREATE POLICY "authenticated_read" ON public.ai_parameters FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.ai_parameters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- role_customers
CREATE POLICY "authenticated_read" ON public.role_customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_owner_manage" ON public.role_customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- =============================================================
-- RLS POLICIES BATCH 2: Admin/Owner Only Tables (System/Infra/Audit)
-- =============================================================

-- api_configurations
CREATE POLICY "admin_owner_only" ON public.api_configurations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- audit_log_employees
CREATE POLICY "admin_owner_only" ON public.audit_log_employees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- audit_logs_enhanced
CREATE POLICY "admin_owner_only" ON public.audit_logs_enhanced FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- data_pipeline
CREATE POLICY "admin_owner_only" ON public.data_pipeline FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- deployment_pipeline
CREATE POLICY "admin_owner_only" ON public.deployment_pipeline FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- external_api_status
CREATE POLICY "admin_owner_only" ON public.external_api_status FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- provider_server
CREATE POLICY "admin_owner_only" ON public.provider_server FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- request_logs
CREATE POLICY "admin_owner_only" ON public.request_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- server
CREATE POLICY "admin_owner_only" ON public.server FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- =============================================================
-- RLS POLICIES BATCH 3: Team-Scoped Tables (via is_team_member helper)
-- =============================================================

-- ad_accounts (team_id scoped)
CREATE POLICY "team_member_select" ON public.ad_accounts FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_insert" ON public.ad_accounts FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_update" ON public.ad_accounts FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_admin_delete" ON public.ad_accounts FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));

-- ad_groups (needs admin/owner since no team_id)
CREATE POLICY "admin_owner_only" ON public.ad_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- ads (needs admin/owner since no team_id)
CREATE POLICY "admin_owner_only" ON public.ads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- ad_insights (scoped via ad_account_id -> ad_accounts.team_id)
CREATE POLICY "team_member_select" ON public.ad_insights FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = ad_insights.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_member_insert" ON public.ad_insights FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = ad_insights.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_member_update" ON public.ad_insights FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = ad_insights.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = ad_insights.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_admin_delete" ON public.ad_insights FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = ad_insights.ad_account_id AND public.can_manage_team(auth.uid(), aa.team_id)));

-- campaigns (scoped via ad_account_id -> ad_accounts.team_id)
CREATE POLICY "team_member_select" ON public.campaigns FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = campaigns.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_member_insert" ON public.campaigns FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = campaigns.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_member_update" ON public.campaigns FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = campaigns.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = campaigns.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_admin_delete" ON public.campaigns FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = campaigns.ad_account_id AND public.can_manage_team(auth.uid(), aa.team_id)));

-- conversion_events (scoped via ad_account_id -> ad_accounts.team_id)
CREATE POLICY "team_member_select" ON public.conversion_events FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = conversion_events.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));
CREATE POLICY "team_member_insert" ON public.conversion_events FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_accounts aa WHERE aa.id = conversion_events.ad_account_id AND public.is_team_member(auth.uid(), aa.team_id)));

-- conversion_items (needs admin/owner since no direct team link)
CREATE POLICY "admin_owner_only" ON public.conversion_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- =============================================================
-- RLS POLICIES BATCH 4: User-Scoped Tables
-- =============================================================

-- customer_activities (scoped via profile_customers.user_id)
CREATE POLICY "owner_select" ON public.customer_activities FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profile_customers pc WHERE pc.id = customer_activities.profile_customer_id AND pc.user_id = auth.uid()));
CREATE POLICY "owner_insert" ON public.customer_activities FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profile_customers pc WHERE pc.id = customer_activities.profile_customer_id AND pc.user_id = auth.uid()));
CREATE POLICY "admin_owner_select" ON public.customer_activities FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- feedback (user_id scoped with admin read)
CREATE POLICY "owner_all" ON public.feedback FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_owner_select" ON public.feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- locations (scoped via profile_customers.location_id)
CREATE POLICY "owner_access" ON public.locations FOR ALL TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profile_customers pc WHERE pc.location_id = locations.id AND pc.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profile_customers pc WHERE pc.location_id = locations.id AND pc.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)
  );

-- subscription_orders (user_id scoped)
CREATE POLICY "owner_select" ON public.subscription_orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner_insert" ON public.subscription_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_owner_select" ON public.subscription_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- cohort_analysis (team_id scoped)
CREATE POLICY "team_member_select" ON public.cohort_analysis FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "admin_owner_manage" ON public.cohort_analysis FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- budgets (team_id scoped)
CREATE POLICY "team_member_select" ON public.budgets FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_insert" ON public.budgets FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_update" ON public.budgets FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_admin_delete" ON public.budgets FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));

-- customer_insights (user_id scoped)
CREATE POLICY "owner_all" ON public.customer_insights FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_owner_select" ON public.customer_insights FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));