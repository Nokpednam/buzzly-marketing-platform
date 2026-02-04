
-- ============================================================
-- FINAL VERIFIED FK CONSTRAINTS
-- Based on actual column inspection
-- ============================================================

DO $$ 
BEGIN
    -- subscription_orders -> subscriptions (NOT plan)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_orders_subscription_id_fkey') THEN
        ALTER TABLE public.subscription_orders ADD CONSTRAINT subscription_orders_subscription_id_fkey 
        FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;
    END IF;

    -- subscription_orders -> currencies
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_orders_currency_id_fkey') THEN
        ALTER TABLE public.subscription_orders ADD CONSTRAINT subscription_orders_currency_id_fkey 
        FOREIGN KEY (currency_id) REFERENCES public.currencies(id) ON DELETE SET NULL;
    END IF;

    -- subscription_orders -> payment_methods
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_orders_payment_method_id_fkey') THEN
        ALTER TABLE public.subscription_orders ADD CONSTRAINT subscription_orders_payment_method_id_fkey 
        FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;
    END IF;

    -- subscription_orders -> discounts
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_orders_discount_code_id_fkey') THEN
        ALTER TABLE public.subscription_orders ADD CONSTRAINT subscription_orders_discount_code_id_fkey 
        FOREIGN KEY (discount_code_id) REFERENCES public.discounts(id) ON DELETE SET NULL;
    END IF;

    -- subscriptions -> teams (NOT user)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_team_id_fkey') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_team_id_fkey 
        FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
    END IF;

    -- subscriptions -> subscription_plans
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_plan_id_fkey') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
    END IF;

    -- user_payment_methods -> payment_methods
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_payment_methods_payment_method_id_fkey') THEN
        ALTER TABLE public.user_payment_methods ADD CONSTRAINT user_payment_methods_payment_method_id_fkey 
        FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;
    END IF;

    -- user_payment_methods -> profiles
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_payment_methods_user_id_fkey') THEN
        ALTER TABLE public.user_payment_methods ADD CONSTRAINT user_payment_methods_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
