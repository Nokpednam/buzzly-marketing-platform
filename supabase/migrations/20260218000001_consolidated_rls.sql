-- Consolidated RLS Policies
--
-- Name: employees_profile Admins can delete employee profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete employee profiles" ON public.employees_profile FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text)));

--
-- Name: employees Admins can delete employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete employees" ON public.employees FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text)));

--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ai_parameters Admins can manage AI parameters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage AI parameters" ON public.ai_parameters TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: api_configurations Admins can manage API configs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage API configs" ON public.api_configurations TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: aarrr_categories Admins can manage aarrr_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage aarrr_categories" ON public.aarrr_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: action_type Admins can manage action_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage action_type" ON public.action_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: action_type_employees Admins can manage action_type_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage action_type_employees" ON public.action_type_employees TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ad_buying_types Admins can manage ad_buying_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ad_buying_types" ON public.ad_buying_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ad_groups Admins can manage ad_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ad_groups" ON public.ad_groups TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ad_insights Admins can manage ad_insights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ad_insights" ON public.ad_insights TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ads Admins can manage ads; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ads" ON public.ads TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: attribution_types Admins can manage attribution_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage attribution_types" ON public.attribution_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: audit_log_employees Admins can manage audit_log_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage audit_log_employees" ON public.audit_log_employees TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: business_types Admins can manage business types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage business types" ON public.business_types USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: change_type Admins can manage change_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage change_type" ON public.change_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: conversion_events Admins can manage conversion_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage conversion_events" ON public.conversion_events TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: conversion_items Admins can manage conversion_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage conversion_items" ON public.conversion_items TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: countries Admins can manage countries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage countries" ON public.countries TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: creative_types Admins can manage creative_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage creative_types" ON public.creative_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer_activities Admins can manage customer_activities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage customer_activities" ON public.customer_activities TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: data_pipeline Admins can manage data_pipeline; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage data_pipeline" ON public.data_pipeline TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: deployment_pipeline Admins can manage deployment_pipeline; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage deployment_pipeline" ON public.deployment_pipeline TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: discounts Admins can manage discounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage discounts" ON public.discounts TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_categories Admins can manage event_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage event_categories" ON public.event_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_definition Admins can manage event_definition; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage event_definition" ON public.event_definition TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_types Admins can manage event_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage event_types" ON public.event_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: external_api_status Admins can manage external_api_status; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage external_api_status" ON public.external_api_status TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: funnel_stages Admins can manage funnel_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage funnel_stages" ON public.funnel_stages TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: genders Admins can manage genders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage genders" ON public.genders TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: group_template_settings Admins can manage group_template_settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage group_template_settings" ON public.group_template_settings TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: industries Admins can manage industries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage industries" ON public.industries USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: locations Admins can manage locations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage locations" ON public.locations TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: mapping_categories Admins can manage mapping_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage mapping_categories" ON public.mapping_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: mapping_groups Admins can manage mapping_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage mapping_groups" ON public.mapping_groups TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: metric_templates Admins can manage metric_templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage metric_templates" ON public.metric_templates TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: payment_methods Admins can manage payment_methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage payment_methods" ON public.payment_methods TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: payment_providers Admins can manage payment_providers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage payment_providers" ON public.payment_providers TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: pipeline_type Admins can manage pipeline_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage pipeline_type" ON public.pipeline_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_categories Admins can manage platform categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage platform categories" ON public.platform_categories USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_categories Admins can manage platform_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage platform_categories" ON public.platform_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_mapping_events Admins can manage platform_mapping_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage platform_mapping_events" ON public.platform_mapping_events TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_standard_mappings Admins can manage platform_standard_mappings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage platform_standard_mappings" ON public.platform_standard_mappings TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platforms Admins can manage platforms; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage platforms" ON public.platforms USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: priority_level Admins can manage priority_level; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage priority_level" ON public.priority_level TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: product_categories Admins can manage product_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage product_categories" ON public.product_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: provider_server Admins can manage provider_server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage provider_server" ON public.provider_server TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: provinces Admins can manage provinces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage provinces" ON public.provinces TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: rating Admins can manage rating; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage rating" ON public.rating TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: request_logs Admins can manage request_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage request_logs" ON public.request_logs TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: role_customers Admins can manage role_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage role_customers" ON public.role_customers TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: role_employees Admins can manage role_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage role_employees" ON public.role_employees TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: security_level Admins can manage security_level; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage security_level" ON public.security_level TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: server Admins can manage server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage server" ON public.server TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: social_posts Admins can manage social_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage social_posts" ON public.social_posts TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: system_health Admins can manage system health; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage system health" ON public.system_health TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: tags Admins can manage tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage tags" ON public.tags TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: time_zones Admins can manage time_zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage time_zones" ON public.time_zones TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: variant_products Admins can manage variant_products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage variant_products" ON public.variant_products TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer Admins can update customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update customers" ON public.customer FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees_profile Admins can update employee profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update employee profiles" ON public.employees_profile FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text) OR (EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid()))))));

