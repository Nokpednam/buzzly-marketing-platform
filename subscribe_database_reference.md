# Subscribe to Package: Database & Function Reference

This guide details the **Primary Tables** and the **Code Functions** (Hooks) used to fetch data for each page in the Subscribe to Package flow.

---

## 1. Plan Selection (Manage Plan Dialog)
**Component:** `PlanSelectionDialog.tsx`

### 🗄️ Database Relationships
*   **Data: Available Plans**
    *   **Primary Table:** `subscription_plans`
    *   **Filter:** `is_active = true`, ordered by `display_order`.
    *   **Purpose:** To fetch all available packages (Free, Pro, Team) with `name`, `price_monthly`, `price_yearly`, `features`, `is_popular`.
*   **Data: Current Subscription**
    *   **Primary Table:** `subscriptions`
    *   **Join:** `subscriptions.plan_id` → `subscription_plans.id`
    *   **Purpose:** To identify the user's current active plan and disable downgrade options.
*   **Data: User's Plan Type**
    *   **Primary Table:** `customer`
    *   **Join:** `customer.id` → `auth.users.id`
    *   **Purpose:** To read `plan_type` (free/pro/team) and highlight the current plan badge.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`fetchData`** (Plans) | `src/hooks/useSubscription.tsx` (L61–92) | **Loads Plan Cards:** Fetches `subscription_plans` from DB, maps them to UI format with `slug`, `tier`, `price_monthly`, `price_yearly`, `features`. |
| **`fetchData`** (Subscription) | `src/hooks/useSubscription.tsx` (L105–124) | **Detects Current Plan:** Fetches the user's active `subscriptions` row to show "Plan ปัจจุบัน" badge and block downgrades. |
| **`getMonthlyEquivalent`** | `src/hooks/useSubscription.tsx` (L137–142) | **Calculates Display Price:** Divides yearly price by 12 for the "รายปี" toggle view. |
| **`getSavingsPercent`** | `src/hooks/useSubscription.tsx` (L144–149) | **Shows Savings Badge:** Calculates the % saved when switching from monthly to yearly billing. |
| **`formatPrice`** | `src/components/PlanSelectionDialog.tsx` (L153–160) | **Formats Currency:** Renders prices as `฿999` using `Intl.NumberFormat` with `currency: "THB"`. |

---

## 2. Payment Method Selection
**Component:** `PaymentMethodDialog.tsx`

### 🗄️ Database Relationships
*   **Data: Available Payment Methods**
    *   **Primary Table:** `payment_methods`
    *   **Filter:** `is_active = true`, ordered by `display_order`.
    *   **Purpose:** To list payment options (Credit/Debit Card, Thai QR Payment, Bank Transfer).
*   **Data: User's Saved Cards**
    *   **Primary Table:** `user_payment_methods`
    *   **Join 1:** `user_payment_methods.user_id` → `auth.users.id`
    *   **Purpose:** To identify which saved cards belong to the current user.
    *   **Join 2:** `user_payment_methods.payment_method_id` → `payment_methods.id`
    *   **Purpose:** To fetch the payment method `name`, `slug`, and `icon_url` for display.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`fetchData`** (Methods) | `src/hooks/useSubscription.tsx` (L95–102) | **Loads Payment Options:** Fetches `payment_methods` (Credit Card, QR, Bank Transfer) for the selection UI. |
| **`queryFn`** (User Methods) | `src/hooks/useUserPaymentMethods.tsx` (L35–55) | **Loads Saved Cards:** Fetches `user_payment_methods` with JOIN to `payment_methods` to show card brand, last 4 digits, and expiry. |
| **`addMethod`** | `src/hooks/useUserPaymentMethods.tsx` (L108–142) | **Saves New Card:** Inserts a new card (brand, last4, expiry) into `user_payment_methods` with mock gateway IDs. |
| **`setDefault`** | `src/hooks/useUserPaymentMethods.tsx` (L59–85) | **Sets Default Card:** Updates `is_default` flag — unsets all others first, then sets the selected one. |
| **`removeMethod`** | `src/hooks/useUserPaymentMethods.tsx` (L89–102) | **Removes Card:** Soft-deletes by setting `is_active = false`. |

---

## 3. Subscription Creation (Checkout)
**Component:** `PlanSelectionDialog.tsx` → `PaymentMethodDialog.tsx` → Confirm

### 🗄️ Database Relationships
*   **Action: Create Subscription**
    *   **Primary Table:** `subscriptions`
    *   **Join 1:** `subscriptions.user_id` → `auth.users.id`
    *   **Purpose:** To link the new subscription to the authenticated user.
    *   **Join 2:** `subscriptions.plan_id` → `subscription_plans.id`
    *   **Purpose:** To record which plan was subscribed to.
