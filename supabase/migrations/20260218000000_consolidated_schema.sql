-- Consolidated Schema (DDL)
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET transaction_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;

--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'customer',
    'admin',
    'owner',
    'dev',
    'support'
);

ALTER TYPE public.app_role OWNER TO postgres;

--
-- Name: invitation_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);

ALTER TYPE public.invitation_status OWNER TO postgres;

--
-- Name: member_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.member_status AS ENUM (
    'active',
    'suspended',
    'removed'
);

ALTER TYPE public.member_status OWNER TO postgres;

--
-- Name: team_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.team_role AS ENUM (
    'owner',
    'admin',
    'editor',
    'viewer'
);

ALTER TYPE public.team_role OWNER TO postgres;

--
-- Name: assign_admin_role_on_approval(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_admin_role_on_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_admin_role_id UUID;
BEGIN
    -- Check if approval_status changed to 'approved' AND role is not already set
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        -- Only assign default admin role if NO role is currently assigned
        IF NEW.role_employees_id IS NULL THEN
            -- Get the Admin role ID (case-insensitive)
            SELECT id INTO v_admin_role_id 
            FROM public.role_employees 
            WHERE role_name ILIKE 'admin' 
            LIMIT 1;
            
            -- If admin role exists, assign it
            IF v_admin_role_id IS NOT NULL THEN
                NEW.role_employees_id := v_admin_role_id;
                RAISE NOTICE 'Admin role (%) assigned to employee: %', v_admin_role_id, NEW.email;
            ELSE
                RAISE WARNING 'Admin role not found in role_employees table';
            END IF;
        END IF;

        -- Ensure status is active only if user is already linked (signed up)
        IF NEW.user_id IS NOT NULL THEN
            NEW.status := 'active';
        ELSE
            NEW.status := 'inactive';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.assign_admin_role_on_approval() OWNER TO postgres;

--
-- Name: can_manage_team(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
    AND team_id = _team_id
    AND status = 'active'
    AND role IN ('owner', 'admin')
  );
$$;

ALTER FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid) OWNER TO postgres;

--
-- Name: generate_invoice_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_invoice_number() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('invoice_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_invoice_number() OWNER TO postgres;

--
-- Name: get_employee_role(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_employee_role(_user_id uuid) RETURNS character varying
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT r.role_name 
    FROM public.employees e
    JOIN public.role_employees r ON e.role_employees_id = r.id
    WHERE e.user_id = _user_id
    AND e.status = 'active'
    AND e.approval_status = 'approved'
    LIMIT 1
$$;

ALTER FUNCTION public.get_employee_role(_user_id uuid) OWNER TO postgres;

--
-- Name: get_my_team_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_my_team_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND status = 'active';
$$;

ALTER FUNCTION public.get_my_team_ids() OWNER TO postgres;

--
-- Name: get_team_role(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_team_role(_user_id uuid, _team_id uuid) RETURNS public.team_role
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT role
  FROM public.workspace_members
  WHERE user_id = _user_id
  AND team_id = _team_id
  AND status = 'active';
$$;

ALTER FUNCTION public.get_team_role(_user_id uuid, _team_id uuid) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    new_employee_id uuid;
    existing_employee_id uuid;
    _gender_id uuid;
BEGIN
    -- 1. Check if it's an EXPLICIT employee signup (/employee/signup sends this flag)
    -- The user requires that employees sign up through the dedicated page
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        
        -- Check for existing employee record with same email that hasn't been linked yet
        SELECT id INTO existing_employee_id
        FROM public.employees
        WHERE LOWER(email) = LOWER(new.email)
        AND user_id IS NULL
        LIMIT 1;

        IF existing_employee_id IS NOT NULL THEN
            -- Link new user to existing record
            UPDATE public.employees
            SET 
                user_id = new.id,
                status = 'active',
                updated_at = now()
            WHERE id = existing_employee_id;
            
            new_employee_id := existing_employee_id;
            
            -- DATA PRIORITY:
            -- 1. Role (role_employees_id): STRICTLY FROM ADMIN (already in the existing record)
            -- 2. Name/Profile: FROM USER (newly provided during signup)
            INSERT INTO public.employees_profile (
                employees_id,
                first_name,
                last_name,
                aptitude,
                birthday_at
            )
            VALUES (
                new_employee_id,
                COALESCE(new.raw_user_meta_data->>'first_name', ''),
                COALESCE(new.raw_user_meta_data->>'last_name', ''),
                COALESCE(new.raw_user_meta_data->>'aptitude', ''),
                CASE 
                    WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
                    AND new.raw_user_meta_data->>'birthday' != '' 
                    THEN (new.raw_user_meta_data->>'birthday')::date
                    ELSE NULL
                END
            )
            ON CONFLICT (employees_id) DO UPDATE SET
                -- Update name/aptitude from user signup data
                first_name = COALESCE(new.raw_user_meta_data->>'first_name', employees_profile.first_name),
                last_name = COALESCE(new.raw_user_meta_data->>'last_name', employees_profile.last_name),
                aptitude = COALESCE(new.raw_user_meta_data->>'aptitude', employees_profile.aptitude),
                birthday_at = COALESCE((new.raw_user_meta_data->>'birthday')::date, employees_profile.birthday_at),
                updated_at = now();
        ELSE
            -- Create new employee record if no existing record found (still an employee signup)
            INSERT INTO public.employees (
                user_id, 
                email, 
                status, 
                approval_status,
                role_employees_id
            )
            VALUES (
                new.id, 
                new.email, 
                'inactive', 
                'pending',
                NULL
            )
            RETURNING id INTO new_employee_id;

            -- Create employee profile
            IF new_employee_id IS NOT NULL THEN
                INSERT INTO public.employees_profile (
                    employees_id,
                    first_name,
                    last_name,
                    aptitude,
                    birthday_at
                )
                VALUES (
                    new_employee_id,
                    new.raw_user_meta_data->>'first_name',
                    new.raw_user_meta_data->>'last_name',
                    new.raw_user_meta_data->>'aptitude',
                    CASE 
                        WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
                        AND new.raw_user_meta_data->>'birthday' != '' 
                        THEN (new.raw_user_meta_data->>'birthday')::date
                        ELSE NULL
                    END
                );
            END IF;
        END IF;
    -- Note: If they sign up through the customer page, they fall through to the customer flow below
    ELSE
        -- Default customer flow (Strictly separated)
        
        -- 1. Create Core Customer Record
        INSERT INTO public.customer (id, email, full_name, plan_type)
        VALUES (
            new.id, 
            new.email, 
            COALESCE(new.raw_user_meta_data->>'full_name', new.email),
            'free'
        )
        ON CONFLICT (id) DO NOTHING;

        -- 2. Assign customer role (Legacy support)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, 'customer')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- 3. Safe cast for gender_id
        BEGIN
            _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            _gender_id := NULL;
        END;

        -- 4. Create Profile Customers Record
        -- Wrapped in exception block to prevent blocking signup on metadata errors
        BEGIN
            INSERT INTO public.profile_customers (
                user_id, 
                first_name, 
                last_name, 
                phone_number,
                gender_id,
                salary_range
            )
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                new.raw_user_meta_data->>'phone',
                _gender_id,
                new.raw_user_meta_data->>'salary_range'
            )
            ON CONFLICT (user_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone_number = EXCLUDED.phone_number,
                gender_id = EXCLUDED.gender_id,
                salary_range = EXCLUDED.salary_range;
        EXCEPTION WHEN OTHERS THEN
            -- Allow signup to proceed even if profile creation fails (logs error to Postgres logs)
            RAISE WARNING 'Error creating profile_customers for user %: %', new.id, SQLERRM;
        END;
            
    END IF;
    
    RETURN new;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: has_employee_role(uuid, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.role_employees r ON e.role_employees_id = r.id
        WHERE e.user_id = _user_id
        AND e.status = 'active'
        AND e.approval_status = 'approved'
        AND r.role_name = _role_name
    )
$$;

ALTER FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying) OWNER TO postgres;

--
-- Name: has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.role_employees re
    JOIN public.employees e ON e.role_employees_id = re.id
    WHERE e.user_id = _user_id
    AND e.status = 'active'
    AND e.approval_status = 'approved'
    AND LOWER(re.role_name) = LOWER(_role)  -- Case-insensitive comparison
  );
END;
$$;

ALTER FUNCTION public.has_role(_user_id uuid, _role text) OWNER TO postgres;

--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

ALTER FUNCTION public.has_role(_user_id uuid, _role public.app_role) OWNER TO postgres;

--
-- Name: is_employee(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_employee(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees
        WHERE user_id = _user_id
        AND status = 'active'
        AND approval_status = 'approved'
    )
$$;

ALTER FUNCTION public.is_employee(_user_id uuid) OWNER TO postgres;

--
-- Name: is_team_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = _user_id
    AND team_id = _team_id
    AND status = 'active'
  );
$$;

ALTER FUNCTION public.is_team_member(_user_id uuid, _team_id uuid) OWNER TO postgres;

