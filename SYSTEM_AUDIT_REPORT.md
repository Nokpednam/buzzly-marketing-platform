# 🔍 Buzzly System Audit Report
## Table-to-UI Mapping Analysis

รายงานการตรวจสอบความสัมพันธ์ระหว่าง **Database Tables/Attributes** กับ **UX/UI หน้าจอ**

---

## 📊 สรุปภาพรวม

| หมวดหมู่ | จำนวน Tables | มี UI รองรับ | มี UI บางส่วน | ไม่มี UI |
|----------|-------------|-------------|---------------|---------|
| Core Business | 12 | 8 | 3 | 1 |
| User & Auth | 4 | 4 | 0 | 0 |
| Marketing & Ads | 8 | 4 | 2 | 2 |
| Analytics & Events | 7 | 2 | 3 | 2 |
| Master Data | 15 | 8 | 4 | 3 |
| System & Logs | 5 | 3 | 1 | 1 |

---

## ✅ TABLES ที่มี UI รองรับครบถ้วน

### 1. **profiles** (User Profile)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Auth System | ✅ |
| email | Settings > Profile, Auth | ✅ |
| full_name | Settings > Profile, Sidebar | ✅ |
| avatar_url | Settings > Profile | ✅ |
| plan_type | Sidebar > Plan Panel | ✅ |
| created_at | - | ✅ (system) |
| updated_at | - | ✅ (system) |

### 2. **user_roles** (Access Control)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| user_id | System | ✅ |
| role | Auth redirect, Protected Routes | ✅ |

### 3. **teams** (Workspaces)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| name | Settings > Workspace, Admin Workspaces | ✅ |
| description | Settings > Workspace, Admin Workspaces | ✅ |
| logo_url | Settings > Workspace, Admin Workspaces | ✅ |
| workspace_url | Settings > Workspace, Admin Workspaces | ✅ |
| status | Admin Workspaces | ✅ |
| owner_id | Team Management | ✅ |
| business_type_id | Settings > Workspace, Admin Workspaces | ✅ |
| industries_id | Settings > Workspace, Admin Workspaces | ✅ |
| created_at | Admin Workspaces | ✅ |

### 4. **team_members** (Team Membership)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| team_id | Team Management | ✅ |
| user_id | Team Management | ✅ |
| role | Team Management, Admin Members | ✅ |
| status | Team Management, Admin Members | ✅ |
| joined_at | Team Management, Admin Members | ✅ |
| custom_permissions | Team Management (Permissions Dialog) | ✅ |

### 5. **team_invitations** (Invitations)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| team_id | Team Management, Admin Members | ✅ |
| email | Team Management, Admin Members | ✅ |
| role | Team Management, Admin Members | ✅ |
| invited_by | Team Management, Admin Members | ✅ |
| expires_at | Team Management, Admin Members | ✅ |
| status | Team Management, Admin Members | ✅ |
| created_at | Admin Members | ✅ |

### 6. **workspace_members** (Member Chains)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| workspace_id | Team Management, Admin Members | ✅ |
| user_id | Team Management, Admin Members | ✅ |
| status | Team Management, Admin Members | ✅ |
| joined_at | Admin Members | ✅ |
| invited_by | Team Management | ✅ |

### 7. **error_logs** (System Errors)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| level | Admin Support | ✅ |
| message | Admin Support | ✅ |
| user_id | Admin Support | ✅ |
| request_id | Admin Support | ✅ |
| stack_trace | Admin Support (Detail Dialog) | ✅ |
| metadata | Admin Support (Detail Dialog) | ✅ |
| created_at | Admin Support | ✅ |

### 8. **business_types** (Master Data)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| name | Settings > Workspace, Admin Workspaces | ✅ |
| slug | System | ✅ |
| description | - | ✅ (optional) |
| icon_url | - | ⚠️ ไม่ได้แสดง |
| display_order | System (sorting) | ✅ |
| is_active | System (filter) | ✅ |

### 9. **industries** (Master Data)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| name | Settings > Workspace, Admin Workspaces | ✅ |
| slug | System | ✅ |
| description | - | ⚠️ ไม่ได้แสดง |
| icon_url | - | ⚠️ ไม่ได้แสดง |
| display_order | System | ✅ |
| is_active | System | ✅ |

### 10. **customer_insights** (Signup Data)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| user_id | System | ✅ |
| profession | SignUp Step 2 | ✅ |
| company | SignUp Step 2 | ✅ |
| salary_range | SignUp Step 2 | ✅ |
| num_employees | SignUp Step 2 | ✅ |
| phone | SignUp Step 1 | ✅ |

---

## ⚠️ TABLES ที่มี UI รองรับบางส่วน

