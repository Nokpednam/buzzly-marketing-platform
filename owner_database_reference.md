# Owner Pages: Database & Function Reference

This guide details the **Primary Tables** and the **Code Functions** (Hooks) used to fetch data for each page in the Owner Dashboard.

---

## 1. Business Performance
**Path:** `/owner/business-performance`

### 🗄️ Database Relationships
*   **Metric: Monthly Recurring Revenue (MRR)**
    *   **Primary Table:** `subscriptions` (Active status)
    *   **Join:** `subscriptions.plan_id` → `subscription_plans.id`
    *   **Purpose:** To fetch `price_monthly` for calculating total MRR.
*   **Metric: Historical Revenue**
    *   **Primary Table:** `payment_transactions`
    *   **Connection:** Filtered by `created_at` (last 12 months) and `status = 'completed'`.
*   **Metric: Cohort Retention**
    *   **Primary Table:** `cohort_analysis`
    *   **Note:** Fetched directly; populated via background ETL.

### ⚡ Related Functions (Hooks)
### ⚡ Related Functions (Hooks)
| Function Name | Source File | UI Section / Purpose |
| :--- | :--- | :--- |
| **`useSubscriptionMetrics`** | `useOwnerMetrics.tsx` | **Revenue & Growth Tabs:** <br>• Power the 4 KPI Cards (MRR, Active Subs, ARR).<br>• Powers the "Revenue Trends" charts (MRR Area Chart).<br>• Powers the breakdown (New/Expansion/Churn). |
| **`useCohortAnalysis`** | `useOwnerMetrics.tsx` | **Cohort Retention Tab:** <br>• Fetches the heat map data showing user retention over time. |
| **`useSurvivalAnalysis`** | `useOwnerMetrics.tsx` | **Survival Probability Tab:** <br>• Powers the "Survival Curve" line chart and detailed table. |

---

## 2. User Feedback
**Path:** `/owner/user-feedback`

### 🗄️ Database Relationships
*   **Metric: Feedback List**
    *   **Primary Table:** `feedback`
    *   **Join 1:** `feedback.rating_id` → `rating.id` (To get "5 Stars" label)
    *   **Join 2:** `feedback.user_id` → `customer_activities` → `profile_customers` (To get User Name/Avatar)
    *   **Join 3:** `feedback.user_id` → `workspaces` (To get Business Type)

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`useFeedbackMetrics`** | `src/hooks/useOwnerMetrics.tsx` | **Summarizes Sentiment:** Calculates the Net Promoter Score (NPS), Average Rating (e.g. 4.8/5), and groups feedback into Positive/Neutral/Negative for the pie chart. |
| **`useFeedbackList`** | `src/hooks/useOwnerMetrics.tsx` | **Fetches Comments:** Retrieves the actual table of user comments with server-side pagination (page, limit). Joins with user profiles to show *who* said *what*. |

---

## 3. Customer Tiers
**Path:** `/owner/customer-tiers`

### 🗄️ Database Relationships
*   **Metric: Tiers & Points**
    *   **Primary Table:** `profile_customers`
    *   **Join:** `profile_customers.loyalty_point_id` → `loyalty_points.id` → `loyalty_tiers.id`
    *   **Purpose:** To segment users into Bronze, Silver, Gold, Platinum.
*   **Metric: Top Spenders**
    *   **Primary Table:** `payment_transactions`
    *   **Aggregation:** Sum of `amount` grouped by `user_id`.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`useCustomerTiers`** | `src/hooks/useCustomerTiers.tsx` | **Segments Customers:** This "Mega Hook" does three things:<br>1. Counts users per Tier (Distribution).<br>2. Sums revenue per Tier (Value Analysis).<br>3. Identifies "Top Performers" by lifetime spend. |

---

## 4. Product Usage
**Path:** `/owner/product-usage`

### 🗄️ Database Relationships
*   **Metric: Active Users (DAU/MAU)**
    *   **Primary Table:** `customer_activities`
    *   **Joins:** none (Raw fetch).
    *   **Logic:** The app fetches the last 5,000 activity logs and calculates DAU/MAU *in-memory* (Client-side logic) by counting unique user IDs.
*   **Metric: Business Types (User Segments)**
    *   **Primary Table:** `workspaces`
    *   **Join:** `workspaces.business_type_id` → `business_types.id`
    *   **Purpose:** To categorize users (e.g., "Agency", "SME") for the "User Segments" chart.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`useProductUsageMetrics`** | `src/hooks/useOwnerMetrics.tsx` | **Tracks Engagement:** Calculates the DAU/MAU ratio to measure product stickiness. |
| **`useUserSegments`** | `src/hooks/useOwnerMetrics.tsx` | **Profiles User Base:** Groups workspaces by their industry (Agency, SME, Enterprise) to show *who* is using the platform. |

---

## 5. Owner Discounts
**Path:** `/owner/discounts`

### 🗄️ Database Relationships
*   **Primary Table:** `discounts`
*   **Connection:** `team_id` matches the Owner's workspace ID.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`useDiscounts`** | `src/hooks/useDiscounts.tsx` | **Manages Promotions:** A complete CRUD hook. It lists all codes, handles creation of new codes, and allows toggling them Active/Inactive. It also computes "Expired" status on the client side. |

---

## 6. Executive Report
**Path:** `/owner/executive-report`

### 🗄️ Database Relationships
*   **Primary Table:** `reports` (History) and `scheduled_reports` (Automation settings).
*   **Connection:** Scoped by `team_id`.

### ⚡ Related Functions (Hooks)
| Function Name | Source File | Purpose |
| :--- | :--- | :--- |
| **`useReports`** | `src/hooks/useReports.tsx` | **Generates Reports:** Handles the "Generate Now" action and fetching the history of past reports. |
| **`useScheduledReports`** | `src/hooks/useScheduledReports.tsx` | **Automates Reporting:** Manages the scheduler settings (e.g., "Send Weekly PDF to executive@example.com"). |