--
-- Name: sync_employee_to_user_roles(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_employee_to_user_roles() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_role_name text;
    v_app_role app_role;
BEGIN
    -- Get the role name from role_employees
    SELECT LOWER(role_name) INTO v_role_name
    FROM public.role_employees
    WHERE id = NEW.role_employees_id;

    -- Map 'developer' or 'dev' to 'dev' app_role
    -- Map 'admin' to 'admin' app_role
    -- Map 'owner' to 'owner' app_role
    -- Others defaults to null (no user_role entry)
    -- Map 'dev', 'admin', 'owner', 'support' to their respective app_roles
    IF NEW.user_id IS NOT NULL AND v_role_name IN ('owner', 'admin', 'dev', 'support') THEN
        v_app_role := v_role_name::app_role;
        
        -- Upsert into user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, v_app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- STRICT MAPPING: When a user becomes an employee, remove their customer role
        -- to ensure they are redirected to the employee dashboard
        DELETE FROM public.user_roles 
        WHERE user_id = NEW.user_id 
        AND role = 'customer';
    END IF;

    RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_employee_to_user_roles() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aarrr_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aarrr_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    display_order integer DEFAULT 0,
    description text,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.aarrr_categories OWNER TO postgres;

--
-- Name: action_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_name character varying(100) NOT NULL,
    description text,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.action_type OWNER TO postgres;

--
-- Name: action_type_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_type_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_name character varying(100) NOT NULL,
    description text,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.action_type_employees OWNER TO postgres;

--
-- Name: ad_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    platform_id uuid,
    account_name character varying(255) NOT NULL,
    platform_account_id character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ad_accounts OWNER TO postgres;

--
-- Name: ad_buying_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_buying_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ad_buying_types OWNER TO postgres;

--
-- Name: ad_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ad_groups OWNER TO postgres;

--
-- Name: ad_insights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_account_id uuid,
    campaign_id uuid,
    ads_id uuid,
    date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    spend numeric(15,2) DEFAULT 0,
    roas numeric(15,2),
    conversions integer DEFAULT 0,
    reach integer DEFAULT 0,
    ctr numeric(8,4),
    cpc numeric(15,2),
    cpm numeric(15,2),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ad_insights OWNER TO postgres;

--
-- Name: ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_group_id uuid,
    creative_type_id uuid,
    name character varying(255) NOT NULL,
    status character varying(50),
    creative_url text,
    platform_ad_id character varying(255),
    ad_copy text,
    preview_url text,
    headline character varying(255),
    call_to_action character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ads OWNER TO postgres;

--
-- Name: ai_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_parameters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parameter_name text NOT NULL,
    parameter_value text NOT NULL,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_parameters OWNER TO postgres;

--
-- Name: api_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    client_id text,
    client_secret text,
    api_version text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.api_configurations OWNER TO postgres;

--
-- Name: app_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    slug character varying(255),
    description character varying(1000),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.app_features OWNER TO postgres;

--
-- Name: attribution_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribution_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_mapping_standard_id uuid,
    name character varying(255) NOT NULL,
    attribution_window_days integer,
    slug character varying(255),
    description text,
    priority_score integer DEFAULT 0,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.attribution_types OWNER TO postgres;

--
-- Name: audit_log_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employees_id uuid,
    action_employees_id uuid,
    metadata jsonb,
    action_timestamp timestamp with time zone DEFAULT now(),
    ip_address character varying(45),
    old_values jsonb,
    new_values jsonb,
    target_entity_id uuid
);

ALTER TABLE public.audit_log_employees OWNER TO postgres;

--
-- Name: audit_logs_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs_enhanced (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    server_id uuid,
    action_type_id uuid,
    category character varying(100),
    description text,
    ip_address character varying(45),
    status character varying(50),
    error_id uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs_enhanced OWNER TO postgres;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    campaign_id uuid,
    name character varying(255) NOT NULL,
    budget_type character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    spent_amount numeric(15,2) DEFAULT 0,
    remaining_amount numeric(15,2),
    currency_id uuid,
    start_date date,
    end_date date,
    alert_threshold_percent integer DEFAULT 80,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: business_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    is_active boolean DEFAULT true,
    description text,
    icon_url text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.business_types OWNER TO postgres;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_account_id uuid,
    ad_buying_type_id uuid,
    mapping_groups_id uuid,
    name character varying(255) NOT NULL,
    status character varying(50),
    objective character varying(100),
    budget_amount numeric(15,2),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: change_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.change_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    priority_level_id uuid,
    name character varying(100) NOT NULL,
    description text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.change_type OWNER TO postgres;

--
-- Name: cohort_analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cohort_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    cohort_date date NOT NULL,
    cohort_type character varying(50) DEFAULT 'monthly'::character varying,
    cohort_size integer DEFAULT 0,
    retention_data jsonb,
    revenue_data jsonb,
    active_users_data jsonb,
    average_retention numeric(5,2),
    lifetime_value numeric(15,2),
    churn_rate numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.cohort_analysis OWNER TO postgres;

--
-- Name: conversion_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversion_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_account_id uuid,
    ads_id uuid,
    event_type_id uuid,
    attribution_type_id uuid,
    conversion_item_id uuid,
    occurred_at timestamp with time zone NOT NULL,
    platform_event_id character varying(255),
    event_name character varying(255),
    event_value numeric(15,2) DEFAULT 0,
    attribution_window integer,
    processing_status character varying(50) DEFAULT 'pending'::character varying,
    meta_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.conversion_events OWNER TO postgres;

--
-- Name: conversion_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversion_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_category_id uuid,
    variant_product_id uuid,
    product_name character varying(255),
    quantity integer DEFAULT 1,
    unit_price numeric(15,2) DEFAULT 0.00,
    total_price numeric(15,2),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.conversion_items OWNER TO postgres;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(3),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: creative_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creative_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.creative_types OWNER TO postgres;

--
-- Name: currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(3) NOT NULL,
    name character varying(100) NOT NULL,
    symbol character varying(10),
    decimal_places integer DEFAULT 2,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.currencies OWNER TO postgres;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id uuid NOT NULL,
    email text,
    full_name text,
    company_name text,
    plan_type text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone_number character varying(50),
    birthday_at date,
    last_active timestamp with time zone,
    loyalty_tier_id uuid,
    loyalty_points_balance integer DEFAULT 0,
    total_spend_amount numeric DEFAULT 0,
    member_since timestamp with time zone DEFAULT now()
);

ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: customer_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_customer_id uuid,
    event_type_id uuid,
    campaign_id uuid,
    session_id character varying(255),
    page_url text,
    referrer_url text,
    device_type character varying(50),
    browser character varying(100),
    ip_address character varying(45),
    event_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.customer_activities OWNER TO postgres;

--
-- Name: customer_insights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profession text NOT NULL,
    company text NOT NULL,
    salary_range text NOT NULL,
    num_employees text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone text
);

ALTER TABLE public.customer_insights OWNER TO postgres;

--
-- Name: customer_personas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_personas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    persona_name character varying(255) NOT NULL,
    description text,
    avatar_url text,
    gender_id uuid,
    age_min integer,
    age_max integer,
    location_id uuid,
    profession character varying(255),
    company_size character varying(100),
    salary_range character varying(100),
    industry character varying(255),
    preferred_devices text[],
    active_hours character varying(100),
    interests text[],
    pain_points text[],
    goals text[],
    custom_fields jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);

ALTER TABLE public.customer_personas OWNER TO postgres;

--
-- Name: TABLE customer_personas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.customer_personas IS 'Stores custom customer personas created by Buzzly users for their workspace/business';

--
-- Name: data_pipeline; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_pipeline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pipeline_type_id uuid,
    name character varying(255) NOT NULL,
    status character varying(50),
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    schedule_cron character varying(100),
    config jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.data_pipeline OWNER TO postgres;

--
-- Name: deployment_pipeline; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deployment_pipeline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pipeline_type_id uuid,
    name character varying(255) NOT NULL,
    status character varying(50),
    version character varying(50),
    deployed_at timestamp with time zone,
    deployed_by uuid,
    config jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.deployment_pipeline OWNER TO postgres;

--
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(50),
    discount_value numeric(15,2) DEFAULT 0,
    min_order_value numeric(15,2) DEFAULT 0,
    max_discount_amount numeric(15,2),
    usage_limit integer,
    usage_count integer DEFAULT 0,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.discounts OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    role_employees_id uuid,
    email character varying(255) NOT NULL,
    password_hash text,
    status character varying(50),
    is_locked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid,
    approved_at timestamp with time zone,
    invited_by uuid,
    invitation_token character varying(255),
    invitation_expires_at timestamp with time zone
);

ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employees_id uuid,
    role_employees_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    birthday_at date,
    last_active timestamp with time zone,
    profile_img text,
    aptitude text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.employees_profile OWNER TO postgres;

--
-- Name: error_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.error_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level text NOT NULL,
    message text NOT NULL,
    request_id text,
    user_id uuid,
    stack_trace text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.error_logs OWNER TO postgres;

--
-- Name: event_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    color_code character varying(7),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.event_categories OWNER TO postgres;

--
-- Name: event_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_definition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    funnel_stages_id uuid,
    app_features_id uuid,
    event_name character varying(255),
    display_name character varying(255),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.event_definition OWNER TO postgres;

--
-- Name: event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_category_id uuid,
    platform_mapping_event_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    priority_score integer DEFAULT 0,
    icon_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.event_types OWNER TO postgres;

--
-- Name: external_api_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_api_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid,
    latency_ms integer,
    last_status_code integer,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.external_api_status OWNER TO postgres;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rating_id uuid,
    customer_activities_id uuid,
    user_id uuid,
    comment character varying(2000),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.feedback OWNER TO postgres;

--
-- Name: funnel_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funnel_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aarrr_categories_id uuid,
    name character varying(200),
    slug character varying(200),
    display_order integer,
    description character varying(500),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.funnel_stages OWNER TO postgres;

--
-- Name: genders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_gender character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.genders OWNER TO postgres;

--
-- Name: group_template_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_template_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mapping_groups_id uuid,
    metric_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.group_template_settings OWNER TO postgres;

--
-- Name: industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    is_active boolean DEFAULT true,
    description text,
    icon_url text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.industries OWNER TO postgres;

--
-- Name: invoice_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.invoice_seq OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    transaction_id uuid,
    invoice_number character varying,
    status character varying DEFAULT 'draft'::character varying,
    subtotal numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    currency_id uuid,
    billing_details jsonb,
    line_items jsonb,
    due_date timestamp with time zone,
    paid_at timestamp with time zone,
    pdf_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country_id uuid,
    province_id uuid,
    district character varying(255),
    sub_district character varying(255),
    village_no character varying(50),
    house_no character varying(50),
    road character varying(255),
    alley character varying(255),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loyalty_tier_id uuid,
    point_balance integer DEFAULT 0,
    status character varying(50),
    total_points_earned integer DEFAULT 0,
    total_points_spend integer DEFAULT 0,
    expiry_date timestamp with time zone,
    last_earned_at timestamp with time zone,
    last_spent_at timestamp with time zone,
    is_blocked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.loyalty_points OWNER TO postgres;

--
-- Name: loyalty_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    min_points integer DEFAULT 0,
    point_multiplier numeric(5,2) DEFAULT 1.0,
    description text,
    min_spend_amount numeric(15,2) DEFAULT 0.00,
    discount_percentage numeric(5,2) DEFAULT 0.00,
    icon_url text,
    badge_color character varying(20),
    priority_level integer DEFAULT 0,
    retention_period_days integer,
    is_active boolean DEFAULT true,
    benefits_summary text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.loyalty_tiers OWNER TO postgres;