### 11. **platforms** (Ad Platforms)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| name | API Keys, Admin Workspaces | ✅ |
| slug | System | ✅ |
| description | - | ❌ ไม่ได้แสดง |
| icon_url | API Keys | ⚠️ ใช้ Lucide icons แทน |
| is_active | System | ✅ |
| api_version | - | ❌ ไม่ได้แสดง |
| platform_category_id | - | ❌ ไม่ได้ใช้ |

### 12. **ad_accounts** (Ad Account Connections)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| account_name | Admin Workspaces (API Dialog) | ✅ |
| team_id | Admin Workspaces | ✅ |
| platform_id | Admin Workspaces | ✅ |
| platform_account_id | Admin Workspaces | ✅ |
| is_active | Admin Workspaces | ✅ |
| created_at | - | ❌ ไม่ได้แสดง |
| updated_at | - | ❌ ไม่ได้แสดง |

### 13. **campaigns** (Marketing Campaigns)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Campaigns Page | ✅ |
| name | Campaigns Page | ✅ |
| status | Campaigns Page | ✅ |
| start_date | Campaigns Page | ✅ |
| end_date | Campaigns Page | ✅ |
| budget_amount | Campaigns Page | ✅ |
| objective | Campaigns Page | ✅ |
| ad_account_id | - | ❌ **ใช้ Mock Data ไม่ได้ดึงจาก DB** |
| ad_buying_type_id | - | ❌ ไม่ได้ใช้ |
| mapping_groups_id | - | ❌ ไม่ได้ใช้ |

### 14. **ads** (Individual Ads)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Social Analytics > Ads Tab | ✅ |
| name | Social Analytics > Ads Tab | ✅ |
| headline | Social Analytics > Ads Tab | ✅ |
| ad_copy | Social Analytics > Ads Tab | ✅ |
| call_to_action | Social Analytics > Ads Tab | ✅ |
| creative_url | Social Analytics > Ads Tab | ✅ |
| preview_url | - | ❌ ไม่ได้แสดง |
| status | Social Analytics > Ads Tab | ✅ |
| ad_group_id | Social Analytics | ⚠️ Mock Data |
| creative_type_id | - | ❌ ไม่ได้ใช้ |
| platform_ad_id | - | ❌ ไม่ได้ใช้ |

### 15. **ad_groups** (Ad Groups)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Social Analytics > Groups Tab | ✅ |
| name | Social Analytics > Groups Tab | ✅ |
| status | Social Analytics > Groups Tab | ✅ |
| created_at | - | ❌ ไม่ได้แสดง |
| updated_at | - | ❌ ไม่ได้แสดง |

### 16. **ad_insights** (Ad Performance)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | System | ✅ |
| date | Social Analytics > Insights | ⚠️ Mock |
| impressions | Social Analytics, Dashboard | ⚠️ **Mock Data** |
| clicks | Social Analytics, Dashboard | ⚠️ **Mock Data** |
| spend | Social Analytics | ⚠️ **Mock Data** |
| conversions | Social Analytics, Dashboard | ⚠️ **Mock Data** |
| reach | Dashboard | ⚠️ **Mock Data** |
| ctr | Analytics | ⚠️ **Mock Data** |
| cpc | Analytics | ⚠️ **Mock Data** |
| cpm | Analytics | ⚠️ **Mock Data** |
| roas | Social Analytics | ⚠️ **Mock Data** |
| ads_id | - | ❌ ไม่ได้เชื่อม |
| campaign_id | - | ❌ ไม่ได้เชื่อม |
| ad_account_id | - | ❌ ไม่ได้เชื่อม |

### 17. **employees** (Employee Management)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Team Management > Employees | ✅ |
| email | Team Management > Employees | ✅ |
| role_employees_id | Team Management > Employees | ⚠️ Mock |
| status | Team Management > Employees | ⚠️ Mock |
| user_id | - | ❌ ไม่ได้เชื่อม |
| password_hash | - | ❌ Security (ไม่ควรแสดง) |
| is_locked | - | ❌ ไม่ได้ใช้ |

### 18. **employees_profile** (Employee Details)
| Attribute | UI Location | Status |
|-----------|------------|--------|
| id | Team Management | ⚠️ Mock |
| employees_id | - | ⚠️ Mock |
| first_name | Team Management > Employees | ⚠️ Mock |
| last_name | Team Management > Employees | ⚠️ Mock |
| profile_img | - | ❌ ไม่ได้แสดง |
| aptitude | - | ❌ ไม่ได้แสดง |
| birthday_at | - | ❌ ไม่ได้แสดง |
| last_active | - | ❌ ไม่ได้แสดง |
| role_employees_id | - | ❌ duplicate |

---

## ❌ TABLES ที่ยังไม่มี UI รองรับ

