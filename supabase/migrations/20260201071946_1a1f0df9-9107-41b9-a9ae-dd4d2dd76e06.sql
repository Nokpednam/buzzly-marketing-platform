-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR ALL MISSING TABLES
-- This migration adds proper access control policies
-- =====================================================

-- =====================================================
-- PHASE 1: REFERENCE/LOOKUP TABLES (Read-only for authenticated, Admin-managed)
-- These tables store configuration and reference data
-- =====================================================

-- aarrr_categories
CREATE POLICY "Authenticated users can view aarrr_categories" ON public.aarrr_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage aarrr_categories" ON public.aarrr_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- action_type
CREATE POLICY "Authenticated users can view action_type" ON public.action_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage action_type" ON public.action_type FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- action_type_employees
CREATE POLICY "Employees can view action_type_employees" ON public.action_type_employees FOR SELECT TO authenticated USING (is_employee(auth.uid()));
CREATE POLICY "Admins can manage action_type_employees" ON public.action_type_employees FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- ad_buying_types
CREATE POLICY "Authenticated users can view ad_buying_types" ON public.ad_buying_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage ad_buying_types" ON public.ad_buying_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- attribution_types
CREATE POLICY "Authenticated users can view attribution_types" ON public.attribution_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage attribution_types" ON public.attribution_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- change_type
CREATE POLICY "Authenticated users can view change_type" ON public.change_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage change_type" ON public.change_type FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- countries
CREATE POLICY "Authenticated users can view countries" ON public.countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage countries" ON public.countries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- creative_types
CREATE POLICY "Authenticated users can view creative_types" ON public.creative_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage creative_types" ON public.creative_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- event_categories
CREATE POLICY "Authenticated users can view event_categories" ON public.event_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage event_categories" ON public.event_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- event_definition
CREATE POLICY "Authenticated users can view event_definition" ON public.event_definition FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage event_definition" ON public.event_definition FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- event_types
CREATE POLICY "Authenticated users can view event_types" ON public.event_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage event_types" ON public.event_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- funnel_stages
CREATE POLICY "Authenticated users can view funnel_stages" ON public.funnel_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage funnel_stages" ON public.funnel_stages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- genders
CREATE POLICY "Authenticated users can view genders" ON public.genders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage genders" ON public.genders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- group_template_settings
CREATE POLICY "Authenticated users can view group_template_settings" ON public.group_template_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage group_template_settings" ON public.group_template_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- mapping_categories
CREATE POLICY "Authenticated users can view mapping_categories" ON public.mapping_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage mapping_categories" ON public.mapping_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- mapping_groups
CREATE POLICY "Authenticated users can view mapping_groups" ON public.mapping_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage mapping_groups" ON public.mapping_groups FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- metric_templates
CREATE POLICY "Authenticated users can view metric_templates" ON public.metric_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage metric_templates" ON public.metric_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- payment_methods
CREATE POLICY "Authenticated users can view payment_methods" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage payment_methods" ON public.payment_methods FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- payment_providers
CREATE POLICY "Authenticated users can view payment_providers" ON public.payment_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage payment_providers" ON public.payment_providers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- persona_definition
CREATE POLICY "Authenticated users can view persona_definition" ON public.persona_definition FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage persona_definition" ON public.persona_definition FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- pipeline_type
CREATE POLICY "Authenticated users can view pipeline_type" ON public.pipeline_type FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage pipeline_type" ON public.pipeline_type FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- platform_categories
CREATE POLICY "Authenticated users can view platform_categories" ON public.platform_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage platform_categories" ON public.platform_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- platform_mapping_events
CREATE POLICY "Authenticated users can view platform_mapping_events" ON public.platform_mapping_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage platform_mapping_events" ON public.platform_mapping_events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- platform_standard_mappings
CREATE POLICY "Authenticated users can view platform_standard_mappings" ON public.platform_standard_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage platform_standard_mappings" ON public.platform_standard_mappings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- priority_level
CREATE POLICY "Authenticated users can view priority_level" ON public.priority_level FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage priority_level" ON public.priority_level FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- provinces
CREATE POLICY "Authenticated users can view provinces" ON public.provinces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage provinces" ON public.provinces FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- rating
CREATE POLICY "Authenticated users can view rating" ON public.rating FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rating" ON public.rating FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- role_customers
CREATE POLICY "Authenticated users can view role_customers" ON public.role_customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage role_customers" ON public.role_customers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- role_employees
CREATE POLICY "Authenticated users can view role_employees" ON public.role_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage role_employees" ON public.role_employees FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- security_level
CREATE POLICY "Authenticated users can view security_level" ON public.security_level FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage security_level" ON public.security_level FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- tags
CREATE POLICY "Authenticated users can view tags" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- time_zones
CREATE POLICY "Authenticated users can view time_zones" ON public.time_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage time_zones" ON public.time_zones FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- =====================================================
-- PHASE 2: TEAM-SCOPED TABLES
-- These tables are linked to teams and require team-based access
-- =====================================================