--
-- Name: mapping_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapping_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    target_table character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mapping_categories OWNER TO postgres;

--
-- Name: mapping_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapping_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mapping_category_id uuid,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mapping_groups OWNER TO postgres;

--
-- Name: metric_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metric_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mapping_category_id uuid,
    metric_name character varying(255) NOT NULL,
    description text,
    data_type character varying(50),
    unit character varying(50),
    display_format character varying(100),
    is_calculated boolean DEFAULT false,
    calculation_formula text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.metric_templates OWNER TO postgres;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    icon_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: payment_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    icon_url text,
    api_endpoint text,
    is_active boolean DEFAULT true,
    supported_currencies text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_providers OWNER TO postgres;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    payment_method_id uuid,
    amount numeric(10,2) NOT NULL,
    currency_id uuid,
    status character varying DEFAULT 'pending'::character varying,
    transaction_type character varying DEFAULT 'subscription'::character varying,
    payment_gateway character varying,
    gateway_transaction_id character varying,
    gateway_response jsonb,
    discount_id uuid,
    discount_amount numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: TABLE payment_transactions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.payment_transactions IS 'Payment history for subscriptions. Links to subscriptions.id.';

--
-- Name: persona_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona_definition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    characteristics jsonb,
    demographics jsonb,
    behaviors jsonb,
    icon_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.persona_definition OWNER TO postgres;

--
-- Name: pipeline_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipeline_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pipeline_type OWNER TO postgres;

--
-- Name: platform_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    icon_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.platform_categories OWNER TO postgres;

--
-- Name: platform_mapping_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_mapping_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid,
    mapping_category_id uuid,
    platform_field_name character varying(255) NOT NULL,
    standard_field_name character varying(255),
    data_type character varying(50),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.platform_mapping_events OWNER TO postgres;

--
-- Name: platform_standard_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_standard_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id uuid,
    mapping_category_id uuid,
    platform_field_name character varying(255) NOT NULL,
    standard_field_name character varying(255),
    transform_formula text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.platform_standard_mappings OWNER TO postgres;

--
-- Name: platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platforms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_category_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(255),
    icon_url text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    api_version character varying(50)
);

ALTER TABLE public.platforms OWNER TO postgres;

--
-- Name: points_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    loyalty_points_id uuid,
    transaction_type character varying NOT NULL,
    points_amount integer NOT NULL,
    balance_after integer NOT NULL,
    description text,
    reference_id uuid,
    reference_type character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT points_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['earn'::character varying, 'spend'::character varying, 'expire'::character varying, 'adjustment'::character varying, 'bonus'::character varying])::text[])))
);

ALTER TABLE public.points_transactions OWNER TO postgres;

--
-- Name: priority_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.priority_level (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    priority_name character varying(50) NOT NULL,
    description text,
    color_code character varying(7),
    sla_hours numeric(5,2),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.priority_level OWNER TO postgres;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.product_categories OWNER TO postgres;

--
-- Name: profile_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    gender_id uuid,
    loyalty_point_id uuid,
    role_id uuid,
    location_id uuid,
    first_name character varying(255),
    last_name character varying(255),
    phone_number character varying(50),
    birthday_at date,
    last_active timestamp with time zone,
    profile_img text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    salary_range character varying(100)
);

ALTER TABLE public.profile_customers OWNER TO postgres;

--
-- Name: COLUMN profile_customers.salary_range; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profile_customers.salary_range IS 'User salary range selection from signup form';

--
-- Name: prospects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prospects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    "position" text,
    location text,
    status text DEFAULT 'cold'::text NOT NULL,
    score integer DEFAULT 0,
    phone text,
    notes text,
    last_activity timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT prospects_score_check CHECK (((score >= 0) AND (score <= 100))),
    CONSTRAINT prospects_status_check CHECK ((status = ANY (ARRAY['hot'::text, 'warm'::text, 'cold'::text])))
);

ALTER TABLE public.prospects OWNER TO postgres;

--
-- Name: provider_server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_server (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text,
    link_url text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.provider_server OWNER TO postgres;

--
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country_id uuid,
    province_name character varying(255) NOT NULL,
    postal_code character varying(10),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.provinces OWNER TO postgres;

--
-- Name: rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rating (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100),
    icon_url character varying(255),
    color_code character varying(10),
    descriptions character varying(500),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rating OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    name character varying(255) NOT NULL,
    description text,
    report_type character varying(100) NOT NULL,
    date_range_type character varying(50),
    start_date date,
    end_date date,
    filters jsonb,
    file_format character varying(20) DEFAULT 'pdf'::character varying,
    file_url text,
    status character varying(50) DEFAULT 'pending'::character varying,
    generated_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: request_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    server_id uuid,
    status_code_id uuid,
    method character varying(10),
    url text,
    duration_ms integer,
    request_header jsonb,
    request_body jsonb,
    response_body jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);

ALTER TABLE public.request_logs OWNER TO postgres;

--
-- Name: revenue_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    metric_date date NOT NULL,
    gross_revenue numeric(15,2) DEFAULT 0,
    net_revenue numeric(15,2) DEFAULT 0,
    ad_spend numeric(15,2) DEFAULT 0,
    profit numeric(15,2) DEFAULT 0,
    profit_margin numeric(5,2),
    new_customers integer DEFAULT 0,
    returning_customers integer DEFAULT 0,
    total_orders integer DEFAULT 0,
    average_order_value numeric(15,2),
    revenue_by_channel jsonb,
    revenue_by_campaign jsonb,
    previous_period_revenue numeric(15,2),
    revenue_growth_percent numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.revenue_metrics OWNER TO postgres;

--
-- Name: role_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.role_customers OWNER TO postgres;

--
-- Name: role_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    permission_level integer DEFAULT 0,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.role_employees OWNER TO postgres;

--
-- Name: scheduled_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduled_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    report_id uuid,
    name character varying(255) NOT NULL,
    schedule_type character varying(50) NOT NULL,
    schedule_day integer,
    schedule_time time without time zone DEFAULT '09:00:00'::time without time zone,
    timezone character varying(100) DEFAULT 'Asia/Bangkok'::character varying,
    recipients text[],
    is_active boolean DEFAULT true,
    last_sent_at timestamp with time zone,
    next_send_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scheduled_reports OWNER TO postgres;

--
-- Name: security_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_level (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    icon_url text,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_level OWNER TO postgres;

--
-- Name: server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_server_id uuid,
    hostname character varying(255) NOT NULL,
    ip_address character varying(45),
    cpu_usage_percent numeric(5,2),
    total_memory bigint,
    used_memory bigint,
    disk_total bigint,
    disk_used bigint,
    system_boot_time timestamp with time zone,
    status character varying(50),
    icon_url text,
    color_code character varying(7),
    last_update timestamp with time zone DEFAULT now()
);

ALTER TABLE public.server OWNER TO postgres;

--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    platform_id uuid,
    post_type character varying(50),
    content text,
    media_urls text[],
    post_url text,
    platform_post_id character varying(255),
    status character varying(50) DEFAULT 'draft'::character varying,
    scheduled_at timestamp with time zone,
    published_at timestamp with time zone,
    impressions integer DEFAULT 0,
    reach integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    saves integer DEFAULT 0,
    clicks integer DEFAULT 0,
    engagement_rate numeric(5,2),
    hashtags text[],
    mentions text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.social_posts OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    price_monthly numeric(15,2),
    price_yearly numeric(15,2),
    description text,
    max_workspace integer,
    feature_active jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug character varying,
    currency_id uuid,
    features jsonb,
    limits jsonb,
    is_active boolean DEFAULT true,
    is_popular boolean DEFAULT false,
    display_order integer DEFAULT 0,
    trial_days integer DEFAULT 0,
    tier integer DEFAULT 1 NOT NULL,
    CONSTRAINT subscription_plans_tier_positive CHECK ((tier >= 1))
);

ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: TABLE subscription_plans; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans (Free, Pro, Team). tier column determines upgrade path.';

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid,
    plan_id uuid NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    billing_cycle character varying DEFAULT 'monthly'::character varying,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    cancelled_at timestamp with time zone,
    trial_start timestamp with time zone,
    trial_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: TABLE subscriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscriptions IS 'Active user subscriptions. Use this table for subscription management, not subscription_orders (deprecated).';

--
-- Name: suspicious_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suspicious_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_type character varying NOT NULL,
    severity character varying DEFAULT 'low'::character varying,
    description text,
    metadata jsonb,
    is_resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    resolution_notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT suspicious_activities_severity_check CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])))
);

ALTER TABLE public.suspicious_activities OWNER TO postgres;

--
-- Name: system_health; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_health (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_name text NOT NULL,
    service_type text NOT NULL,
    status text NOT NULL,
    uptime_percentage numeric,
    last_checked timestamp with time zone DEFAULT now(),
    response_time_ms integer,
    metadata jsonb
);

ALTER TABLE public.system_health OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    color_code character varying(7),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: team_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    target_user_id uuid,
    target_email text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.team_activity_logs OWNER TO postgres;

--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    email text NOT NULL,
    role public.team_role DEFAULT 'viewer'::public.team_role NOT NULL,
    custom_permissions jsonb,
    invited_by uuid NOT NULL,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status NOT NULL,
    token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.team_invitations OWNER TO postgres;

--
-- Name: team_role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    role public.team_role NOT NULL,
    permissions jsonb DEFAULT '{"export_data": false, "manage_team": false, "edit_campaigns": false, "edit_prospects": false, "view_analytics": true, "view_campaigns": true, "view_dashboard": true, "view_prospects": true, "manage_settings": false, "delete_campaigns": false, "delete_prospects": false}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.team_role_permissions OWNER TO postgres;

--
-- Name: tier_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tier_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    previous_tier_id uuid,
    new_tier_id uuid NOT NULL,
    change_reason text,
    changed_by uuid,
    is_manual_override boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tier_history OWNER TO postgres;

--
-- Name: time_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country_id uuid,
    iana_name character varying(255) NOT NULL,
    utc_offset_sec integer,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.time_zones OWNER TO postgres;