### 19. **budgets** (Budget Management)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| name | Settings > Budget Tab | 🔴 High |
| amount | Settings > Budget Tab | 🔴 High |
| budget_type | Settings > Budget Tab | 🔴 High |
| team_id | System | - |
| campaign_id | Campaign Detail | 🟡 Medium |
| currency_id | Settings > Budget | 🟡 Medium |
| start_date | Settings > Budget | 🟡 Medium |
| end_date | Settings > Budget | 🟡 Medium |
| alert_threshold_percent | Settings > Budget | 🔴 High |
| spent_amount | Dashboard | 🔴 High |
| remaining_amount | Dashboard | 🔴 High |
| is_active | System | - |
| created_by | - | - |

**สถานะ**: มี Tab "Budget" ใน Settings แล้ว แต่ใช้ **Mock Data เท่านั้น** ❌

### 20. **conversion_events** (Conversion Tracking)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | Analytics/Dashboard | 🔴 High |
| event_name | AARRR Funnel | 🔴 High |
| event_value | Dashboard | 🔴 High |
| occurred_at | Analytics | 🔴 High |
| event_type_id | Analytics | 🟡 Medium |
| attribution_type_id | Analytics | 🟡 Medium |
| attribution_window | Analytics | 🟢 Low |
| ads_id | Analytics | 🟡 Medium |
| ad_account_id | Analytics | 🟡 Medium |
| conversion_item_id | - | 🟢 Low |
| processing_status | Admin | 🟢 Low |
| meta_data | Admin | 🟢 Low |

**สถานะ**: ❌ **ไม่มี UI รองรับ - ใช้ Mock Data ใน Dashboard/Analytics**

### 21. **conversion_items** (Conversion Details)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| product_name | Reports | 🟡 Medium |
| quantity | Reports | 🟡 Medium |
| unit_price | Reports | 🟡 Medium |
| total_price | Reports | 🟡 Medium |
| product_category_id | Reports | 🟢 Low |
| variant_product_id | Reports | 🟢 Low |

**สถานะ**: ❌ **ไม่มี UI รองรับเลย**

### 22. **customer_activities** (User Tracking)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| profile_customer_id | Customer Journey | 🔴 High |
| event_type_id | Customer Journey | 🔴 High |
| event_data | Customer Journey | 🟡 Medium |
| session_id | Analytics | 🟡 Medium |
| page_url | Analytics | 🟡 Medium |
| referrer_url | Analytics | 🟡 Medium |
| device_type | Analytics | 🟢 Low |
| browser | Analytics | 🟢 Low |
| ip_address | Admin | 🟢 Low |
| campaign_id | Analytics | 🟡 Medium |

**สถานะ**: ❌ **Customer Journey ใช้ Mock Data ไม่ได้ดึงจากตารางนี้**

### 23. **cohort_analysis** (Cohort Reports)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| team_id | Reports | 🔴 High |
| cohort_date | Reports | 🔴 High |
| cohort_size | Reports | 🔴 High |
| cohort_type | Reports | 🟡 Medium |
| retention_data | Reports | 🔴 High |
| revenue_data | Reports | 🔴 High |
| active_users_data | Reports | 🔴 High |
| average_retention | Reports | 🔴 High |
| churn_rate | Reports | 🔴 High |
| lifetime_value | Reports | 🔴 High |

**สถานะ**: ❌ **ไม่มี Cohort Analysis UI เลย**

### 24. **feedback** (User Feedback)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| user_id | Admin Support | 🔴 High |
| rating_id | Admin Support | 🔴 High |
| comment | Admin Support | 🔴 High |
| customer_activities_id | - | 🟢 Low |

**สถานะ**: ❌ **Admin Support แสดงเฉพาะ Error Logs ไม่มี Feedback**

### 25. **discounts** (Promotion Codes)
| Attribute | Recommended UI | Priority |
|-----------|---------------|----------|
| id | - | - |
| code | Campaigns? | 🟢 Low |
| discount_type | Campaigns? | 🟢 Low |
| discount_value | Campaigns? | 🟢 Low |
| start_date | Campaigns? | 🟢 Low |
| end_date | Campaigns? | 🟢 Low |
| usage_count | Campaigns? | 🟢 Low |
| usage_limit | Campaigns? | 🟢 Low |
| min_order_value | Campaigns? | 🟢 Low |
| is_active | Campaigns? | 🟢 Low |

**สถานะ**: ❌ **ไม่มี Discount/Promotion UI**

---

## 📋 Master Data Tables (Reference Tables)

### Tables ที่มี UI รองรับ:
| Table | Used In |
|-------|---------|
| business_types | Settings > Workspace, Admin Workspaces |
| industries | Settings > Workspace, Admin Workspaces |
| platforms | API Keys, Ad Accounts |
| currencies | Settings > Budget (mock) |