--
-- Name: employees Admins can update employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update employees" ON public.employees FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text) OR (auth.uid() = user_id)));

--
-- Name: ad_accounts Admins can view all ad accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all ad accounts" ON public.ad_accounts FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer_insights Admins can view all customer insights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all customer insights" ON public.customer_insights FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: profile_customers Admins can view all customer profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all customer profiles" ON public.profile_customers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.employees e
     JOIN public.role_employees r ON ((e.role_employees_id = r.id)))
  WHERE ((e.user_id = auth.uid()) AND ((r.role_name)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[]))))));

--
-- Name: customer Admins can view all customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all customers" ON public.customer FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees_profile Admins can view all employee profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all employee profiles" ON public.employees_profile FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text) OR (EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid()))))));

--
-- Name: employees Admins can view all employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all employees" ON public.employees FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'owner'::text) OR (auth.uid() = user_id)));

--
-- Name: feedback Admins can view all feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all feedback" ON public.feedback FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: profile_customers Admins can view all profile_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all profile_customers" ON public.profile_customers FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: prospects Admins can view all prospects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all prospects" ON public.prospects FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: workspace_members Admins can view all team members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all team members" ON public.workspace_members FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: workspaces Admins can view all teams; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all teams" ON public.workspaces FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: audit_log_employees Admins can view audit_log_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view audit_log_employees" ON public.audit_log_employees FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: data_pipeline Admins can view data_pipeline; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view data_pipeline" ON public.data_pipeline FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: deployment_pipeline Admins can view deployment_pipeline; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view deployment_pipeline" ON public.deployment_pipeline FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: external_api_status Admins can view external_api_status; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view external_api_status" ON public.external_api_status FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: provider_server Admins can view provider_server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view provider_server" ON public.provider_server FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: request_logs Admins can view request_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view request_logs" ON public.request_logs FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: server Admins can view server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view server" ON public.server FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees_profile Allow employee profile creation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow employee profile creation" ON public.employees_profile FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid())))));

--
-- Name: employees Allow employee self-registration; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow employee self-registration" ON public.employees FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

--
-- Name: genders Allow public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access" ON public.genders FOR SELECT TO authenticated, anon USING (true);

--
-- Name: data_pipeline Allow read access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access to authenticated users" ON public.data_pipeline FOR SELECT TO authenticated USING (true);

--
-- Name: external_api_status Allow read access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access to authenticated users" ON public.external_api_status FOR SELECT TO authenticated USING (true);

--
-- Name: server Allow read access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access to authenticated users" ON public.server FOR SELECT TO authenticated USING (true);

--
-- Name: customer Allow trigger inserts to customer; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow trigger inserts to customer" ON public.customer FOR INSERT TO authenticated WITH CHECK (true);

--
-- Name: data_pipeline Allow write access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow write access to authenticated users" ON public.data_pipeline TO authenticated USING (true);

--
-- Name: external_api_status Allow write access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow write access to authenticated users" ON public.external_api_status TO authenticated USING (true);

--
-- Name: server Allow write access to authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow write access to authenticated users" ON public.server TO authenticated USING (true);

--
-- Name: audit_logs_enhanced Anyone can insert audit logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs_enhanced FOR INSERT TO authenticated WITH CHECK (true);

--
-- Name: error_logs Anyone can insert error logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can insert error logs" ON public.error_logs FOR INSERT WITH CHECK (true);

--
-- Name: business_types Anyone can view business types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view business types" ON public.business_types FOR SELECT USING (true);

--
-- Name: currencies Anyone can view currencies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT USING (true);

--
-- Name: role_employees Anyone can view employee roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view employee roles" ON public.role_employees FOR SELECT USING (true);

--
-- Name: industries Anyone can view industries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view industries" ON public.industries FOR SELECT USING (true);

--
-- Name: loyalty_tiers Anyone can view loyalty tiers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view loyalty tiers" ON public.loyalty_tiers FOR SELECT USING (true);

--
-- Name: payment_methods Anyone can view payment methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view payment methods" ON public.payment_methods FOR SELECT USING (true);

--
-- Name: platform_categories Anyone can view platform categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view platform categories" ON public.platform_categories FOR SELECT USING (true);

--
-- Name: platforms Anyone can view platforms; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view platforms" ON public.platforms FOR SELECT USING (true);

--
-- Name: subscription_plans Anyone can view subscription plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (true);

--
-- Name: audit_logs_enhanced Approved admins can view audit logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Approved admins can view audit logs" ON public.audit_logs_enhanced FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.employees e
     JOIN public.role_employees r ON ((e.role_employees_id = r.id)))
  WHERE ((e.user_id = auth.uid()) AND ((e.status)::text = 'active'::text) AND ((e.approval_status)::text = 'approved'::text) AND ((r.role_name)::text = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'Admin'::character varying, 'Owner'::character varying])::text[]))))));