--
-- Name: user_payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    payment_method_id uuid,
    is_default boolean DEFAULT false,
    gateway_customer_id character varying,
    gateway_payment_method_id character varying,
    card_brand character varying,
    card_last_four character varying(4),
    card_exp_month integer,
    card_exp_year integer,
    bank_name character varying,
    account_last_four character varying(4),
    billing_details jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_payment_methods OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'customer'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: variant_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variant_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_category_id uuid,
    name character varying(255) NOT NULL,
    sku character varying(100),
    description text,
    price numeric(15,2),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.variant_products OWNER TO postgres;

--
-- Name: workspace_api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspace_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    platform_id uuid NOT NULL,
    api_key_encrypted text,
    api_secret_encrypted text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    scopes text,
    account_id_on_platform character varying(255),
    webhook_url text,
    last_synced_at timestamp with time zone,
    sync_status character varying(50) DEFAULT 'pending'::character varying,
    is_active boolean DEFAULT true,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.workspace_api_keys OWNER TO postgres;

--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspace_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.team_role DEFAULT 'viewer'::public.team_role NOT NULL,
    status public.member_status DEFAULT 'active'::public.member_status NOT NULL,
    custom_permissions jsonb,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.workspace_members OWNER TO postgres;

--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text,
    workspace_url text,
    status character varying(50) DEFAULT 'active'::character varying,
    business_type_id uuid,
    industries_id uuid,
    timezone character varying(100),
    default_currency character varying(3) DEFAULT 'THB'::character varying
);

ALTER TABLE public.workspaces OWNER TO postgres;

--
-- Name: aarrr_categories aarrr_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aarrr_categories
    ADD CONSTRAINT aarrr_categories_pkey PRIMARY KEY (id);

--
-- Name: action_type_employees action_type_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_type_employees
    ADD CONSTRAINT action_type_employees_pkey PRIMARY KEY (id);

--
-- Name: action_type action_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_type
    ADD CONSTRAINT action_type_pkey PRIMARY KEY (id);

--
-- Name: ad_accounts ad_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_accounts
    ADD CONSTRAINT ad_accounts_pkey PRIMARY KEY (id);

--
-- Name: ad_buying_types ad_buying_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_buying_types
    ADD CONSTRAINT ad_buying_types_pkey PRIMARY KEY (id);

--
-- Name: ad_groups ad_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_groups
    ADD CONSTRAINT ad_groups_pkey PRIMARY KEY (id);

--
-- Name: ad_insights ad_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_insights
    ADD CONSTRAINT ad_insights_pkey PRIMARY KEY (id);

--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);

--
-- Name: ai_parameters ai_parameters_parameter_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_parameters
    ADD CONSTRAINT ai_parameters_parameter_name_key UNIQUE (parameter_name);

--
-- Name: ai_parameters ai_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_parameters
    ADD CONSTRAINT ai_parameters_pkey PRIMARY KEY (id);

--
-- Name: api_configurations api_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_configurations
    ADD CONSTRAINT api_configurations_pkey PRIMARY KEY (id);

--
-- Name: app_features app_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_features
    ADD CONSTRAINT app_features_pkey PRIMARY KEY (id);

--
-- Name: attribution_types attribution_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_types
    ADD CONSTRAINT attribution_types_pkey PRIMARY KEY (id);

--
-- Name: audit_log_employees audit_log_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_employees
    ADD CONSTRAINT audit_log_employees_pkey PRIMARY KEY (id);

--
-- Name: audit_logs_enhanced audit_logs_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs_enhanced
    ADD CONSTRAINT audit_logs_enhanced_pkey PRIMARY KEY (id);

--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);

--
-- Name: business_types business_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_name_key UNIQUE (name);

--
-- Name: business_types business_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_pkey PRIMARY KEY (id);

--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);

--
-- Name: change_type change_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.change_type
    ADD CONSTRAINT change_type_pkey PRIMARY KEY (id);

--
-- Name: cohort_analysis cohort_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort_analysis
    ADD CONSTRAINT cohort_analysis_pkey PRIMARY KEY (id);

--
-- Name: cohort_analysis cohort_analysis_team_id_cohort_date_cohort_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort_analysis
    ADD CONSTRAINT cohort_analysis_team_id_cohort_date_cohort_type_key UNIQUE (team_id, cohort_date, cohort_type);

--
-- Name: conversion_events conversion_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_pkey PRIMARY KEY (id);

--
-- Name: conversion_items conversion_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_items
    ADD CONSTRAINT conversion_items_pkey PRIMARY KEY (id);

--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);

--
-- Name: creative_types creative_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creative_types
    ADD CONSTRAINT creative_types_pkey PRIMARY KEY (id);

--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);

--
-- Name: customer_activities customer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_pkey PRIMARY KEY (id);

--
-- Name: customer_insights customer_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_insights
    ADD CONSTRAINT customer_insights_pkey PRIMARY KEY (id);

--
-- Name: customer_insights customer_insights_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_insights
    ADD CONSTRAINT customer_insights_user_id_key UNIQUE (user_id);

--
-- Name: customer_personas customer_personas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_personas
    ADD CONSTRAINT customer_personas_pkey PRIMARY KEY (id);

--
-- Name: data_pipeline data_pipeline_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_pipeline
    ADD CONSTRAINT data_pipeline_pkey PRIMARY KEY (id);

--
-- Name: deployment_pipeline deployment_pipeline_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deployment_pipeline
    ADD CONSTRAINT deployment_pipeline_pkey PRIMARY KEY (id);

--
-- Name: discounts discounts_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_key UNIQUE (code);

--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);

--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);

--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);

--
-- Name: employees_profile employees_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees_profile
    ADD CONSTRAINT employees_profile_pkey PRIMARY KEY (id);

--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);

--
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);

--
-- Name: event_categories event_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_categories
    ADD CONSTRAINT event_categories_pkey PRIMARY KEY (id);

--
-- Name: event_definition event_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_definition
    ADD CONSTRAINT event_definition_pkey PRIMARY KEY (id);

--
-- Name: event_types event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_pkey PRIMARY KEY (id);

--
-- Name: external_api_status external_api_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_api_status
    ADD CONSTRAINT external_api_status_pkey PRIMARY KEY (id);

--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);

--
-- Name: funnel_stages funnel_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funnel_stages
    ADD CONSTRAINT funnel_stages_pkey PRIMARY KEY (id);

--
-- Name: genders genders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genders
    ADD CONSTRAINT genders_pkey PRIMARY KEY (id);

--
-- Name: group_template_settings group_template_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_template_settings
    ADD CONSTRAINT group_template_settings_pkey PRIMARY KEY (id);

--
-- Name: industries industries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_name_key UNIQUE (name);

--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);

--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);

--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);

--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);

--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);

--
-- Name: loyalty_tiers loyalty_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_tiers
    ADD CONSTRAINT loyalty_tiers_pkey PRIMARY KEY (id);

--
-- Name: mapping_categories mapping_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_categories
    ADD CONSTRAINT mapping_categories_pkey PRIMARY KEY (id);

--
-- Name: mapping_groups mapping_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_groups
    ADD CONSTRAINT mapping_groups_pkey PRIMARY KEY (id);

--
-- Name: metric_templates metric_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metric_templates
    ADD CONSTRAINT metric_templates_pkey PRIMARY KEY (id);

--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);

--
-- Name: payment_providers payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_pkey PRIMARY KEY (id);

--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);

--
-- Name: persona_definition persona_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona_definition
    ADD CONSTRAINT persona_definition_pkey PRIMARY KEY (id);

--
-- Name: pipeline_type pipeline_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_type
    ADD CONSTRAINT pipeline_type_pkey PRIMARY KEY (id);

--
-- Name: platform_categories platform_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_categories
    ADD CONSTRAINT platform_categories_pkey PRIMARY KEY (id);

--
-- Name: platform_mapping_events platform_mapping_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_mapping_events
    ADD CONSTRAINT platform_mapping_events_pkey PRIMARY KEY (id);

--
-- Name: platform_standard_mappings platform_standard_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_standard_mappings
    ADD CONSTRAINT platform_standard_mappings_pkey PRIMARY KEY (id);

--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (id);

--
-- Name: platforms platforms_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_slug_key UNIQUE (slug);

--
-- Name: points_transactions points_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_pkey PRIMARY KEY (id);

--
-- Name: priority_level priority_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priority_level
    ADD CONSTRAINT priority_level_pkey PRIMARY KEY (id);

--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);

--
-- Name: profile_customers profile_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_customers
    ADD CONSTRAINT profile_customers_pkey PRIMARY KEY (id);

--
-- Name: profile_customers profile_customers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_customers
    ADD CONSTRAINT profile_customers_user_id_key UNIQUE (user_id);

--
-- Name: customer profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

--
-- Name: prospects prospects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_pkey PRIMARY KEY (id);

--
-- Name: provider_server provider_server_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_server
    ADD CONSTRAINT provider_server_pkey PRIMARY KEY (id);

--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);

--
-- Name: rating rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (id);

--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);

--
-- Name: request_logs request_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_logs
    ADD CONSTRAINT request_logs_pkey PRIMARY KEY (id);

--
-- Name: revenue_metrics revenue_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_metrics
    ADD CONSTRAINT revenue_metrics_pkey PRIMARY KEY (id);

--
-- Name: revenue_metrics revenue_metrics_team_id_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_metrics
    ADD CONSTRAINT revenue_metrics_team_id_metric_date_key UNIQUE (team_id, metric_date);

--
-- Name: role_customers role_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_customers
    ADD CONSTRAINT role_customers_pkey PRIMARY KEY (id);

--
-- Name: role_employees role_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_employees
    ADD CONSTRAINT role_employees_pkey PRIMARY KEY (id);

--
-- Name: role_employees role_employees_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_employees
    ADD CONSTRAINT role_employees_role_name_key UNIQUE (role_name);

--
-- Name: scheduled_reports scheduled_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_reports
    ADD CONSTRAINT scheduled_reports_pkey PRIMARY KEY (id);

--
-- Name: security_level security_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_level
    ADD CONSTRAINT security_level_pkey PRIMARY KEY (id);

--
-- Name: server server_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server
    ADD CONSTRAINT server_pkey PRIMARY KEY (id);

--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);

--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);

--
-- Name: subscription_plans subscription_plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug);

--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);

--
-- Name: suspicious_activities suspicious_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_pkey PRIMARY KEY (id);

--
-- Name: system_health system_health_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_health
    ADD CONSTRAINT system_health_pkey PRIMARY KEY (id);

--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

