# รายละเอียดไฟล์ Test: Admin Support

เราได้แยกการทดสอบออกเป็น 2 ส่วนหลักๆ คือส่วนหน้าจอ (UI) และส่วนระบบหลังบ้าน (Logic)

## 1. ทดสอบส่วนหน้าจอ (UI Tests)

**ไฟล์:** `src/pages/admin/__tests__/AdminSupport.test.tsx`

ไฟล์นี้ทำหน้าที่ทดสอบการทำงานของหน้าจอ **Support & Error Logs** (`AdminSupport.tsx`) รวมถึงการดึงข้อมูลและการโต้ตอบกับผู้ใช้
**สิ่งที่ทดสอบ:**

*   `Component Rendering & Stats`: `**[AdminSupport](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#62)`
    *   ทดสอบการแสดงผล Header และ Card สถิติต่างๆ
    *   ทดสอบว่าค่า Total, Errors, Warnings ถูกคำนวณและแสดงผลถูกต้องตามข้อมูลที่ได้รับ

*   `Data Fetching`: `**[useQuery](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#92)`
    *   ทดสอบการจำลองข้อมูล (Mock) จาก Supabase
    *   ตรวจสอบว่าข้อมูลถูกนำมาแสดงในตาราง (Table) ได้ครบถ้วนถูกต้อง

*   `Client-side Filtering`: `**[AdminSupport](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#62)`
    *   ทดสอบระบบค้นหา (Search Box)
    *   ตรวจสอบว่าเมื่อพิมพ์คำค้นหา ตารางจะกรองข้อมูลแสดงเฉพาะรายการที่ตรงกัน

*   `Error Simulation`: `**[handleSimulateError](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#68)`
    *   ทดสอบปุ่ม "Test Error"
    *   ตรวจสอบว่าเมื่อกดปุ่ม ระบบจะเรียกฟังก์ชัน `logError` และแสดง Toast Notification แจ้งเตือน

*   `Details Dialog`: `**[AdminSupport](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#62)`
    *   ทดสอบการกดปุ่ม "View Details" ในตาราง
    *   ตรวจสอบว่า Dialog เปิดขึ้นมาและแสดงข้อมูลเชิงลึก (Stack Trace, Metadata) ของ Log นั้นๆ

*   `Empty State`: `**[AdminSupport](file:///d:/Buzzly_Dev/BuzzlyDev/src/pages/admin/AdminSupport.tsx#62)`
    *   ทดสอบกรณีไม่มีข้อมูล Error Logs ในระบบ
    *   ตรวจสอบว่าหน้าจอแสดงข้อความแจ้งเตือนที่เหมาะสม (เช่น "No error logs found")

---

## 2. ทดสอบส่วน Logic (Service Tests)

**ไฟล์:** `src/services/__tests__/errorLogger.test.ts`

ไฟล์นี้ทำหน้าที่ทดสอบ **Error Logger Service** (`errorLogger.ts`) ซึ่งเป็นหัวใจสำคัญในการบันทึกปัญหาที่เกิดขึ้นในระบบ
**สิ่งที่ทดสอบ:**

*   `Logging Functions`: `**[logError](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#135)` / `**[logWarning](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#151)`
    *   ทดสอบการบันทึก Log แต่ละระดับความรุนแรง
    *   ตรวจสอบว่ามีการส่งค่า `level` ไปยัง Database ถูกต้อง ('error', 'warning', 'info')

*   `Data Formatting`: `**[extractErrorDetails](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#38)`
    *   ทดสอบการแปลง Object `Error` ให้เป็นข้อความที่อ่านรู้เรื่อง
    *   ตรวจสอบว่ามีการเก็บ Stack Trace เพื่อใช้ในการ Debug ภายหลัง

*   `Metadata Handling`: `**[logToDatabase](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#72)`
    *   ทดสอบการแนบข้อมูลเพิ่มเติม (Metadata) ไปกับ Log
    *   ตรวจสอบว่าข้อมูลเหล่านั้นถูกบันทึกลงใน Field `metadata` ของ Database ครบถ้วน

*   `Context Automation`: `**[getCurrentUserId](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#26)` / `**[generateRequestId](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#19)`
    *   ทดสอบว่าระบบพยายามดึง `user_id` ของผู้ใช้ปัจจุบันมาผูกกับ Log ให้อัตโนมัติ
    *   ทดสอบการสร้าง `request_id` อัตโนมัติหากไม่มีการระบุมา

*   `Environment Configuration`: `**[isErrorLoggingEnabled](file:///d:/Buzzly_Dev/BuzzlyDev/src/services/errorLogger.ts#4)`
    *   ทดสอบการตั้งค่าเปิด/ปิดระบบ Log ผ่าน `VITE_ENABLE_ERROR_LOGGING`
    *   ตรวจสอบว่าถ้าปิดการทำงาน (Disable) ระบบจะไม่ทำการยิง Request ไปหา Database

---

## คำสั่งสำหรับรัน Test

```bash
# รัน Test เฉพาะส่วนหน้าจอ Admin Support
npm run test:support

# รัน Test เฉพาะส่วนระบบ Error Logger
npm run test:logger

# รัน Test ทั้งหมด
npx vitest
```