### Tables ที่ไม่มี UI รองรับ:
| Table | Recommendation |
|-------|---------------|
| event_types | ควรใช้ใน Customer Journey |
| event_categories | ควรใช้ใน Analytics |
| creative_types | ควรใช้ใน Ads |
| attribution_types | ควรใช้ใน Analytics Attribution |
| ad_buying_types | ควรใช้ใน Campaign Creation |
| payment_methods | ควรใช้ใน Billing |
| payment_providers | ควรใช้ใน Billing |
| loyalty_tiers | ควรใช้ใน Customer Loyalty |
| loyalty_points | ควรใช้ใน Customer Loyalty |
| countries | ควรใช้ใน Profile/Company |
| provinces | ควรใช้ใน Profile/Company |
| locations | ควรใช้ใน Company Settings |
| genders | ควรใช้ใน Profile |
| aarrr_categories | ใช้ใน AARRR Funnel (mock) |
| funnel_stages | ใช้ใน AARRR Funnel (mock) |
| mapping_categories | System/Admin |
| mapping_groups | System/Admin |
| metric_templates | Admin Dashboard Templates |
| persona_definition | Customer Persona Page |
| profile_customers | External Customer Management |

---

## 🔴 ปัญหาหลักที่พบ

### 1. **Mock Data vs Real Database**
หลายหน้าใช้ **Mock Data แบบ Hardcode** แทนการดึงจาก Database:

| Page | Tables ที่ควรใช้ | สถานะปัจจุบัน |
|------|-----------------|---------------|
| Dashboard | ad_insights, campaigns | ❌ Mock Data |
| Campaigns | campaigns, ads | ⚠️ Local State ไม่บันทึก DB |
| Analytics | ad_insights, conversion_events | ❌ Mock Data |
| Social Analytics | ads, ad_groups, ad_insights | ❌ Mock Data |
| Customer Journey | customer_activities, conversion_events | ❌ Mock Data |
| AARRR Funnel | aarrr_categories, funnel_stages, customer_activities | ❌ Mock Data |
| Settings > Budget | budgets, currencies | ❌ Mock Data |
| Team > Employees | employees, employees_profile | ❌ Mock Data |

### 2. **Missing Features**
| Feature | Required Tables | Status |
|---------|-----------------|--------|
| Cohort Analysis | cohort_analysis | ❌ ไม่มีหน้าจอ |
| User Feedback | feedback, rating | ❌ ไม่มีหน้าจอ |
| Discount Management | discounts | ❌ ไม่มีหน้าจอ |
| Payment Integration | payment_methods, payment_providers | ❌ Billing ใช้ Mock |
| Customer Loyalty | loyalty_tiers, loyalty_points | ❌ ไม่มีหน้าจอ |

### 3. **Incomplete Admin Features**
| Admin Page | Missing |
|------------|---------|
| Admin Support | Feedback management, Issue resolution tracking |
| Admin Workspaces | Actual suspend/activate (needs DB column) |
| Admin Members | Customer complaint handling |

---

## 📈 Recommendations

### Priority 1 (Critical) 🔴
1. **เชื่อม Dashboard/Analytics กับ ad_insights Table จริง**
2. **เพิ่ม Column is_suspended ใน teams Table**
3. **เชื่อม Campaigns Page กับ campaigns Table**
4. **เพิ่ม Feedback Tab ใน Admin Support**

### Priority 2 (High) 🟡
1. **สร้าง Cohort Analysis Page**
2. **เชื่อม Customer Journey กับ customer_activities**
3. **เชื่อม Budget Settings กับ budgets Table**
4. **เพิ่ม Discount Management UI**

### Priority 3 (Medium) 🟢
1. **เพิ่ม Payment Integration ใน Billing**
2. **สร้าง Loyalty Program UI**
3. **เพิ่ม Report Export ที่ใช้ข้อมูลจริง**

---

## 📊 Coverage Summary

| Category | Coverage |
|----------|----------|
| **User Authentication** | 100% ✅ |
| **Team Management** | 95% ✅ |
| **Admin Panel** | 75% ⚠️ |
| **Marketing Analytics** | 30% ❌ (Mock Only) |
| **Campaign Management** | 40% ⚠️ (No DB Save) |
| **Customer Data** | 20% ❌ (Mock Only) |
| **Financial/Billing** | 10% ❌ (Mock Only) |
| **Master Data** | 50% ⚠️ |

---

**Generated:** 2026-01-31
**Total Tables Analyzed:** 52
**Tables with Full UI:** 18 (35%)
**Tables with Partial UI:** 14 (27%)
**Tables without UI:** 20 (38%)