--
-- Name: team_activity_logs team_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_activity_logs
    ADD CONSTRAINT team_activity_logs_pkey PRIMARY KEY (id);

--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);

--
-- Name: workspace_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);

--
-- Name: workspace_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);

--
-- Name: team_role_permissions team_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_role_permissions
    ADD CONSTRAINT team_role_permissions_pkey PRIMARY KEY (id);

--
-- Name: team_role_permissions team_role_permissions_team_id_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_role_permissions
    ADD CONSTRAINT team_role_permissions_team_id_role_key UNIQUE (team_id, role);

--
-- Name: workspaces teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);

--
-- Name: tier_history tier_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT tier_history_pkey PRIMARY KEY (id);

--
-- Name: time_zones time_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_zones
    ADD CONSTRAINT time_zones_pkey PRIMARY KEY (id);

--
-- Name: user_payment_methods user_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_pkey PRIMARY KEY (id);

--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

--
-- Name: variant_products variant_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_products
    ADD CONSTRAINT variant_products_pkey PRIMARY KEY (id);

--
-- Name: workspace_api_keys workspace_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_api_keys
    ADD CONSTRAINT workspace_api_keys_pkey PRIMARY KEY (id);

--
-- Name: workspace_api_keys workspace_api_keys_team_id_platform_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_api_keys
    ADD CONSTRAINT workspace_api_keys_team_id_platform_id_key UNIQUE (team_id, platform_id);

--
-- Name: idx_budgets_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budgets_campaign_id ON public.budgets USING btree (campaign_id);

--
-- Name: idx_budgets_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budgets_team_id ON public.budgets USING btree (team_id);

--
-- Name: idx_cohort_analysis_team_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cohort_analysis_team_date ON public.cohort_analysis USING btree (team_id, cohort_date);

--
-- Name: idx_customer_insights_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_insights_phone ON public.customer_insights USING btree (phone);

--
-- Name: idx_customer_personas_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_personas_is_active ON public.customer_personas USING btree (is_active);

--
-- Name: idx_customer_personas_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_personas_team_id ON public.customer_personas USING btree (team_id);

--
-- Name: idx_invoices_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_created_at ON public.invoices USING btree (created_at DESC);

--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

--
-- Name: idx_invoices_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_subscription_id ON public.invoices USING btree (subscription_id);

--
-- Name: idx_invoices_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);

--
-- Name: idx_payment_transactions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions USING btree (created_at DESC);

--
-- Name: idx_payment_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);

--
-- Name: idx_payment_transactions_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions USING btree (subscription_id);

--
-- Name: idx_payment_transactions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions USING btree (user_id);

--
-- Name: idx_prospects_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prospects_score ON public.prospects USING btree (score DESC);

--
-- Name: idx_prospects_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prospects_status ON public.prospects USING btree (status);

--
-- Name: idx_prospects_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prospects_user_id ON public.prospects USING btree (user_id);

--
-- Name: idx_reports_report_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_report_type ON public.reports USING btree (report_type);

--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_status ON public.reports USING btree (status);

--
-- Name: idx_reports_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_team_id ON public.reports USING btree (team_id);

--
-- Name: idx_revenue_metrics_team_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_revenue_metrics_team_date ON public.revenue_metrics USING btree (team_id, metric_date);

--
-- Name: idx_scheduled_reports_next_send; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scheduled_reports_next_send ON public.scheduled_reports USING btree (next_send_at);

--
-- Name: idx_scheduled_reports_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scheduled_reports_team_id ON public.scheduled_reports USING btree (team_id);

--
-- Name: idx_social_posts_platform_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_platform_id ON public.social_posts USING btree (platform_id);

--
-- Name: idx_social_posts_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_published_at ON public.social_posts USING btree (published_at);

--
-- Name: idx_social_posts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_status ON public.social_posts USING btree (status);

--
-- Name: idx_social_posts_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_team_id ON public.social_posts USING btree (team_id);

--
-- Name: idx_subscription_plans_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_plans_is_active ON public.subscription_plans USING btree (is_active);

--
-- Name: idx_subscription_plans_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans USING btree (slug);

--
-- Name: idx_subscription_plans_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_plans_tier ON public.subscription_plans USING btree (tier);

--
-- Name: idx_subscriptions_billing_cycle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_billing_cycle ON public.subscriptions USING btree (billing_cycle);

--
-- Name: idx_subscriptions_plan_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions USING btree (plan_id);

--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);

--
-- Name: idx_subscriptions_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_team_id ON public.subscriptions USING btree (team_id);

--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);

--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--
-- Name: employees assign_role_on_approval; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assign_role_on_approval BEFORE UPDATE ON public.employees FOR EACH ROW WHEN ((((new.approval_status)::text = 'approved'::text) AND ((old.approval_status)::text <> 'approved'::text))) EXECUTE FUNCTION public.assign_admin_role_on_approval();

--
-- Name: invoices set_invoice_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

--
-- Name: employees tr_sync_employee_to_user_roles; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_sync_employee_to_user_roles AFTER INSERT OR UPDATE OF role_employees_id, user_id ON public.employees FOR EACH ROW EXECUTE FUNCTION public.sync_employee_to_user_roles();

--
-- Name: api_configurations update_api_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON public.api_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: budgets update_budgets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: business_types update_business_types_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_business_types_updated_at BEFORE UPDATE ON public.business_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: cohort_analysis update_cohort_analysis_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cohort_analysis_updated_at BEFORE UPDATE ON public.cohort_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: customer_insights update_customer_insights_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customer_insights_updated_at BEFORE UPDATE ON public.customer_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: customer_personas update_customer_personas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customer_personas_updated_at BEFORE UPDATE ON public.customer_personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: customer update_customer_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON public.customer FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: industries update_industries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON public.industries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: payment_transactions update_payment_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: platform_categories update_platform_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platform_categories_updated_at BEFORE UPDATE ON public.platform_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: platforms update_platforms_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: profile_customers update_profile_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_profile_customers_updated_at BEFORE UPDATE ON public.profile_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: prospects update_prospects_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: reports update_reports_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: revenue_metrics update_revenue_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_revenue_metrics_updated_at BEFORE UPDATE ON public.revenue_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: role_employees update_role_employees_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_role_employees_updated_at BEFORE UPDATE ON public.role_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: scheduled_reports update_scheduled_reports_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_scheduled_reports_updated_at BEFORE UPDATE ON public.scheduled_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: social_posts update_social_posts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: team_invitations update_team_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON public.team_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: workspace_members update_team_members_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: team_role_permissions update_team_role_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_team_role_permissions_updated_at BEFORE UPDATE ON public.team_role_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: workspaces update_teams_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: user_payment_methods update_user_payment_methods_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_payment_methods_updated_at BEFORE UPDATE ON public.user_payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: workspace_api_keys update_workspace_api_keys_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_workspace_api_keys_updated_at BEFORE UPDATE ON public.workspace_api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: ad_accounts ad_accounts_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_accounts
    ADD CONSTRAINT ad_accounts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: ad_accounts ad_accounts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_accounts
    ADD CONSTRAINT ad_accounts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id);

--
-- Name: ad_insights ad_insights_ad_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_insights
    ADD CONSTRAINT ad_insights_ad_account_id_fkey FOREIGN KEY (ad_account_id) REFERENCES public.ad_accounts(id);

--
-- Name: ad_insights ad_insights_ads_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_insights
    ADD CONSTRAINT ad_insights_ads_id_fkey FOREIGN KEY (ads_id) REFERENCES public.ads(id);

--
-- Name: ad_insights ad_insights_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_insights
    ADD CONSTRAINT ad_insights_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);

--
-- Name: ads ads_ad_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_ad_group_id_fkey FOREIGN KEY (ad_group_id) REFERENCES public.ad_groups(id);

--
-- Name: ads ads_creative_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_creative_type_id_fkey FOREIGN KEY (creative_type_id) REFERENCES public.creative_types(id);

--
-- Name: attribution_types attribution_types_platform_mapping_standard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_types
    ADD CONSTRAINT attribution_types_platform_mapping_standard_id_fkey FOREIGN KEY (platform_mapping_standard_id) REFERENCES public.platform_standard_mappings(id);

--
-- Name: audit_log_employees audit_log_employees_action_employees_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_employees
    ADD CONSTRAINT audit_log_employees_action_employees_id_fkey FOREIGN KEY (action_employees_id) REFERENCES public.action_type_employees(id);

--
-- Name: audit_log_employees audit_log_employees_employees_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_employees
    ADD CONSTRAINT audit_log_employees_employees_id_fkey FOREIGN KEY (employees_id) REFERENCES public.employees(id);

--
-- Name: audit_logs_enhanced audit_logs_enhanced_action_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs_enhanced
    ADD CONSTRAINT audit_logs_enhanced_action_type_id_fkey FOREIGN KEY (action_type_id) REFERENCES public.action_type(id);

--
-- Name: audit_logs_enhanced audit_logs_enhanced_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs_enhanced
    ADD CONSTRAINT audit_logs_enhanced_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.server(id);

--
-- Name: budgets budgets_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

--
-- Name: budgets budgets_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

--
-- Name: budgets budgets_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: campaigns campaigns_ad_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_ad_account_id_fkey FOREIGN KEY (ad_account_id) REFERENCES public.ad_accounts(id);

--
-- Name: campaigns campaigns_ad_buying_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_ad_buying_type_id_fkey FOREIGN KEY (ad_buying_type_id) REFERENCES public.ad_buying_types(id);

--
-- Name: campaigns campaigns_mapping_groups_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_mapping_groups_id_fkey FOREIGN KEY (mapping_groups_id) REFERENCES public.mapping_groups(id);

--
-- Name: change_type change_type_priority_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.change_type
    ADD CONSTRAINT change_type_priority_level_id_fkey FOREIGN KEY (priority_level_id) REFERENCES public.priority_level(id);

--
-- Name: cohort_analysis cohort_analysis_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohort_analysis
    ADD CONSTRAINT cohort_analysis_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: conversion_events conversion_events_ad_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_ad_account_id_fkey FOREIGN KEY (ad_account_id) REFERENCES public.ad_accounts(id);

--
-- Name: conversion_events conversion_events_ads_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_ads_id_fkey FOREIGN KEY (ads_id) REFERENCES public.ads(id);

--
-- Name: conversion_events conversion_events_attribution_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_attribution_type_id_fkey FOREIGN KEY (attribution_type_id) REFERENCES public.attribution_types(id);

