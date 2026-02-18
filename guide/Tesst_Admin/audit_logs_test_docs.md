# เอกสารการทดสอบระบบ Audit Logs (Test Documentation)

เอกสารฉบับนี้อธิบายรายละเอียดเกี่ยวกับ Unit Tests ที่ได้เขียนขึ้นสำหรับระบบ **Audit Logs** (`/admin/audit-logs`) ในโปรเจค BuzzlyDev

## 🚀 คำสั่งสำหรับรัน Test

คุณสามารถรันเฉพาะส่วนของ Audit Logs ได้ด้วยคำสั่ง:

```bash
npm run test:audit
```

หรือรัน Test ทั้งหมดในโปรเจค:
```bash
npm test
```

---

## 📂 รายละเอียดไฟล์ Test

### 1. ทดสอบส่วน Logic (Hooks)
**ไฟล์:** `src/hooks/__tests__/useAuditLogs.test.tsx`

ไฟล์นี้ทำหน้าที่ทดสอบ Hooks ที่ใช้ดึงข้อมูลและเตรียมข้อมูลสำหรับหน้า Audit Logs

**สิ่งที่ทดสอบ:**
- **`useAuditLogs`**:
  - **Data Fetching & Mapping**: ทดสอบว่า Hook ดึงข้อมูล Logs มาได้ และนำ `user_id` ไปดึงข้อมูล Email และ Role ของพนักงานมาแปะรวมกัน (Join Data) ได้ถูกต้องหรือไม่
  - **Category Filtering**: ทดสอบว่าเมื่อมีการเลือก Category (เช่น 'authentication') Hook จะสร้าง Query Key ที่ถูกต้องเพื่อดึงข้อมูลใหม่
- **`useAuditLogStats`**:
  - **Statistics Calculation**: ทดสอบสูตรการคำนวณตัวเลขสถิติต่างๆ ที่แสดงด้านบนของหน้าจอ (Total Logins, Failed Logins, Data Exports, etc.) ตรวจสอบว่านับจำนวนได้ถูกต้องตามเงื่อนไข

### 2. ทดสอบส่วนหน้าจอ (UI Component)
**ไฟล์:** `src/pages/admin/__tests__/AuditLogs.test.tsx`

ไฟล์นี้ทดสอบตัวหน้าจอ `AuditLogs` โดยการจำลองการแสดงผล

**สิ่งที่ทดสอบ:**
- **การแสดงผล (Rendering)**:
  - ตรวจสอบว่าหัวข้อ "Audit Logs" และ Card แสดงตัวเลขสถิติต่างๆ ปรากฏครบถ้วน
  - ตรวจสอบว่าตาราง Logs แสดงข้อมูลถูกต้องตามที่ Mock ไว้ (Action Name, User Email, Role, Status)
- **สถานะกำลังโหลด (Loading States)**:
  - ตรวจสอบว่ามีข้อความ "Loading audit logs..." ขึ้นเมื่อกำลังดึงข้อมูล
- **การค้นหา (Client-Side Search)**:
  - **Scenario**: จำลองการพิมพ์คำว่า "Export" ลงในช่องค้นหา
  - **Expectation**: ตรวจสอบว่า Logs ที่ไม่มีคำว่า "Export" หายไป และเหลือแสดงแค่รายการที่ค้นหาเจอ (Client-side filtering ทำงานถูกต้อง)
- **ปุ่ม Refresh**:
  - ทดสอบว่าเมื่อกดปุ่ม Refresh ระบบมีการเรียกฟังก์ชัน `refetch` ของ Hook เพื่อดึงข้อมูลใหม่จริงๆ

## 🛠️ เทคโนโลยีที่ใช้

- **Vitest**: ตัวรัน Test หลัก
- **@testing-library/react**: ใช้ Render Component และค้นหา Element บนหน้าจอ (เช่น `screen.getByText`)
- **@testing-library/user-event**: ใช้จำลองเหตุการณ์ผู้ใช้ เช่น การพิมพ์ (`type`) หรือการคลิก (`click`)
- **Mocking (Vi.mock)**: จำลองการทำงานของ `useAuditLogs` hook เพื่อไม่ต้องต่อ Database จริง และสามารถควบคุมข้อมูลที่จะทดสอบได้ (เช่น บังคับให้ Loading, หรือบังคับให้มีข้อมูล)