--
-- Name: persona_definition Authenticated users can manage persona_definition; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can manage persona_definition" ON public.persona_definition TO authenticated USING (true) WITH CHECK (true);

--
-- Name: aarrr_categories Authenticated users can view aarrr_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view aarrr_categories" ON public.aarrr_categories FOR SELECT TO authenticated USING (true);

--
-- Name: action_type Authenticated users can view action_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view action_type" ON public.action_type FOR SELECT TO authenticated USING (true);

--
-- Name: discounts Authenticated users can view active discounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view active discounts" ON public.discounts FOR SELECT TO authenticated USING ((is_active = true));

--
-- Name: ad_buying_types Authenticated users can view ad_buying_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view ad_buying_types" ON public.ad_buying_types FOR SELECT TO authenticated USING (true);

--
-- Name: ad_groups Authenticated users can view ad_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view ad_groups" ON public.ad_groups FOR SELECT TO authenticated USING (true);

--
-- Name: ads Authenticated users can view ads; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view ads" ON public.ads FOR SELECT TO authenticated USING (true);

--
-- Name: attribution_types Authenticated users can view attribution_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view attribution_types" ON public.attribution_types FOR SELECT TO authenticated USING (true);

--
-- Name: change_type Authenticated users can view change_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view change_type" ON public.change_type FOR SELECT TO authenticated USING (true);

--
-- Name: conversion_items Authenticated users can view conversion_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view conversion_items" ON public.conversion_items FOR SELECT TO authenticated USING (true);

--
-- Name: countries Authenticated users can view countries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view countries" ON public.countries FOR SELECT TO authenticated USING (true);

--
-- Name: creative_types Authenticated users can view creative_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view creative_types" ON public.creative_types FOR SELECT TO authenticated USING (true);

--
-- Name: customer_activities Authenticated users can view customer_activities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view customer_activities" ON public.customer_activities FOR SELECT TO authenticated USING (true);

--
-- Name: event_categories Authenticated users can view event_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view event_categories" ON public.event_categories FOR SELECT TO authenticated USING (true);

--
-- Name: event_definition Authenticated users can view event_definition; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view event_definition" ON public.event_definition FOR SELECT TO authenticated USING (true);

--
-- Name: event_types Authenticated users can view event_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view event_types" ON public.event_types FOR SELECT TO authenticated USING (true);

--
-- Name: funnel_stages Authenticated users can view funnel_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view funnel_stages" ON public.funnel_stages FOR SELECT TO authenticated USING (true);

--
-- Name: genders Authenticated users can view genders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view genders" ON public.genders FOR SELECT TO authenticated USING (true);

--
-- Name: group_template_settings Authenticated users can view group_template_settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view group_template_settings" ON public.group_template_settings FOR SELECT TO authenticated USING (true);

--
-- Name: locations Authenticated users can view locations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view locations" ON public.locations FOR SELECT TO authenticated USING (true);

--
-- Name: mapping_categories Authenticated users can view mapping_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view mapping_categories" ON public.mapping_categories FOR SELECT TO authenticated USING (true);

--
-- Name: mapping_groups Authenticated users can view mapping_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view mapping_groups" ON public.mapping_groups FOR SELECT TO authenticated USING (true);

--
-- Name: metric_templates Authenticated users can view metric_templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view metric_templates" ON public.metric_templates FOR SELECT TO authenticated USING (true);

--
-- Name: payment_methods Authenticated users can view payment_methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view payment_methods" ON public.payment_methods FOR SELECT TO authenticated USING (true);

--
-- Name: payment_providers Authenticated users can view payment_providers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view payment_providers" ON public.payment_providers FOR SELECT TO authenticated USING (true);

--
-- Name: persona_definition Authenticated users can view persona_definition; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view persona_definition" ON public.persona_definition FOR SELECT TO authenticated USING (true);

--
-- Name: pipeline_type Authenticated users can view pipeline_type; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view pipeline_type" ON public.pipeline_type FOR SELECT TO authenticated USING (true);

--
-- Name: platform_categories Authenticated users can view platform_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view platform_categories" ON public.platform_categories FOR SELECT TO authenticated USING (true);

--
-- Name: platform_mapping_events Authenticated users can view platform_mapping_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view platform_mapping_events" ON public.platform_mapping_events FOR SELECT TO authenticated USING (true);

--
-- Name: platform_standard_mappings Authenticated users can view platform_standard_mappings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view platform_standard_mappings" ON public.platform_standard_mappings FOR SELECT TO authenticated USING (true);

--
-- Name: priority_level Authenticated users can view priority_level; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view priority_level" ON public.priority_level FOR SELECT TO authenticated USING (true);

--
-- Name: product_categories Authenticated users can view product_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view product_categories" ON public.product_categories FOR SELECT TO authenticated USING (true);

--
-- Name: provinces Authenticated users can view provinces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view provinces" ON public.provinces FOR SELECT TO authenticated USING (true);

--
-- Name: rating Authenticated users can view rating; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view rating" ON public.rating FOR SELECT TO authenticated USING (true);