-- ad_accounts (has team_id)
CREATE POLICY "Team members can view ad_accounts" ON public.ad_accounts FOR SELECT TO authenticated USING (is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can insert ad_accounts" ON public.ad_accounts FOR INSERT TO authenticated WITH CHECK (is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can update ad_accounts" ON public.ad_accounts FOR UPDATE TO authenticated USING (is_team_member(auth.uid(), team_id));
CREATE POLICY "Team admins can delete ad_accounts" ON public.ad_accounts FOR DELETE TO authenticated USING (can_manage_team(auth.uid(), team_id));

-- ad_groups (no team_id - authenticated read, admin manage)
CREATE POLICY "Authenticated users can view ad_groups" ON public.ad_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage ad_groups" ON public.ad_groups FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- ad_insights (linked via ad_account_id)
CREATE POLICY "Team members can view ad_insights" ON public.ad_insights FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM ad_accounts WHERE ad_accounts.id = ad_insights.ad_account_id AND is_team_member(auth.uid(), ad_accounts.team_id)));
CREATE POLICY "Admins can manage ad_insights" ON public.ad_insights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- ads (linked via ad_group)
CREATE POLICY "Authenticated users can view ads" ON public.ads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage ads" ON public.ads FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- campaigns (linked via ad_account_id)
CREATE POLICY "Team members can view campaigns" ON public.campaigns FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM ad_accounts WHERE ad_accounts.id = campaigns.ad_account_id AND is_team_member(auth.uid(), ad_accounts.team_id)));
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- conversion_events (linked via ad_account_id)
CREATE POLICY "Team members can view conversion_events" ON public.conversion_events FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM ad_accounts WHERE ad_accounts.id = conversion_events.ad_account_id AND is_team_member(auth.uid(), ad_accounts.team_id)));
CREATE POLICY "Admins can manage conversion_events" ON public.conversion_events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- conversion_items
CREATE POLICY "Authenticated users can view conversion_items" ON public.conversion_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage conversion_items" ON public.conversion_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- =====================================================
-- PHASE 3: USER-SCOPED TABLES
-- Tables with personal/user-specific data
-- =====================================================

-- customer_activities (has profile_customer_id - need to link to user)
CREATE POLICY "Authenticated users can view customer_activities" ON public.customer_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage customer_activities" ON public.customer_activities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- discounts
CREATE POLICY "Authenticated users can view active discounts" ON public.discounts FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage discounts" ON public.discounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- feedback (has user_id)
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedback FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback" ON public.feedback FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- locations
CREATE POLICY "Authenticated users can view locations" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- product_categories
CREATE POLICY "Authenticated users can view product_categories" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage product_categories" ON public.product_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- profile_customers
CREATE POLICY "Users can view own profile_customers" ON public.profile_customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile_customers" ON public.profile_customers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profile_customers" ON public.profile_customers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- subscription_orders (has user_id)
CREATE POLICY "Users can view own subscription_orders" ON public.subscription_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscription_orders" ON public.subscription_orders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- variant_products
CREATE POLICY "Authenticated users can view variant_products" ON public.variant_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage variant_products" ON public.variant_products FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- =====================================================
-- PHASE 4: ADMIN/SYSTEM TABLES
-- Sensitive system tables restricted to admins
-- =====================================================

-- audit_log_employees
CREATE POLICY "Admins can view audit_log_employees" ON public.audit_log_employees FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage audit_log_employees" ON public.audit_log_employees FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- audit_logs_enhanced
CREATE POLICY "Admins can view audit_logs_enhanced" ON public.audit_logs_enhanced FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage audit_logs_enhanced" ON public.audit_logs_enhanced FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- data_pipeline
CREATE POLICY "Admins can view data_pipeline" ON public.data_pipeline FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage data_pipeline" ON public.data_pipeline FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- deployment_pipeline
CREATE POLICY "Admins can view deployment_pipeline" ON public.deployment_pipeline FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage deployment_pipeline" ON public.deployment_pipeline FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- external_api_status
CREATE POLICY "Admins can view external_api_status" ON public.external_api_status FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage external_api_status" ON public.external_api_status FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- provider_server
CREATE POLICY "Admins can view provider_server" ON public.provider_server FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage provider_server" ON public.provider_server FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- request_logs
CREATE POLICY "Admins can view request_logs" ON public.request_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage request_logs" ON public.request_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- server
CREATE POLICY "Admins can view server" ON public.server FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
CREATE POLICY "Admins can manage server" ON public.server FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- social_posts
CREATE POLICY "Authenticated users can view social_posts" ON public.social_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage social_posts" ON public.social_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));