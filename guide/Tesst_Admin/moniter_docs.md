# เอกสารการทดสอบระบบ Monitor Dashboard (Test Documentation)

เอกสารฉบับนี้อธิบายรายละเอียดเกี่ยวกับ Unit Tests ที่ได้เขียนขึ้นสำหรับระบบ Monitor Dashboard ในโปรเจค BuzzlyDev

## 🚀 คำสั่งสำหรับรัน Test (How to Run)

คุณสามารถรันคำสั่งเหล่านี้ผ่าน Terminal หรือ Command Prompt ในโฟลเดอร์ของโปรเจค:

### 1. รันเฉพาะ Monitor Dashboard (แนะนำ)
คำสั่งนี้จะรันเฉพาะไฟล์ Test ที่เกี่ยวข้องกับ Dashboard นี้เท่านั้น (ทั้งส่วน Logic และ UI)
```bash
npm run test:monitor
```

### 2. รัน Test ทั้งหมดในโปรเจค
สำหรับรัน Test ทุกไฟล์ที่มีในระบบ
```bash
npm test
```

### 3. รันแบบ UI (ดูผลผ่านหน้าเว็บ)
เปิดหน้าเว็บเพื่อดูผลการทดสอบแบบ Real-time (อ่านง่ายกว่า)
```bash
npx vitest --ui
```

---

## 📂 รายละเอียดไฟล์ Test

เราได้แยกการทดสอบออกเป็น 2 ส่วนหลักๆ คือส่วนการคำนวณ (Logic) และส่วนหน้าจอ (UI)

### 1. ทดสอบส่วน Logic (Hooks)
**ไฟล์:** [src/hooks/__tests__/useAdminMonitor.test.tsx](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/__tests__/useAdminMonitor.test.tsx)

ไฟล์นี้ทำหน้าที่ทดสอบ `useAdminMonitor` hook ซึ่งเป็นตัวจัดการข้อมูลก่อนส่งไปแสดงผล เราทดสอบเพื่อให้มั่นใจว่าข้อมูลดิบจาก Database ถูกนำมาประมวลผลถูกต้อง

**สิ่งที่ทดสอบ:**
- **[useServerHealth](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useAdminMonitor.tsx#32-46)**: 
  - ทดสอบว่าดึงรายชื่อ Server มาได้ถูกต้อง
  - ทดสอบกรณีไม่มี Server ในระบบ (Empty State)
- **[useDataPipelines](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useAdminMonitor.tsx#47-61)**: 
  - ทดสอบการดึงสถานะ Pipeline
- **[useExternalAPIStatus](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useAdminMonitor.tsx#62-86)**: 
  - ทดสอบการดึงสถานะ API
  - **สำคัญ:** ตรวจสอบว่า `platform_id` ถูกเปลี่ยนเป็นชื่อ `platform_name` ถูกต้อง (การ Join ตาราง)
- **[useErrorLogStats](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useAdminMonitor.tsx#87-128)**: 
  - ทดสอบการนับจำนวน Error Logs แยกตามประเภท (Error, Warning, Info) ว่านับจำนวนถูกหรือไม่
- **[usePerformanceMetrics](file:///d:/Buzzly_Dev/BuzzlyDev/src/hooks/useAdminMonitor.tsx#129-160)**: 
  - **Logic ซับซ้อน:** ทดสอบสูตรคำนวณค่าเฉลี่ย CPU และ RAM ของ Server ทุกตัวที่ทำงานอยู่
  - ตรวจสอบ Logic การนับจำนวน Server ที่มีสถานะ 'Healthy', 'Warning', และ 'Critical' ว่าตรงตามเงื่อนไขหรือไม่

### 2. ทดสอบส่วนหน้าจอ (UI Component)
**ไฟล์:** [src/pages/admin/__tests__/MonitorDashboard.test.tsx](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/__tests__/MonitorDashboard.test.tsx)

ไฟล์นี้ทดสอบตัวหน้าจอ [MonitorDashboard](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/MonitorDashboard.tsx#64-386) โดยเราจะ Mock (จำลอง) ข้อมูลส่งเข้าไป เพื่อดูว่าหน้าจอแสดงผลตามที่ควรจะเป็นหรือไม่

**สิ่งที่ทดสอบ:**
- **การแสดงผล (Rendering)**: 
  - ตรวจสอบว่าหัวข้อ, การ์ดแสดงสถานะ, และ Tab เมนูต่างๆ ปรากฏครบถ้วน
- **สถานะกำลังโหลด (Loading States)**: 
  - ตรวจสอบว่ามีข้อความ "Loading..." ขึ้นเมื่อกำลังดึงข้อมูล
- **การแสดงข้อมูล**: 
  - ตรวจสอบว่าข้อมูลเช่น "Server-1", "CPU 45%" แสดงถูกตำแหน่ง
  - ตรวจสอบว่าถ้าสถานะ Server เป็น "Critical" หน้าจอต้องแสดงข้อความหรือสีแจ้งเตือนถูกต้อง
- **การใช้งาน (User Interactions)**: 
  - **Tabs**: จำลองการคลิก Tab (เช่นเปลี่ยนไปดู "Errors") และตรวจสอบว่าเนื้อหาเปลี่ยนตาม
  - **ปุ่ม Refresh**: ตรวจสอบว่าเมื่อกดปุ่ม Refresh ระบบมีการสั่งดึงข้อมูลใหม่ (Refetch) จริงๆ

## 🛠️ เทคโนโลยีที่ใช้

- **Vitest**: ตัวรัน Test ที่ทำงานได้รวดเร็ว
- **@testing-library/react**: เครื่องมือช่วยในการ Render และจำลองการคลิกบน Component
- **Mocking**: เทคนิคการจำลองข้อมูลแทนการต่อ Database จริง ทำให้ Test ทำงานได้เร็วและไม่กระทบข้อมูลจริง