--
-- Name: role_customers Authenticated users can view role_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view role_customers" ON public.role_customers FOR SELECT TO authenticated USING (true);

--
-- Name: role_employees Authenticated users can view role_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view role_employees" ON public.role_employees FOR SELECT TO authenticated USING (true);

--
-- Name: security_level Authenticated users can view security_level; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view security_level" ON public.security_level FOR SELECT TO authenticated USING (true);

--
-- Name: social_posts Authenticated users can view social_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view social_posts" ON public.social_posts FOR SELECT TO authenticated USING (true);

--
-- Name: tags Authenticated users can view tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view tags" ON public.tags FOR SELECT TO authenticated USING (true);

--
-- Name: time_zones Authenticated users can view time_zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view time_zones" ON public.time_zones FOR SELECT TO authenticated USING (true);

--
-- Name: variant_products Authenticated users can view variant_products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view variant_products" ON public.variant_products FOR SELECT TO authenticated USING (true);

--
-- Name: loyalty_points Employees can manage loyalty points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can manage loyalty points" ON public.loyalty_points USING (public.is_employee(auth.uid()));

--
-- Name: suspicious_activities Employees can manage suspicious activities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can manage suspicious activities" ON public.suspicious_activities USING (public.is_employee(auth.uid()));

--
-- Name: tier_history Employees can manage tier history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can manage tier history" ON public.tier_history USING (public.is_employee(auth.uid()));

--
-- Name: points_transactions Employees can manage transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can manage transactions" ON public.points_transactions USING (public.is_employee(auth.uid()));

--
-- Name: action_type_employees Employees can view action_type_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view action_type_employees" ON public.action_type_employees FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));

--
-- Name: employees_profile Employees can view all employee profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view all employee profiles" ON public.employees_profile FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE (e.user_id = auth.uid()))));

--
-- Name: loyalty_points Employees can view all loyalty points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view all loyalty points" ON public.loyalty_points FOR SELECT USING (public.is_employee(auth.uid()));

--
-- Name: tier_history Employees can view all tier history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view all tier history" ON public.tier_history FOR SELECT USING (public.is_employee(auth.uid()));

--
-- Name: points_transactions Employees can view all transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view all transactions" ON public.points_transactions FOR SELECT USING (public.is_employee(auth.uid()));

--
-- Name: error_logs Employees can view error logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view error logs" ON public.error_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.user_id = auth.uid()) AND ((e.status)::text = 'active'::text)))));

--
-- Name: suspicious_activities Employees can view suspicious activities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Employees can view suspicious activities" ON public.suspicious_activities FOR SELECT USING (public.is_employee(auth.uid()));

--
-- Name: feedback Enable read access for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for authenticated users" ON public.feedback FOR SELECT TO authenticated USING (true);

--
-- Name: rating Enable read access for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for authenticated users" ON public.rating FOR SELECT TO authenticated USING (true);

--
-- Name: workspaces Only team owners can delete teams; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only team owners can delete teams" ON public.workspaces FOR DELETE USING ((owner_id = auth.uid()));

--
-- Name: customer Prevent customer deletion; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Prevent customer deletion" ON public.customer FOR DELETE TO authenticated USING (false);

--
-- Name: ad_accounts RLS_AdAccounts_V3; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "RLS_AdAccounts_V3" ON public.ad_accounts FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.workspace_members
  WHERE ((workspace_members.team_id = ad_accounts.team_id) AND (workspace_members.user_id = auth.uid()) AND (workspace_members.status = 'active'::public.member_status)))));

--
-- Name: campaigns RLS_Campaigns_V3; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "RLS_Campaigns_V3" ON public.campaigns FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.ad_accounts aa
     JOIN public.workspace_members tm ON ((aa.team_id = tm.team_id)))
  WHERE ((aa.id = campaigns.ad_account_id) AND (tm.user_id = auth.uid()) AND (tm.status = 'active'::public.member_status)))));

--
-- Name: ad_insights RLS_Insights_V3; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "RLS_Insights_V3" ON public.ad_insights FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.ad_accounts aa
     JOIN public.workspace_members tm ON ((aa.team_id = tm.team_id)))
  WHERE ((aa.id = ad_insights.ad_account_id) AND (tm.user_id = auth.uid()) AND (tm.status = 'active'::public.member_status)))));

--
-- Name: team_activity_logs System can insert activity logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "System can insert activity logs" ON public.team_activity_logs FOR INSERT WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_accounts Team admins can delete ad_accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can delete ad_accounts" ON public.ad_accounts FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: customer_personas Team admins can delete personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can delete personas" ON public.customer_personas FOR DELETE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: reports Team admins can delete reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can delete reports" ON public.reports FOR DELETE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: social_posts Team admins can delete social posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can delete social posts" ON public.social_posts FOR DELETE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: budgets Team admins can manage budgets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can manage budgets" ON public.budgets USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: cohort_analysis Team admins can manage cohort analysis; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can manage cohort analysis" ON public.cohort_analysis USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: revenue_metrics Team admins can manage revenue metrics; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can manage revenue metrics" ON public.revenue_metrics USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: scheduled_reports Team admins can manage scheduled reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team admins can manage scheduled reports" ON public.scheduled_reports USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: team_invitations Team managers can create invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can create invitations" ON public.team_invitations FOR INSERT WITH CHECK (public.can_manage_team(auth.uid(), team_id));

