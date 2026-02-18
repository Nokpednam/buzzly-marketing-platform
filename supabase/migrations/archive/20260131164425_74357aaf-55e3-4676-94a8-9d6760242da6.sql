-- Add missing columns to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS features JSONB,
ADD COLUMN IF NOT EXISTS limits JSONB,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;

-- Drop old columns if they exist and rename status to is_active
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'status') THEN
        ALTER TABLE public.subscription_plans DROP COLUMN status;
    END IF;
END $$;

-- Create remaining tables
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    team_id UUID REFERENCES public.teams(id),
    plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
    status VARCHAR DEFAULT 'active',
    billing_cycle VARCHAR DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id),
    payment_method_id UUID REFERENCES public.payment_methods(id),
    amount NUMERIC(10,2) NOT NULL,
    currency_id UUID REFERENCES public.currencies(id),
    status VARCHAR DEFAULT 'pending',
    transaction_type VARCHAR DEFAULT 'subscription',
    payment_gateway VARCHAR,
    gateway_transaction_id VARCHAR,
    gateway_response JSONB,
    discount_id UUID REFERENCES public.discounts(id),
    discount_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id),
    transaction_id UUID REFERENCES public.payment_transactions(id),
    invoice_number VARCHAR UNIQUE,
    status VARCHAR DEFAULT 'draft',
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    currency_id UUID REFERENCES public.currencies(id),
    billing_details JSONB,
    line_items JSONB,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    payment_method_id UUID REFERENCES public.payment_methods(id),
    is_default BOOLEAN DEFAULT false,
    gateway_customer_id VARCHAR,
    gateway_payment_method_id VARCHAR,
    card_brand VARCHAR,
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    bank_name VARCHAR,
    account_last_four VARCHAR(4),
    billing_details JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "sub_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sub_insert_own" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sub_update_own" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sub_admin" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "txn_select_own" ON public.payment_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "txn_insert_own" ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "txn_admin" ON public.payment_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "inv_select_own" ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inv_insert_own" ON public.invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inv_admin" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "upm_own" ON public.user_payment_methods FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, decimal_places, is_active)
SELECT 'THB', 'Thai Baht', '฿', 2, true WHERE NOT EXISTS (SELECT 1 FROM public.currencies WHERE code = 'THB');
INSERT INTO public.currencies (code, name, symbol, decimal_places, is_active)
SELECT 'USD', 'US Dollar', '$', 2, true WHERE NOT EXISTS (SELECT 1 FROM public.currencies WHERE code = 'USD');

-- Insert default payment methods
INSERT INTO public.payment_methods (name, slug, description, display_order, is_active)
SELECT 'Credit/Debit Card', 'credit_card', 'ชำระผ่านบัตรเครดิต/เดบิต', 1, true WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE slug = 'credit_card');
INSERT INTO public.payment_methods (name, slug, description, display_order, is_active)
SELECT 'PromptPay', 'promptpay', 'ชำระผ่าน QR Code PromptPay', 2, true WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE slug = 'promptpay');
INSERT INTO public.payment_methods (name, slug, description, display_order, is_active)
SELECT 'Bank Transfer', 'bank_transfer', 'โอนเงินผ่านธนาคาร', 3, true WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE slug = 'bank_transfer');
INSERT INTO public.payment_methods (name, slug, description, display_order, is_active)
SELECT 'Mobile Banking', 'mobile_banking', 'ชำระผ่าน App ธนาคาร', 4, true WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE slug = 'mobile_banking');

-- Update existing subscription_plans with slug
UPDATE public.subscription_plans SET slug = LOWER(name), is_active = true, display_order = 
  CASE name WHEN 'Free' THEN 1 WHEN 'Pro' THEN 2 WHEN 'Team' THEN 3 ELSE 4 END,
  is_popular = (name = 'Pro')
WHERE slug IS NULL;

-- Create invoice sequence and function
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('invoice_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- Updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_payment_methods_updated_at BEFORE UPDATE ON public.user_payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();