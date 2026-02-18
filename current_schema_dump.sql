--
-- PostgreSQL database dump
--

\restrict 3a5hQwvorMnurAZsmx6Zq4pGNtcoh3I4zrmbIdlON9Ut76OdMytyPevQBjZOIgU

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
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'customer',
    'admin',
    'owner',
    'dev'
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
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: assign_admin_role_on_approval(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_admin_role_on_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_admin_role_id UUID;
BEGIN
    -- Check if approval_status changed to 'approved'
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        -- Get the Admin role ID (case-insensitive)
        SELECT id INTO v_admin_role_id 
        FROM public.role_employees 
        WHERE role_name ILIKE 'admin' 
        LIMIT 1;
        
        -- If admin role exists, assign it
        IF v_admin_role_id IS NOT NULL THEN
            NEW.role_employees_id := v_admin_role_id;
            NEW.status := 'active';
            
            RAISE NOTICE 'Admin role (%) assigned to employee: %', v_admin_role_id, NEW.email;
        ELSE
            RAISE WARNING 'Admin role not found in role_employees table';
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
    _gender_id uuid;
BEGIN
    -- Check if it's an employee signup
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        -- Create employee record
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
            'active', 
            'pending', -- Pending approval
            NULL       -- Role will be assigned by Admin
        )
        RETURNING id INTO new_employee_id;

        -- Create employee profile if employee record was created
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
                phone,
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
                phone = EXCLUDED.phone,
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
    IF v_role_name IN ('owner', 'admin', 'dev') THEN
        v_app_role := v_role_name::app_role;
        
        -- Upsert into user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, v_app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Optional: Remove other roles if we want strict 1:1 mapping
        -- DELETE FROM public.user_roles WHERE user_id = NEW.user_id AND role != v_app_role;
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

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000,
    max_client_presence_events_per_window integer,
    client_presence_window_ms integer,
    CONSTRAINT jwt_secret_or_jwt_jwks_required CHECK (((jwt_secret IS NOT NULL) OR (jwt_jwks IS NOT NULL)))
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


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
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_02_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_17 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_18; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_18 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_19; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_19 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_20; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_20 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_21; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_21 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    catalog_id uuid NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    remote_table_id text,
    shard_key text,
    shard_id text,
    catalog_id uuid NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: messages_2026_02_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_17 FOR VALUES FROM ('2026-02-17 00:00:00') TO ('2026-02-18 00:00:00');


--
-- Name: messages_2026_02_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_18 FOR VALUES FROM ('2026-02-18 00:00:00') TO ('2026-02-19 00:00:00');


--
-- Name: messages_2026_02_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_19 FOR VALUES FROM ('2026-02-19 00:00:00') TO ('2026-02-20 00:00:00');


--
-- Name: messages_2026_02_20; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_20 FOR VALUES FROM ('2026-02-20 00:00:00') TO ('2026-02-21 00:00:00');


--
-- Name: messages_2026_02_21; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_21 FOR VALUES FROM ('2026-02-21 00:00:00') TO ('2026-02-22 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


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
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_17 messages_2026_02_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_17
    ADD CONSTRAINT messages_2026_02_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_18 messages_2026_02_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_18
    ADD CONSTRAINT messages_2026_02_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_19 messages_2026_02_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_19
    ADD CONSTRAINT messages_2026_02_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_20 messages_2026_02_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_20
    ADD CONSTRAINT messages_2026_02_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_21 messages_2026_02_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_21
    ADD CONSTRAINT messages_2026_02_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


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
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_17_inserted_at_topic_idx ON realtime.messages_2026_02_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_18_inserted_at_topic_idx ON realtime.messages_2026_02_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_19_inserted_at_topic_idx ON realtime.messages_2026_02_19 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_20_inserted_at_topic_idx ON realtime.messages_2026_02_20 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_21_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_21_inserted_at_topic_idx ON realtime.messages_2026_02_21 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (catalog_id, name);


--
-- Name: idx_iceberg_tables_location; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_location ON storage.iceberg_tables USING btree (location);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (catalog_id, namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2026_02_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_17_inserted_at_topic_idx;


--
-- Name: messages_2026_02_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_17_pkey;


--
-- Name: messages_2026_02_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_18_inserted_at_topic_idx;


--
-- Name: messages_2026_02_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_18_pkey;


--
-- Name: messages_2026_02_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_19_inserted_at_topic_idx;


--
-- Name: messages_2026_02_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_19_pkey;


--
-- Name: messages_2026_02_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_20_inserted_at_topic_idx;


--
-- Name: messages_2026_02_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_20_pkey;


--
-- Name: messages_2026_02_21_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_21_inserted_at_topic_idx;


--
-- Name: messages_2026_02_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_21_pkey;


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

CREATE TRIGGER tr_sync_employee_to_user_roles AFTER INSERT OR UPDATE OF role_employees_id ON public.employees FOR EACH ROW EXECUTE FUNCTION public.sync_employee_to_user_roles();


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
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


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
-- Name: ai_parameters ai_parameters_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_parameters
    ADD CONSTRAINT ai_parameters_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


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
-- Name: customer_insights customer_insights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_insights
    ADD CONSTRAINT customer_insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: error_logs error_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


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
-- Name: points_transactions points_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: points_transactions points_transactions_loyalty_points_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_loyalty_points_id_fkey FOREIGN KEY (loyalty_points_id) REFERENCES public.loyalty_points(id);


--
-- Name: points_transactions points_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: customer profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: customer profiles_loyalty_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT profiles_loyalty_tier_id_fkey FOREIGN KEY (loyalty_tier_id) REFERENCES public.loyalty_tiers(id);


--
-- Name: prospects prospects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: suspicious_activities suspicious_activities_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);


--
-- Name: suspicious_activities suspicious_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: tier_history tier_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT tier_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


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
-- Name: tier_history tier_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT tier_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: iceberg_namespaces iceberg_namespaces_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


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
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


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
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2026_02_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_17 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_18; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_18 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_19; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_19 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_20; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_20 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_20 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_21; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_21 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_21 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict 3a5hQwvorMnurAZsmx6Zq4pGNtcoh3I4zrmbIdlON9Ut76OdMytyPevQBjZOIgU