--
-- Name: team_invitations Team managers can delete invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can delete invitations" ON public.team_invitations FOR DELETE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: workspace_members Team managers can delete members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can delete members" ON public.workspace_members FOR DELETE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: workspace_members Team managers can insert members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can insert members" ON public.workspace_members FOR INSERT WITH CHECK (public.can_manage_team(auth.uid(), team_id));

--
-- Name: workspace_api_keys Team managers can manage API keys; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can manage API keys" ON public.workspace_api_keys USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: team_role_permissions Team managers can manage role permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can manage role permissions" ON public.team_role_permissions USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: team_invitations Team managers can update invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can update invitations" ON public.team_invitations FOR UPDATE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: workspace_members Team managers can update members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team managers can update members" ON public.workspace_members FOR UPDATE USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: customer_personas Team members can create personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can create personas" ON public.customer_personas FOR INSERT WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: reports Team members can create reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can create reports" ON public.reports FOR INSERT WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: social_posts Team members can create social posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can create social posts" ON public.social_posts FOR INSERT WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_accounts Team members can insert ad_accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can insert ad_accounts" ON public.ad_accounts FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_accounts Team members can update ad_accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can update ad_accounts" ON public.ad_accounts FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: customer_personas Team members can update personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can update personas" ON public.customer_personas FOR UPDATE USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: reports Team members can update reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can update reports" ON public.reports FOR UPDATE USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: social_posts Team members can update social posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can update social posts" ON public.social_posts FOR UPDATE USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: team_activity_logs Team members can view activity logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view activity logs" ON public.team_activity_logs FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: budgets Team members can view budgets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view budgets" ON public.budgets FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: cohort_analysis Team members can view cohort analysis; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view cohort analysis" ON public.cohort_analysis FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: conversion_events Team members can view conversion_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view conversion_events" ON public.conversion_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ad_accounts
  WHERE ((ad_accounts.id = conversion_events.ad_account_id) AND public.is_team_member(auth.uid(), ad_accounts.team_id)))));

--
-- Name: team_invitations Team members can view invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view invitations" ON public.team_invitations FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: customer_personas Team members can view personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view personas" ON public.customer_personas FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: reports Team members can view reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view reports" ON public.reports FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: revenue_metrics Team members can view revenue metrics; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view revenue metrics" ON public.revenue_metrics FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: team_role_permissions Team members can view role permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view role permissions" ON public.team_role_permissions FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: scheduled_reports Team members can view scheduled reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view scheduled reports" ON public.scheduled_reports FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: social_posts Team members can view social posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view social posts" ON public.social_posts FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: workspace_api_keys Team members can view their API keys; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view their API keys" ON public.workspace_api_keys FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: workspace_members Team members can view their team members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view their team members" ON public.workspace_members FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: workspaces Team members can view their teams; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team members can view their teams" ON public.workspaces FOR SELECT USING (((owner_id = auth.uid()) OR public.is_team_member(auth.uid(), id)));

--
-- Name: workspaces Team owners and admins can update teams; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Team owners and admins can update teams" ON public.workspaces FOR UPDATE USING (public.can_manage_team(auth.uid(), id));

--
-- Name: workspaces Users can create teams; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create teams" ON public.workspaces FOR INSERT WITH CHECK ((owner_id = auth.uid()));

--
-- Name: prospects Users can delete their own prospects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own prospects" ON public.prospects FOR DELETE USING ((auth.uid() = user_id));

--
-- Name: profile_customers Users can insert own customer profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own customer profile" ON public.profile_customers FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));

--
-- Name: feedback Users can insert their own feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

--
-- Name: customer_insights Users can insert their own insights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own insights" ON public.customer_insights FOR INSERT WITH CHECK ((auth.uid() = user_id));

--
-- Name: prospects Users can insert their own prospects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own prospects" ON public.prospects FOR INSERT WITH CHECK ((auth.uid() = user_id));

--
-- Name: customer Users can update own customer; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own customer" ON public.customer FOR UPDATE TO authenticated USING ((auth.uid() = id));

--
-- Name: profile_customers Users can update own customer profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own customer profile" ON public.profile_customers FOR UPDATE TO authenticated USING ((user_id = auth.uid()));

--
-- Name: employees Users can update own employee; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own employee" ON public.employees FOR UPDATE TO authenticated USING ((auth.uid() = user_id));

--
-- Name: employees_profile Users can update own employee profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own employee profile" ON public.employees_profile FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid())))));

--
-- Name: profile_customers Users can update own profile_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile_customers" ON public.profile_customers FOR UPDATE TO authenticated USING ((auth.uid() = user_id));

