# รายละเอียดไฟล์ Test: Tier Management

เราได้แยกการทดสอบออกเป็น 2 ส่วนหลักๆ คือส่วนหน้าจอ (UI) และส่วนการคำนวณ (Logic/Hooks)

## 1. ทดสอบส่วนหน้าจอ (UI Tests)

**ไฟล์:** `src/pages/admin/__tests__/TierManagement.test.tsx`

ไฟล์นี้ทำหน้าที่ทดสอบการทำงานของหน้าจอ **Tier Management** (`TierManagement.tsx`) ซึ่งใช้ Mock Data ภายในเพื่อการแสดงผล
**สิ่งที่ทดสอบ:**

*   `Component Rendering`: `**[TierManagement](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#97)`
    *   ทดสอบการแสดงผลเริ่มต้นของหน้าจอ
    *   ตรวจสอบว่ามีหัวข้อ Components หลักๆ ครบถ้วน (Header, Search Bar)

*   `Customer Search Filtering`: `**[TierManagement](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#97)`
    *   ทดสอบการพิมพ์ในช่องค้นหา (Search Input)
    *   ตรวจสอบว่าระบบกรองรายชื่อลูกค้าแบบ Real-time ตามคำค้นหาได้ถูกต้อง

*   `Customer Selection`: `**[TierManagement](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#97)`
    *   ทดสอบการคลิกเลือกรายชื่อลูกค้า
    *   ตรวจสอบว่า Card แสดงรายละเอียดลูกค้า (Points, Spend, Tier) ปรากฏขึ้นมาถูกต้อง

*   `Manual Override Dialog`: `**[TierManagement](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#97)`
    *   ทดสอบการเปิด Dialog "Manual Override"
    *   ตรวจสอบการทำงานของปุ่มเปิด/ปิด Dialog (State Management)

*   `Tab Navigation`: `**[TierManagement](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#97)`
    *   ทดสอบการเปลี่ยน Tab ระหว่าง History, Transactions และ Suspicious Activities
    *   ตรวจสอบว่าเนื้อหาภายในเปลี่ยนไปตาม Tab ที่เลือกอย่างถูกต้อง

*   `Action Buttons (Inspect/Suspend)`: `**[handleInspect](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#114)` / `**[handleSuspend](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/TierManagement.tsx#121)`
    *   ทดสอบปุ่มดำเนินการในหน้า Suspicious Activities
    *   ตรวจสอบว่ามีการเรียก `toast()` เพื่อแจ้งเตือนเมื่อกดปุ่ม "ตรวจสอบ" หรือ "ระงับ"

---

## 2. ทดสอบส่วน Logic (Hook Tests)

**ไฟล์:** `src/hooks/__tests__/useLoyaltyTier.test.tsx`

ไฟล์นี้ทำหน้าที่ทดสอบ `useLoyaltyTier` hook ซึ่งเป็นตัวจัดการ Business Logic เกี่ยวกับระบบสมาชิกและการคำนวณคะแนน
**สิ่งที่ทดสอบ:**

*   `Initialization & Loading`: `**[useLoyaltyTier](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useLoyaltyTier.tsx#42)`
    *   ทดสอบค่าเริ่มต้นของ Hook (Initial State)
    *   ตรวจสอบสถานะ Loading ก่อนที่ข้อมูลจะถูกดึงมาครบ

*   `Data Fetching`: `**[fetchUserLoyalty](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useLoyaltyTier.tsx#64)`
    *   ทดสอบการดึงข้อมูล `loyalty_tiers` และ `customer` profile จาก Supabase
    *   ตรวจสอบการ map ข้อมูลจาก Database ลงสู่ State ของ Hook

*   `Next Tier Calculation`: `**[getNextTier](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useLoyaltyTier.tsx#142)`
    *   ทดสอบ Logic การค้นหา Tier ระดับถัดไป
    *   ตรวจสอบว่าระบบเลือก Tier ที่มี `priority_level` สูงกว่าระดับปัจจุบัน 1 ขั้นได้ถูกต้อง

*   `Progress Calculation`: `**[getProgressToNextTier](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useLoyaltyTier.tsx#150)`
    *   ทดสอบสูตรคำนวณเปอร์เซ็นต์ความคืบหน้า (Progress Bar)
    *   สูตร: `(คะแนนปัจจุบัน - ฐานคะแนนเก่า) / (ฐานคะแนนใหม่ - ฐานคะแนนเก่า) * 100`

*   `Max Tier Handling`: `**[getProgressToNextTier](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useLoyaltyTier.tsx#150)`
    *   ทดสอบกรณีลูกค้าอยู่ระดับสูงสุดแล้ว (ตัวอย่างเช่น Platinum)
    *   ตรวจสอบว่า Progress ต้องเป็น 100% เสมอ และไม่มี Next Tier

---

## คำสั่งสำหรับรัน Test

```bash
# รัน Test เฉพาะส่วนหน้าจอ Tier Management
npm run test:tier

# รัน Test เฉพาะส่วนคำนวณ Loyalty Logic
npm run test:loyalty

# รัน Test ทั้งหมด
npx vitest
```