--
-- Name: conversion_events conversion_events_conversion_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_conversion_item_id_fkey FOREIGN KEY (conversion_item_id) REFERENCES public.conversion_items(id);

--
-- Name: conversion_events conversion_events_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_events
    ADD CONSTRAINT conversion_events_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_types(id);

--
-- Name: conversion_items conversion_items_product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_items
    ADD CONSTRAINT conversion_items_product_category_id_fkey FOREIGN KEY (product_category_id) REFERENCES public.product_categories(id);

--
-- Name: conversion_items conversion_items_variant_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_items
    ADD CONSTRAINT conversion_items_variant_product_id_fkey FOREIGN KEY (variant_product_id) REFERENCES public.variant_products(id);

--
-- Name: customer_activities customer_activities_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);

--
-- Name: customer_activities customer_activities_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_types(id);

--
-- Name: customer_activities customer_activities_profile_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_profile_customer_id_fkey FOREIGN KEY (profile_customer_id) REFERENCES public.profile_customers(id);

--
-- Name: data_pipeline data_pipeline_pipeline_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_pipeline
    ADD CONSTRAINT data_pipeline_pipeline_type_id_fkey FOREIGN KEY (pipeline_type_id) REFERENCES public.pipeline_type(id);

--
-- Name: deployment_pipeline deployment_pipeline_pipeline_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deployment_pipeline
    ADD CONSTRAINT deployment_pipeline_pipeline_type_id_fkey FOREIGN KEY (pipeline_type_id) REFERENCES public.pipeline_type(id);

--
-- Name: employees_profile employees_profile_employees_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees_profile
    ADD CONSTRAINT employees_profile_employees_id_fkey FOREIGN KEY (employees_id) REFERENCES public.employees(id);

--
-- Name: employees_profile employees_profile_role_employees_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees_profile
    ADD CONSTRAINT employees_profile_role_employees_id_fkey FOREIGN KEY (role_employees_id) REFERENCES public.role_employees(id);

--
-- Name: employees employees_role_employees_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_role_employees_id_fkey FOREIGN KEY (role_employees_id) REFERENCES public.role_employees(id);

--
-- Name: event_definition event_definition_app_features_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_definition
    ADD CONSTRAINT event_definition_app_features_id_fkey FOREIGN KEY (app_features_id) REFERENCES public.app_features(id);

--
-- Name: event_definition event_definition_funnel_stages_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_definition
    ADD CONSTRAINT event_definition_funnel_stages_id_fkey FOREIGN KEY (funnel_stages_id) REFERENCES public.funnel_stages(id);

--
-- Name: event_types event_types_event_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_event_category_id_fkey FOREIGN KEY (event_category_id) REFERENCES public.event_categories(id);

--
-- Name: event_types event_types_platform_mapping_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_platform_mapping_event_id_fkey FOREIGN KEY (platform_mapping_event_id) REFERENCES public.platform_mapping_events(id);

--
-- Name: external_api_status external_api_status_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_api_status
    ADD CONSTRAINT external_api_status_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: feedback feedback_customer_activities_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_customer_activities_id_fkey FOREIGN KEY (customer_activities_id) REFERENCES public.customer_activities(id);

--
-- Name: feedback feedback_rating_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_rating_id_fkey FOREIGN KEY (rating_id) REFERENCES public.rating(id);

--
-- Name: funnel_stages funnel_stages_aarrr_categories_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funnel_stages
    ADD CONSTRAINT funnel_stages_aarrr_categories_id_fkey FOREIGN KEY (aarrr_categories_id) REFERENCES public.aarrr_categories(id);

--
-- Name: group_template_settings group_template_settings_mapping_groups_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_template_settings
    ADD CONSTRAINT group_template_settings_mapping_groups_id_fkey FOREIGN KEY (mapping_groups_id) REFERENCES public.mapping_groups(id);

--
-- Name: group_template_settings group_template_settings_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_template_settings
    ADD CONSTRAINT group_template_settings_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metric_templates(id);

--
-- Name: invoices invoices_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

--
-- Name: invoices invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);

--
-- Name: invoices invoices_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.payment_transactions(id);

--
-- Name: locations locations_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);

--
-- Name: locations locations_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);

--
-- Name: loyalty_points loyalty_points_loyalty_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_loyalty_tier_id_fkey FOREIGN KEY (loyalty_tier_id) REFERENCES public.loyalty_tiers(id);

--
-- Name: mapping_groups mapping_groups_mapping_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_groups
    ADD CONSTRAINT mapping_groups_mapping_category_id_fkey FOREIGN KEY (mapping_category_id) REFERENCES public.mapping_categories(id);

--
-- Name: metric_templates metric_templates_mapping_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metric_templates
    ADD CONSTRAINT metric_templates_mapping_category_id_fkey FOREIGN KEY (mapping_category_id) REFERENCES public.mapping_categories(id);

--
-- Name: payment_methods payment_methods_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.payment_providers(id);

--
-- Name: payment_transactions payment_transactions_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

--
-- Name: payment_transactions payment_transactions_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id);

--
-- Name: payment_transactions payment_transactions_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

--
-- Name: payment_transactions payment_transactions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);

--
-- Name: platform_mapping_events platform_mapping_events_mapping_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_mapping_events
    ADD CONSTRAINT platform_mapping_events_mapping_category_id_fkey FOREIGN KEY (mapping_category_id) REFERENCES public.mapping_categories(id);

--
-- Name: platform_mapping_events platform_mapping_events_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_mapping_events
    ADD CONSTRAINT platform_mapping_events_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: platform_standard_mappings platform_standard_mappings_mapping_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_standard_mappings
    ADD CONSTRAINT platform_standard_mappings_mapping_category_id_fkey FOREIGN KEY (mapping_category_id) REFERENCES public.mapping_categories(id);

--
-- Name: platform_standard_mappings platform_standard_mappings_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_standard_mappings
    ADD CONSTRAINT platform_standard_mappings_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: platforms platforms_platform_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_platform_category_id_fkey FOREIGN KEY (platform_category_id) REFERENCES public.platform_categories(id);

--
-- Name: points_transactions points_transactions_loyalty_points_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_loyalty_points_id_fkey FOREIGN KEY (loyalty_points_id) REFERENCES public.loyalty_points(id);

--
-- Name: profile_customers profile_customers_gender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_customers
    ADD CONSTRAINT profile_customers_gender_id_fkey FOREIGN KEY (gender_id) REFERENCES public.genders(id);

--
-- Name: profile_customers profile_customers_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_customers
    ADD CONSTRAINT profile_customers_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);

--
-- Name: profile_customers profile_customers_loyalty_point_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_customers
    ADD CONSTRAINT profile_customers_loyalty_point_id_fkey FOREIGN KEY (loyalty_point_id) REFERENCES public.loyalty_points(id);

--
-- Name: customer profiles_loyalty_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT profiles_loyalty_tier_id_fkey FOREIGN KEY (loyalty_tier_id) REFERENCES public.loyalty_tiers(id);

--
-- Name: provinces provinces_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);

--
-- Name: reports reports_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: request_logs request_logs_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_logs
    ADD CONSTRAINT request_logs_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.server(id);

--
-- Name: revenue_metrics revenue_metrics_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_metrics
    ADD CONSTRAINT revenue_metrics_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: scheduled_reports scheduled_reports_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_reports
    ADD CONSTRAINT scheduled_reports_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;

--
-- Name: scheduled_reports scheduled_reports_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_reports
    ADD CONSTRAINT scheduled_reports_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: server server_provider_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server
    ADD CONSTRAINT server_provider_server_id_fkey FOREIGN KEY (provider_server_id) REFERENCES public.provider_server(id);

--
-- Name: social_posts social_posts_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: social_posts social_posts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: subscription_plans subscription_plans_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);

--
-- Name: subscriptions subscriptions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id);

--
-- Name: team_activity_logs team_activity_logs_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_activity_logs
    ADD CONSTRAINT team_activity_logs_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: team_invitations team_invitations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: workspace_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: team_role_permissions team_role_permissions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_role_permissions
    ADD CONSTRAINT team_role_permissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: workspaces teams_business_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT teams_business_type_id_fkey FOREIGN KEY (business_type_id) REFERENCES public.business_types(id);

--
-- Name: workspaces teams_industries_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT teams_industries_id_fkey FOREIGN KEY (industries_id) REFERENCES public.industries(id);

--
-- Name: tier_history tier_history_new_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT tier_history_new_tier_id_fkey FOREIGN KEY (new_tier_id) REFERENCES public.loyalty_tiers(id);

--
-- Name: tier_history tier_history_previous_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT tier_history_previous_tier_id_fkey FOREIGN KEY (previous_tier_id) REFERENCES public.loyalty_tiers(id);

--
-- Name: time_zones time_zones_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_zones
    ADD CONSTRAINT time_zones_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);

--
-- Name: user_payment_methods user_payment_methods_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

--
-- Name: user_payment_methods user_payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;

--
-- Name: variant_products variant_products_product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_products
    ADD CONSTRAINT variant_products_product_category_id_fkey FOREIGN KEY (product_category_id) REFERENCES public.product_categories(id);

--
-- Name: workspace_api_keys workspace_api_keys_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_api_keys
    ADD CONSTRAINT workspace_api_keys_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);

--
-- Name: workspace_api_keys workspace_api_keys_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_api_keys
    ADD CONSTRAINT workspace_api_keys_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;

GRANT USAGE ON SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

--
-- Name: FUNCTION assign_admin_role_on_approval(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assign_admin_role_on_approval() TO anon;

GRANT ALL ON FUNCTION public.assign_admin_role_on_approval() TO authenticated;

GRANT ALL ON FUNCTION public.assign_admin_role_on_approval() TO service_role;

--
-- Name: FUNCTION can_manage_team(_user_id uuid, _team_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid) TO anon;

GRANT ALL ON FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid) TO authenticated;

GRANT ALL ON FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid) TO service_role;

--
-- Name: FUNCTION generate_invoice_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_invoice_number() TO anon;

GRANT ALL ON FUNCTION public.generate_invoice_number() TO authenticated;

GRANT ALL ON FUNCTION public.generate_invoice_number() TO service_role;