--
-- Name: feedback Users can update their own feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own feedback" ON public.feedback FOR UPDATE TO authenticated USING ((auth.uid() = user_id));

--
-- Name: customer_insights Users can update their own insights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own insights" ON public.customer_insights FOR UPDATE USING ((auth.uid() = user_id));

--
-- Name: prospects Users can update their own prospects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own prospects" ON public.prospects FOR UPDATE USING ((auth.uid() = user_id));

--
-- Name: customer Users can view own customer; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own customer" ON public.customer FOR SELECT TO authenticated USING ((auth.uid() = id));

--
-- Name: profile_customers Users can view own customer profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own customer profile" ON public.profile_customers FOR SELECT TO authenticated USING ((user_id = auth.uid()));

--
-- Name: loyalty_points Users can view own loyalty points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.customer p
  WHERE ((p.id = auth.uid()) AND (p.loyalty_tier_id = loyalty_points.loyalty_tier_id)))));

--
-- Name: profile_customers Users can view own profile_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile_customers" ON public.profile_customers FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: tier_history Users can view own tier history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own tier history" ON public.tier_history FOR SELECT USING ((auth.uid() = user_id));

--
-- Name: points_transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own transactions" ON public.points_transactions FOR SELECT USING ((auth.uid() = user_id));

--
-- Name: feedback Users can view their own feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: customer_insights Users can view their own insights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own insights" ON public.customer_insights FOR SELECT USING ((auth.uid() = user_id));

--
-- Name: prospects Users can view their own prospects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own prospects" ON public.prospects FOR SELECT USING ((auth.uid() = user_id));

--
-- Name: aarrr_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.aarrr_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: action_type; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.action_type ENABLE ROW LEVEL SECURITY;

--
-- Name: action_type_employees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.action_type_employees ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_accounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_buying_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_buying_types ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_groups; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_insights; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: aarrr_categories admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.aarrr_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: action_type admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.action_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: action_type_employees admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.action_type_employees TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ad_buying_types admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.ad_buying_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ai_parameters admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.ai_parameters TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: app_features admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.app_features TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: attribution_types admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.attribution_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: business_types admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.business_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: change_type admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.change_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: cohort_analysis admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.cohort_analysis TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: countries admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.countries TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: creative_types admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.creative_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: currencies admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.currencies TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: discounts admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.discounts TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees_profile admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.employees_profile TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_categories admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.event_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_definition admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.event_definition TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: event_types admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.event_types TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: funnel_stages admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.funnel_stages TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: genders admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.genders TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: group_template_settings admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.group_template_settings TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: industries admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.industries TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: loyalty_points admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.loyalty_points TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: mapping_categories admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.mapping_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: mapping_groups admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.mapping_groups TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: metric_templates admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.metric_templates TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: payment_methods admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.payment_methods TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: payment_providers admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.payment_providers TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: pipeline_type admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.pipeline_type TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_mapping_events admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.platform_mapping_events TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: platform_standard_mappings admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.platform_standard_mappings TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: priority_level admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.priority_level TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: product_categories admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.product_categories TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: provinces admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.provinces TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: rating admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.rating TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: role_customers admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.role_customers TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: security_level admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.security_level TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: tags admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.tags TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: time_zones admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.time_zones TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: variant_products admin_owner_manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_manage ON public.variant_products TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ad_groups admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.ad_groups TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ads admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.ads TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: api_configurations admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.api_configurations TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: audit_log_employees admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.audit_log_employees TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: conversion_items admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.conversion_items TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: data_pipeline admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.data_pipeline TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: deployment_pipeline admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.deployment_pipeline TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: external_api_status admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.external_api_status TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: provider_server admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.provider_server TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: request_logs admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.request_logs TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: server admin_owner_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_only ON public.server TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer_activities admin_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_select ON public.customer_activities FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer_insights admin_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_select ON public.customer_insights FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: feedback admin_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_owner_select ON public.feedback FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: ads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_parameters; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ai_parameters ENABLE ROW LEVEL SECURITY;

--
-- Name: api_configurations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: app_features; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;

--
-- Name: attribution_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.attribution_types ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log_employees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_log_employees ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs_enhanced; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs_enhanced ENABLE ROW LEVEL SECURITY;

--
-- Name: aarrr_categories authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.aarrr_categories FOR SELECT TO authenticated USING (true);

--
-- Name: action_type authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.action_type FOR SELECT TO authenticated USING (true);

--
-- Name: action_type_employees authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.action_type_employees FOR SELECT TO authenticated USING (true);

--
-- Name: ad_buying_types authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.ad_buying_types FOR SELECT TO authenticated USING (true);

--
-- Name: ai_parameters authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.ai_parameters FOR SELECT TO authenticated USING (true);

--
-- Name: app_features authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.app_features FOR SELECT TO authenticated USING (true);