*   **Action: Record Payment**
    *   **Primary Table:** `payment_transactions`
    *   **Join 1:** `payment_transactions.user_id` → `auth.users.id`
    *   **Purpose:** To record who made the payment.
    *   **Join 2:** `payment_transactions.subscription_id` → `subscriptions.id`
    *   **Purpose:** To link the payment to the subscription.
    *   **Join 3:** `payment_transactions.payment_method_id` → `payment_methods.id`
    *   **Purpose:** To record the payment method used (Credit Card, QR, etc.).
    *   **Join 4:** `payment_transactions.currency_id` → `currencies.id`
    *   **Purpose:** To record the currency (THB).
*   **Action: Generate Invoice**
    *   **Primary Table:** `invoices`
    *   **Join 1:** `invoices.user_id` → `auth.users.id`
    *   **Purpose:** To link the invoice to the user.
    *   **Join 2:** `invoices.subscription_id` → `subscriptions.id`
    *   **Purpose:** To link the invoice to the subscription for plan name display.
    *   **Join 3:** `invoices.currency_id` → `currencies.id`
    *   **Purpose:** To store the currency symbol (฿) for invoice display.
*   **Action: Update User Profile**
    *   **Primary Table:** `customer`
    *   **Join:** `customer.id` → `auth.users.id`
    *   **Purpose:** To update `plan_type` (free/pro/team) and `subscription_credit_balance`.
*   **Reference: Currency**
    *   **Primary Table:** `currencies`
    *   **Purpose:** To look up THB currency ID for `payment_transactions` and `invoices`.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`createSubscription`** | `src/hooks/useSubscription.tsx` (L168–363) | **Core Checkout Logic:** This "Mega Function" handles the entire flow:<br>1. Validates selected plan & blocks downgrades.<br>2. Calculates proration credit from remaining days.<br>3. Closes all old active subscriptions (status → "upgraded").<br>4. Creates new `subscriptions` row (status = "active").<br>5. Records `payment_transactions` (amount, currency, gateway).<br>6. Generates `invoices` with line items.<br>7. Updates `customer.plan_type` and credit balance. |
| **`getUserCreditBalance`** | `src/hooks/useSubscription.tsx` (L151–166) | **Reads Credit:** Fetches `subscription_credit_balance` from `customer` table for proration calculation during upgrades. |
| **`getPrice`** | `src/hooks/useSubscription.tsx` (L133–135) | **Gets Plan Price:** Returns `price_monthly` or `price_yearly` based on the selected billing cycle. |
| **`cancelSubscription`** | `src/hooks/useSubscription.tsx` (L365–385) | **Cancels Plan:** Sets `cancel_at_period_end = true` and updates `customer.plan_type` back to "free". |

---

## 4. Billing & Plan Tab (Invoice History)
**Component:** `BillingTab.tsx`

### 🗄️ Database Relationships
*   **Data: Invoice List**
    *   **Primary Table:** `invoices`
    *   **Join 1:** `invoices.subscription_id` → `subscriptions.id`
    *   **Purpose:** To get the `billing_cycle` of each invoice's subscription.
    *   **Join 2:** `subscriptions.plan_id` → `subscription_plans.id` (via subscriptions)
    *   **Purpose:** To get the plan `name` (Free/Pro/Team) for display in the "รายการ" column.
    *   **Join 3:** `invoices.currency_id` → `currencies.id`
    *   **Purpose:** To get the currency `symbol` (฿) for formatting the "จำนวน" column.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`queryFn`** (Invoices) | `src/hooks/useInvoices.tsx` (L41–70) | **Fetches Invoice History:** Queries `invoices` with nested JOINs to `subscriptions` → `subscription_plans` and `currencies`. Orders by `created_at` descending. |
| **`getStatusLabel`** | `src/hooks/useInvoices.tsx` (L73–82) | **Translates Status:** Maps status to Thai labels (paid → "ชำระแล้ว", pending → "รอชำระ", overdue → "เกินกำหนด"). |
| **`getStatusColor`** | `src/hooks/useInvoices.tsx` (L84–92) | **Colors Status Badge:** Returns CSS classes for each status (green for paid, yellow for pending, red for overdue). |
| **`formatCurrency`** | `src/hooks/useInvoices.tsx` (L94–97) | **Formats Amount:** Renders amounts as `฿2,499.00` using the currency symbol from the joined `currencies` table. |
