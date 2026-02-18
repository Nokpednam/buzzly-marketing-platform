# Owner Pages: Database & Function Reference

This guide maps each page in the Owner Dashboard to its underlying database tables and code functions.

---

## 1. Business Performance
**Path:** `/owner/business-performance`
**Goal:** revenue tracking (MRR, ARR) and growth metrics.

### 🗄️ Database Tables
*   **`subscriptions`**: Tracks active vs. cancelled subscriptions. Used to calculate current MRR.
*   **`subscription_plans`**: Gets the price (`price_monthly`, `price_yearly`) for each subscription.
*   **`payment_transactions`**: Source of truth for historical revenue charts.
*   **`cohort_analysis`**: Stores pre-calculated retention data for the heatmap.

### ⚡ Attributes / Functions
*   **`useSubscriptionMetrics`**:
    *   Computes **MRR**, **ARR**, and **Growth %**.
    *   Breaks down revenue into **New**, **Expansion**, and **Churn**.
*   **`useCohortAnalysis`**: Fetches the retention heatmap data.
*   **`useSurvivalAnalysis`**: Calculates how long users stay active (Survival Rate).

---

## 2. User Feedback
**Path:** `/owner/user-feedback`
**Goal:** Track customer sentiment and read specific comments.

### 🗄️ Database Tables
*   **`feedback`**: The main table for user comments and ratings.
*   **`rating`**: Lookup for rating labels (e.g., "5 Stars", "1 Star").
*   **`customer_activities`** & **`profile_customers`**: Links feedback to the real person who wrote it.
*   **`workspaces`**: Shows which business type the user belongs to.

### ⚡ Attributes / Functions
*   **`useFeedbackMetrics`**: Calculates **NPS Score**, **Avg Rating**, and **Sentiment Trends** (Last 6 months).
*   **`useFeedbackList`**: Fetches the actual list of comments with pagination.

---

## 3. Customer Tiers
**Path:** `/owner/customer-tiers`
**Goal:** Analyze customer loyalty segments.

### 🗄️ Database Tables
*   **`loyalty_tiers`**: Defines rules for Bronze, Silver, Gold, Platinum.
*   **`profile_customers`**: The customer records.
*   **`loyalty_points`**: Tracks current points and total lifetime points.
*   **`payment_transactions`**: Used to find "Top Performers" (highest spenders).

### ⚡ Attributes / Functions
*   **`useCustomerTiers`**:
    *   **Tier Distribution**: How many users are in each tier?
    *   **Revenue by Tier**: How much money does each tier spend?
    *   **Top Performers**: Lists the top 5 customers by total spend.

---

## 4. Product Usage
**Path:** `/owner/product-usage`
**Goal:** Monitor active users and engagement.

### 🗄️ Database Tables
*   **`customer_activities`**: The log of user actions, used for DAU/MAU.
*   **`profile_customers`**: Used for total user counts.
*   **`workspaces`** & **`business_types`**: Used to segment users by industry (e.g., Agency vs. SME).

### ⚡ Attributes / Functions
*   **`useProductUsageMetrics`**: Calculcates **DAU** (Daily Active Users) and **MAU** (Monthly Active Users).
*   **`useUserSegments`**: Shows the percentage of users in each Business Type.

---

## 5. Owner Discounts
**Path:** `/owner/discounts`
**Goal:** Manage promotional codes.

### 🗄️ Database Tables
*   **`discounts`**: Stores code details, usage limits, and expiration dates.

### ⚡ Attributes / Functions
*   **`useDiscounts`**: Handles Creating, Deleting, and Toggling discount codes. Provides status counts (Active, Expired).

---

## 6. Executive Report
**Path:** `/owner/executive-report`
**Goal:** Generate and schedule PDF/Excel reports.

### 🗄️ Database Tables
*   **`reports`**: History of generated reports.
*   **`scheduled_reports`**: Settings for automatic recurring reports.

### ⚡ Attributes / Functions
*   **`useReports`**: Manages manual report generation.
*   **`useScheduledReports`**: Manages automated schedules.