--
-- Name: attribution_types authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.attribution_types FOR SELECT TO authenticated USING (true);

--
-- Name: business_types authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.business_types FOR SELECT TO authenticated USING (true);

--
-- Name: change_type authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.change_type FOR SELECT TO authenticated USING (true);

--
-- Name: countries authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.countries FOR SELECT TO authenticated USING (true);

--
-- Name: creative_types authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.creative_types FOR SELECT TO authenticated USING (true);

--
-- Name: currencies authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.currencies FOR SELECT TO authenticated USING (true);

--
-- Name: discounts authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.discounts FOR SELECT TO authenticated USING (true);

--
-- Name: event_categories authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.event_categories FOR SELECT TO authenticated USING (true);

--
-- Name: event_definition authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.event_definition FOR SELECT TO authenticated USING (true);

--
-- Name: event_types authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.event_types FOR SELECT TO authenticated USING (true);

--
-- Name: funnel_stages authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.funnel_stages FOR SELECT TO authenticated USING (true);

--
-- Name: genders authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.genders FOR SELECT TO authenticated USING (true);

--
-- Name: group_template_settings authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.group_template_settings FOR SELECT TO authenticated USING (true);

--
-- Name: industries authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.industries FOR SELECT TO authenticated USING (true);

--
-- Name: loyalty_points authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.loyalty_points FOR SELECT TO authenticated USING (true);

--
-- Name: mapping_categories authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.mapping_categories FOR SELECT TO authenticated USING (true);

--
-- Name: mapping_groups authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.mapping_groups FOR SELECT TO authenticated USING (true);

--
-- Name: metric_templates authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.metric_templates FOR SELECT TO authenticated USING (true);

--
-- Name: payment_methods authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.payment_methods FOR SELECT TO authenticated USING (true);

--
-- Name: payment_providers authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.payment_providers FOR SELECT TO authenticated USING (true);

--
-- Name: persona_definition authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.persona_definition FOR SELECT TO authenticated USING (true);

--
-- Name: pipeline_type authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.pipeline_type FOR SELECT TO authenticated USING (true);

--
-- Name: platform_mapping_events authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.platform_mapping_events FOR SELECT TO authenticated USING (true);

--
-- Name: platform_standard_mappings authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.platform_standard_mappings FOR SELECT TO authenticated USING (true);

--
-- Name: priority_level authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.priority_level FOR SELECT TO authenticated USING (true);

--
-- Name: product_categories authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.product_categories FOR SELECT TO authenticated USING (true);

--
-- Name: provinces authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.provinces FOR SELECT TO authenticated USING (true);

--
-- Name: rating authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.rating FOR SELECT TO authenticated USING (true);

--
-- Name: role_customers authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.role_customers FOR SELECT TO authenticated USING (true);

--
-- Name: security_level authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.security_level FOR SELECT TO authenticated USING (true);

--
-- Name: tags authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.tags FOR SELECT TO authenticated USING (true);

--
-- Name: time_zones authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.time_zones FOR SELECT TO authenticated USING (true);

--
-- Name: variant_products authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_read ON public.variant_products FOR SELECT TO authenticated USING (true);

--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: business_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_types ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaigns_delete_policy ON public.campaigns FOR DELETE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = campaigns.ad_account_id) AND public.can_manage_team(auth.uid(), aa.team_id)))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: campaigns campaigns_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaigns_insert_policy ON public.campaigns FOR INSERT TO authenticated WITH CHECK (((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = campaigns.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: campaigns campaigns_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaigns_select_policy ON public.campaigns FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = campaigns.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: campaigns campaigns_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaigns_update_policy ON public.campaigns FOR UPDATE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = campaigns.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK (((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = campaigns.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: change_type; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.change_type ENABLE ROW LEVEL SECURITY;

--
-- Name: cohort_analysis; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: conversion_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

--
-- Name: conversion_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversion_items ENABLE ROW LEVEL SECURITY;

--
-- Name: countries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

--
-- Name: creative_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.creative_types ENABLE ROW LEVEL SECURITY;

--
-- Name: currencies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

--
-- Name: customer; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_activities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_insights; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_personas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;

--
-- Name: data_pipeline; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.data_pipeline ENABLE ROW LEVEL SECURITY;

--
-- Name: deployment_pipeline; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.deployment_pipeline ENABLE ROW LEVEL SECURITY;

--
-- Name: discounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

--
-- Name: employees emp_delete_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY emp_delete_admin ON public.employees FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees emp_insert_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY emp_insert_admin ON public.employees FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees emp_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY emp_select_admin ON public.employees FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees emp_select_self; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY emp_select_self ON public.employees FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: employees emp_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY emp_update_admin ON public.employees FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: employees_profile employee_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY employee_self_select ON public.employees_profile FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid())))));

--
-- Name: employees_profile employee_self_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY employee_self_update ON public.employees_profile FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.employees e
  WHERE ((e.id = employees_profile.employees_id) AND (e.user_id = auth.uid())))));

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: employees_profile; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.employees_profile ENABLE ROW LEVEL SECURITY;