--
-- Name: FUNCTION get_employee_role(_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_employee_role(_user_id uuid) TO anon;

GRANT ALL ON FUNCTION public.get_employee_role(_user_id uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_employee_role(_user_id uuid) TO service_role;

--
-- Name: FUNCTION get_my_team_ids(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_my_team_ids() TO anon;

GRANT ALL ON FUNCTION public.get_my_team_ids() TO authenticated;

GRANT ALL ON FUNCTION public.get_my_team_ids() TO service_role;

--
-- Name: FUNCTION get_team_role(_user_id uuid, _team_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_team_role(_user_id uuid, _team_id uuid) TO anon;

GRANT ALL ON FUNCTION public.get_team_role(_user_id uuid, _team_id uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_team_role(_user_id uuid, _team_id uuid) TO service_role;

--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

--
-- Name: FUNCTION has_employee_role(_user_id uuid, _role_name character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying) TO anon;

GRANT ALL ON FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying) TO authenticated;

GRANT ALL ON FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying) TO service_role;

--
-- Name: FUNCTION has_role(_user_id uuid, _role text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role text) TO anon;

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role text) TO authenticated;

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role text) TO service_role;

--
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO anon;

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;

--
-- Name: FUNCTION is_employee(_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_employee(_user_id uuid) TO anon;

GRANT ALL ON FUNCTION public.is_employee(_user_id uuid) TO authenticated;

GRANT ALL ON FUNCTION public.is_employee(_user_id uuid) TO service_role;

--
-- Name: FUNCTION is_team_member(_user_id uuid, _team_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_team_member(_user_id uuid, _team_id uuid) TO anon;

GRANT ALL ON FUNCTION public.is_team_member(_user_id uuid, _team_id uuid) TO authenticated;

GRANT ALL ON FUNCTION public.is_team_member(_user_id uuid, _team_id uuid) TO service_role;

--
-- Name: FUNCTION sync_employee_to_user_roles(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_employee_to_user_roles() TO anon;

GRANT ALL ON FUNCTION public.sync_employee_to_user_roles() TO authenticated;

GRANT ALL ON FUNCTION public.sync_employee_to_user_roles() TO service_role;

--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;

GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;

GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;

--
-- Name: TABLE aarrr_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.aarrr_categories TO anon;

GRANT ALL ON TABLE public.aarrr_categories TO authenticated;

GRANT ALL ON TABLE public.aarrr_categories TO service_role;

--
-- Name: TABLE action_type; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.action_type TO anon;

GRANT ALL ON TABLE public.action_type TO authenticated;

GRANT ALL ON TABLE public.action_type TO service_role;

--
-- Name: TABLE action_type_employees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.action_type_employees TO anon;

GRANT ALL ON TABLE public.action_type_employees TO authenticated;

GRANT ALL ON TABLE public.action_type_employees TO service_role;

--
-- Name: TABLE ad_accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_accounts TO anon;

GRANT ALL ON TABLE public.ad_accounts TO authenticated;

GRANT ALL ON TABLE public.ad_accounts TO service_role;

--
-- Name: TABLE ad_buying_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_buying_types TO anon;

GRANT ALL ON TABLE public.ad_buying_types TO authenticated;

GRANT ALL ON TABLE public.ad_buying_types TO service_role;

--
-- Name: TABLE ad_groups; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_groups TO anon;

GRANT ALL ON TABLE public.ad_groups TO authenticated;

GRANT ALL ON TABLE public.ad_groups TO service_role;

--
-- Name: TABLE ad_insights; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_insights TO anon;

GRANT ALL ON TABLE public.ad_insights TO authenticated;

GRANT ALL ON TABLE public.ad_insights TO service_role;

--
-- Name: TABLE ads; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ads TO anon;

GRANT ALL ON TABLE public.ads TO authenticated;

GRANT ALL ON TABLE public.ads TO service_role;

--
-- Name: TABLE ai_parameters; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ai_parameters TO anon;

GRANT ALL ON TABLE public.ai_parameters TO authenticated;

GRANT ALL ON TABLE public.ai_parameters TO service_role;

--
-- Name: TABLE api_configurations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.api_configurations TO anon;

GRANT ALL ON TABLE public.api_configurations TO authenticated;

GRANT ALL ON TABLE public.api_configurations TO service_role;

--
-- Name: TABLE app_features; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.app_features TO anon;

GRANT ALL ON TABLE public.app_features TO authenticated;

GRANT ALL ON TABLE public.app_features TO service_role;

--
-- Name: TABLE attribution_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.attribution_types TO anon;

GRANT ALL ON TABLE public.attribution_types TO authenticated;

GRANT ALL ON TABLE public.attribution_types TO service_role;

--
-- Name: TABLE audit_log_employees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_log_employees TO anon;

GRANT ALL ON TABLE public.audit_log_employees TO authenticated;

GRANT ALL ON TABLE public.audit_log_employees TO service_role;

--
-- Name: TABLE audit_logs_enhanced; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs_enhanced TO anon;

GRANT ALL ON TABLE public.audit_logs_enhanced TO authenticated;

GRANT ALL ON TABLE public.audit_logs_enhanced TO service_role;

--
-- Name: TABLE budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.budgets TO anon;

GRANT ALL ON TABLE public.budgets TO authenticated;

GRANT ALL ON TABLE public.budgets TO service_role;

--
-- Name: TABLE business_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_types TO anon;

GRANT ALL ON TABLE public.business_types TO authenticated;

GRANT ALL ON TABLE public.business_types TO service_role;

--
-- Name: TABLE campaigns; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.campaigns TO anon;

GRANT ALL ON TABLE public.campaigns TO authenticated;

GRANT ALL ON TABLE public.campaigns TO service_role;

--
-- Name: TABLE change_type; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.change_type TO anon;

GRANT ALL ON TABLE public.change_type TO authenticated;

GRANT ALL ON TABLE public.change_type TO service_role;

--
-- Name: TABLE cohort_analysis; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cohort_analysis TO anon;

GRANT ALL ON TABLE public.cohort_analysis TO authenticated;

GRANT ALL ON TABLE public.cohort_analysis TO service_role;

--
-- Name: TABLE conversion_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversion_events TO anon;

GRANT ALL ON TABLE public.conversion_events TO authenticated;

GRANT ALL ON TABLE public.conversion_events TO service_role;

--
-- Name: TABLE conversion_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversion_items TO anon;

GRANT ALL ON TABLE public.conversion_items TO authenticated;

GRANT ALL ON TABLE public.conversion_items TO service_role;

--
-- Name: TABLE countries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.countries TO anon;

GRANT ALL ON TABLE public.countries TO authenticated;

GRANT ALL ON TABLE public.countries TO service_role;

--
-- Name: TABLE creative_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.creative_types TO anon;

GRANT ALL ON TABLE public.creative_types TO authenticated;

GRANT ALL ON TABLE public.creative_types TO service_role;

--
-- Name: TABLE currencies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.currencies TO anon;

GRANT ALL ON TABLE public.currencies TO authenticated;

GRANT ALL ON TABLE public.currencies TO service_role;

--
-- Name: TABLE customer; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer TO anon;

GRANT ALL ON TABLE public.customer TO authenticated;

GRANT ALL ON TABLE public.customer TO service_role;

--
-- Name: TABLE customer_activities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_activities TO anon;

GRANT ALL ON TABLE public.customer_activities TO authenticated;

GRANT ALL ON TABLE public.customer_activities TO service_role;

--
-- Name: TABLE customer_insights; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_insights TO anon;

GRANT ALL ON TABLE public.customer_insights TO authenticated;

GRANT ALL ON TABLE public.customer_insights TO service_role;

--
-- Name: TABLE customer_personas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_personas TO anon;

GRANT ALL ON TABLE public.customer_personas TO authenticated;

GRANT ALL ON TABLE public.customer_personas TO service_role;

--
-- Name: TABLE data_pipeline; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.data_pipeline TO anon;

GRANT ALL ON TABLE public.data_pipeline TO authenticated;

GRANT ALL ON TABLE public.data_pipeline TO service_role;

--
-- Name: TABLE deployment_pipeline; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.deployment_pipeline TO anon;

GRANT ALL ON TABLE public.deployment_pipeline TO authenticated;

GRANT ALL ON TABLE public.deployment_pipeline TO service_role;

--
-- Name: TABLE discounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discounts TO anon;

GRANT ALL ON TABLE public.discounts TO authenticated;

GRANT ALL ON TABLE public.discounts TO service_role;

--
-- Name: TABLE employees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.employees TO anon;

GRANT ALL ON TABLE public.employees TO authenticated;

GRANT ALL ON TABLE public.employees TO service_role;

--
-- Name: TABLE employees_profile; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.employees_profile TO anon;

GRANT ALL ON TABLE public.employees_profile TO authenticated;

GRANT ALL ON TABLE public.employees_profile TO service_role;

--
-- Name: TABLE error_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.error_logs TO anon;

GRANT ALL ON TABLE public.error_logs TO authenticated;

GRANT ALL ON TABLE public.error_logs TO service_role;

--
-- Name: TABLE event_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_categories TO anon;

GRANT ALL ON TABLE public.event_categories TO authenticated;

GRANT ALL ON TABLE public.event_categories TO service_role;

--
-- Name: TABLE event_definition; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_definition TO anon;

GRANT ALL ON TABLE public.event_definition TO authenticated;

GRANT ALL ON TABLE public.event_definition TO service_role;

--
-- Name: TABLE event_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_types TO anon;

GRANT ALL ON TABLE public.event_types TO authenticated;

GRANT ALL ON TABLE public.event_types TO service_role;

--
-- Name: TABLE external_api_status; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.external_api_status TO anon;

GRANT ALL ON TABLE public.external_api_status TO authenticated;

GRANT ALL ON TABLE public.external_api_status TO service_role;

--
-- Name: TABLE feedback; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.feedback TO anon;

GRANT ALL ON TABLE public.feedback TO authenticated;

GRANT ALL ON TABLE public.feedback TO service_role;

--
-- Name: TABLE funnel_stages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.funnel_stages TO anon;

GRANT ALL ON TABLE public.funnel_stages TO authenticated;

GRANT ALL ON TABLE public.funnel_stages TO service_role;

--
-- Name: TABLE genders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.genders TO anon;

GRANT ALL ON TABLE public.genders TO authenticated;

GRANT ALL ON TABLE public.genders TO service_role;

--
-- Name: TABLE group_template_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.group_template_settings TO anon;

GRANT ALL ON TABLE public.group_template_settings TO authenticated;

GRANT ALL ON TABLE public.group_template_settings TO service_role;

--
-- Name: TABLE industries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.industries TO anon;

GRANT ALL ON TABLE public.industries TO authenticated;

GRANT ALL ON TABLE public.industries TO service_role;

--
-- Name: SEQUENCE invoice_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.invoice_seq TO anon;

GRANT ALL ON SEQUENCE public.invoice_seq TO authenticated;

GRANT ALL ON SEQUENCE public.invoice_seq TO service_role;

--
-- Name: TABLE invoices; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invoices TO anon;

GRANT ALL ON TABLE public.invoices TO authenticated;

GRANT ALL ON TABLE public.invoices TO service_role;

--
-- Name: TABLE locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.locations TO anon;

GRANT ALL ON TABLE public.locations TO authenticated;

GRANT ALL ON TABLE public.locations TO service_role;

--
-- Name: TABLE loyalty_points; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyalty_points TO anon;

GRANT ALL ON TABLE public.loyalty_points TO authenticated;

GRANT ALL ON TABLE public.loyalty_points TO service_role;

--
-- Name: TABLE loyalty_tiers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyalty_tiers TO anon;

GRANT ALL ON TABLE public.loyalty_tiers TO authenticated;

GRANT ALL ON TABLE public.loyalty_tiers TO service_role;

--
-- Name: TABLE mapping_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.mapping_categories TO anon;

GRANT ALL ON TABLE public.mapping_categories TO authenticated;

GRANT ALL ON TABLE public.mapping_categories TO service_role;

--
-- Name: TABLE mapping_groups; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.mapping_groups TO anon;

GRANT ALL ON TABLE public.mapping_groups TO authenticated;

GRANT ALL ON TABLE public.mapping_groups TO service_role;

--
-- Name: TABLE metric_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.metric_templates TO anon;

GRANT ALL ON TABLE public.metric_templates TO authenticated;

GRANT ALL ON TABLE public.metric_templates TO service_role;

--
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO anon;

GRANT ALL ON TABLE public.payment_methods TO authenticated;

GRANT ALL ON TABLE public.payment_methods TO service_role;

--
-- Name: TABLE payment_providers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_providers TO anon;

GRANT ALL ON TABLE public.payment_providers TO authenticated;

GRANT ALL ON TABLE public.payment_providers TO service_role;

--
-- Name: TABLE payment_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_transactions TO anon;

GRANT ALL ON TABLE public.payment_transactions TO authenticated;

GRANT ALL ON TABLE public.payment_transactions TO service_role;

--
-- Name: TABLE persona_definition; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.persona_definition TO anon;

GRANT ALL ON TABLE public.persona_definition TO authenticated;

GRANT ALL ON TABLE public.persona_definition TO service_role;

--
-- Name: TABLE pipeline_type; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pipeline_type TO anon;

GRANT ALL ON TABLE public.pipeline_type TO authenticated;

GRANT ALL ON TABLE public.pipeline_type TO service_role;

--
-- Name: TABLE platform_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_categories TO anon;

GRANT ALL ON TABLE public.platform_categories TO authenticated;

GRANT ALL ON TABLE public.platform_categories TO service_role;

--
-- Name: TABLE platform_mapping_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_mapping_events TO anon;

GRANT ALL ON TABLE public.platform_mapping_events TO authenticated;

GRANT ALL ON TABLE public.platform_mapping_events TO service_role;

--
-- Name: TABLE platform_standard_mappings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_standard_mappings TO anon;

GRANT ALL ON TABLE public.platform_standard_mappings TO authenticated;

GRANT ALL ON TABLE public.platform_standard_mappings TO service_role;

--
-- Name: TABLE platforms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platforms TO anon;

GRANT ALL ON TABLE public.platforms TO authenticated;

GRANT ALL ON TABLE public.platforms TO service_role;

--
-- Name: TABLE points_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.points_transactions TO anon;

GRANT ALL ON TABLE public.points_transactions TO authenticated;

GRANT ALL ON TABLE public.points_transactions TO service_role;

--
-- Name: TABLE priority_level; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.priority_level TO anon;

GRANT ALL ON TABLE public.priority_level TO authenticated;

GRANT ALL ON TABLE public.priority_level TO service_role;

--
-- Name: TABLE product_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_categories TO anon;

GRANT ALL ON TABLE public.product_categories TO authenticated;

GRANT ALL ON TABLE public.product_categories TO service_role;

--
-- Name: TABLE profile_customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_customers TO anon;

GRANT ALL ON TABLE public.profile_customers TO authenticated;

GRANT ALL ON TABLE public.profile_customers TO service_role;

--
-- Name: TABLE prospects; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.prospects TO anon;

GRANT ALL ON TABLE public.prospects TO authenticated;

GRANT ALL ON TABLE public.prospects TO service_role;

--
-- Name: TABLE provider_server; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.provider_server TO anon;

GRANT ALL ON TABLE public.provider_server TO authenticated;

GRANT ALL ON TABLE public.provider_server TO service_role;

--
-- Name: TABLE provinces; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.provinces TO anon;

GRANT ALL ON TABLE public.provinces TO authenticated;

GRANT ALL ON TABLE public.provinces TO service_role;

--
-- Name: TABLE rating; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rating TO anon;

GRANT ALL ON TABLE public.rating TO authenticated;

GRANT ALL ON TABLE public.rating TO service_role;

--
-- Name: TABLE reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reports TO anon;

GRANT ALL ON TABLE public.reports TO authenticated;

GRANT ALL ON TABLE public.reports TO service_role;

--
-- Name: TABLE request_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.request_logs TO anon;

GRANT ALL ON TABLE public.request_logs TO authenticated;

GRANT ALL ON TABLE public.request_logs TO service_role;

--
-- Name: TABLE revenue_metrics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.revenue_metrics TO anon;

GRANT ALL ON TABLE public.revenue_metrics TO authenticated;

GRANT ALL ON TABLE public.revenue_metrics TO service_role;

--
-- Name: TABLE role_customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_customers TO anon;

GRANT ALL ON TABLE public.role_customers TO authenticated;

GRANT ALL ON TABLE public.role_customers TO service_role;

--
-- Name: TABLE role_employees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_employees TO anon;

GRANT ALL ON TABLE public.role_employees TO authenticated;

GRANT ALL ON TABLE public.role_employees TO service_role;

--
-- Name: TABLE scheduled_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.scheduled_reports TO anon;

GRANT ALL ON TABLE public.scheduled_reports TO authenticated;

GRANT ALL ON TABLE public.scheduled_reports TO service_role;

--
-- Name: TABLE security_level; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.security_level TO anon;

GRANT ALL ON TABLE public.security_level TO authenticated;

GRANT ALL ON TABLE public.security_level TO service_role;

--
-- Name: TABLE server; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server TO anon;

GRANT ALL ON TABLE public.server TO authenticated;

GRANT ALL ON TABLE public.server TO service_role;

--
-- Name: TABLE social_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.social_posts TO anon;

GRANT ALL ON TABLE public.social_posts TO authenticated;

GRANT ALL ON TABLE public.social_posts TO service_role;

--
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_plans TO anon;

GRANT ALL ON TABLE public.subscription_plans TO authenticated;

GRANT ALL ON TABLE public.subscription_plans TO service_role;

--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO anon;

GRANT ALL ON TABLE public.subscriptions TO authenticated;

GRANT ALL ON TABLE public.subscriptions TO service_role;

--
-- Name: TABLE suspicious_activities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.suspicious_activities TO anon;

GRANT ALL ON TABLE public.suspicious_activities TO authenticated;

GRANT ALL ON TABLE public.suspicious_activities TO service_role;

--
-- Name: TABLE system_health; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_health TO anon;

GRANT ALL ON TABLE public.system_health TO authenticated;

GRANT ALL ON TABLE public.system_health TO service_role;

--
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tags TO anon;

GRANT ALL ON TABLE public.tags TO authenticated;

GRANT ALL ON TABLE public.tags TO service_role;

--
-- Name: TABLE team_activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_activity_logs TO anon;

GRANT ALL ON TABLE public.team_activity_logs TO authenticated;

GRANT ALL ON TABLE public.team_activity_logs TO service_role;

--
-- Name: TABLE team_invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_invitations TO anon;

GRANT ALL ON TABLE public.team_invitations TO authenticated;

GRANT ALL ON TABLE public.team_invitations TO service_role;

--
-- Name: TABLE team_role_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_role_permissions TO anon;

GRANT ALL ON TABLE public.team_role_permissions TO authenticated;

GRANT ALL ON TABLE public.team_role_permissions TO service_role;

--
-- Name: TABLE tier_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tier_history TO anon;

GRANT ALL ON TABLE public.tier_history TO authenticated;

GRANT ALL ON TABLE public.tier_history TO service_role;

--
-- Name: TABLE time_zones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.time_zones TO anon;

GRANT ALL ON TABLE public.time_zones TO authenticated;

GRANT ALL ON TABLE public.time_zones TO service_role;

--
-- Name: TABLE user_payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_payment_methods TO anon;

GRANT ALL ON TABLE public.user_payment_methods TO authenticated;

GRANT ALL ON TABLE public.user_payment_methods TO service_role;

--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_roles TO anon;

GRANT ALL ON TABLE public.user_roles TO authenticated;

GRANT ALL ON TABLE public.user_roles TO service_role;

--
-- Name: TABLE variant_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.variant_products TO anon;

GRANT ALL ON TABLE public.variant_products TO authenticated;

GRANT ALL ON TABLE public.variant_products TO service_role;

--
-- Name: TABLE workspace_api_keys; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workspace_api_keys TO anon;

GRANT ALL ON TABLE public.workspace_api_keys TO authenticated;

GRANT ALL ON TABLE public.workspace_api_keys TO service_role;

--
-- Name: TABLE workspace_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workspace_members TO anon;

GRANT ALL ON TABLE public.workspace_members TO authenticated;

GRANT ALL ON TABLE public.workspace_members TO service_role;

--
-- Name: TABLE workspaces; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workspaces TO anon;

GRANT ALL ON TABLE public.workspaces TO authenticated;

GRANT ALL ON TABLE public.workspaces TO service_role;

--
-- PostgreSQL database dump complete
--