--
-- Name: error_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: event_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: event_definition; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_definition ENABLE ROW LEVEL SECURITY;

--
-- Name: event_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

--
-- Name: external_api_status; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.external_api_status ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: funnel_stages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.funnel_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: genders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;

--
-- Name: group_template_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.group_template_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: industries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices inv_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inv_admin ON public.invoices TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: invoices inv_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inv_insert_own ON public.invoices FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

--
-- Name: invoices inv_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inv_select_own ON public.invoices FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_points; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_tiers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: mapping_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mapping_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: mapping_groups; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mapping_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: metric_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.metric_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: locations owner_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_access ON public.locations TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.profile_customers pc
  WHERE ((pc.location_id = locations.id) AND (pc.user_id = auth.uid())))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))) WITH CHECK (((EXISTS ( SELECT 1
   FROM public.profile_customers pc
  WHERE ((pc.location_id = locations.id) AND (pc.user_id = auth.uid())))) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: customer_insights owner_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_all ON public.customer_insights TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

--
-- Name: feedback owner_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_all ON public.feedback TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

--
-- Name: customer_activities owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_insert ON public.customer_activities FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profile_customers pc
  WHERE ((pc.id = customer_activities.profile_customer_id) AND (pc.user_id = auth.uid())))));

--
-- Name: customer_activities owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_select ON public.customer_activities FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profile_customers pc
  WHERE ((pc.id = customer_activities.profile_customer_id) AND (pc.user_id = auth.uid())))));

--
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_providers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: persona_definition; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.persona_definition ENABLE ROW LEVEL SECURITY;

--
-- Name: pipeline_type; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pipeline_type ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_mapping_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_mapping_events ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_standard_mappings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_standard_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: platforms; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

--
-- Name: points_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: priority_level; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.priority_level ENABLE ROW LEVEL SECURITY;

--
-- Name: product_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profile_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: prospects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_server; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.provider_server ENABLE ROW LEVEL SECURITY;

--
-- Name: provinces; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

--
-- Name: rating; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rating ENABLE ROW LEVEL SECURITY;

--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: request_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: revenue_metrics; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: role_customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.role_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: role_employees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.role_employees ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_reports; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: security_level; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.security_level ENABLE ROW LEVEL SECURITY;

--
-- Name: server; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server ENABLE ROW LEVEL SECURITY;

--
-- Name: social_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions sub_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sub_admin ON public.subscriptions TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: subscriptions sub_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sub_insert_own ON public.subscriptions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

--
-- Name: subscriptions sub_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sub_select_own ON public.subscriptions FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: subscriptions sub_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sub_update_own ON public.subscriptions FOR UPDATE TO authenticated USING ((auth.uid() = user_id));

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: suspicious_activities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: system_health; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: team_activity_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_accounts team_admin_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_admin_delete ON public.ad_accounts FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: ad_insights team_admin_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_admin_delete ON public.ad_insights FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = ad_insights.ad_account_id) AND public.can_manage_team(auth.uid(), aa.team_id)))));

--
-- Name: budgets team_admin_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_admin_delete ON public.budgets FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));

--
-- Name: team_invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_accounts team_member_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_insert ON public.ad_accounts FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_insights team_member_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_insert ON public.ad_insights FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = ad_insights.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))));

--
-- Name: budgets team_member_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_insert ON public.budgets FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: conversion_events team_member_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_insert ON public.conversion_events FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = conversion_events.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))));

--
-- Name: ad_accounts team_member_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_select ON public.ad_accounts FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_insights team_member_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_select ON public.ad_insights FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = ad_insights.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))));

--
-- Name: budgets team_member_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_select ON public.budgets FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: cohort_analysis team_member_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_select ON public.cohort_analysis FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

--
-- Name: conversion_events team_member_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_select ON public.conversion_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = conversion_events.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))));

--
-- Name: ad_accounts team_member_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_update ON public.ad_accounts FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: ad_insights team_member_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_update ON public.ad_insights FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = ad_insights.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.ad_accounts aa
  WHERE ((aa.id = ad_insights.ad_account_id) AND public.is_team_member(auth.uid(), aa.team_id)))));

--
-- Name: budgets team_member_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY team_member_update ON public.budgets FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

--
-- Name: team_role_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.team_role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: tier_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tier_history ENABLE ROW LEVEL SECURITY;

--
-- Name: time_zones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.time_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_transactions txn_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY txn_admin ON public.payment_transactions FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role)));

--
-- Name: payment_transactions txn_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY txn_insert_own ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

--
-- Name: payment_transactions txn_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY txn_select_own ON public.payment_transactions FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Name: user_payment_methods upm_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upm_own ON public.user_payment_methods TO authenticated USING ((auth.uid() = user_id));

--
-- Name: user_payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: variant_products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.variant_products ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_api_keys; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workspace_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

