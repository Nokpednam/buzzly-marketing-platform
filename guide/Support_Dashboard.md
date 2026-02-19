# Support & Error Logs Documentation

เอกสารฉบับนี้อธิบายโครงสร้างและหน้าที่ของตาราง (Database Tables) ที่เกี่ยวข้องกับการแสดงผลในหน้า Support Dashboard (`/admin/support`)

## <u>error_logs</u>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บข้อมูล Error และ Exception ต่างๆ ที่เกิดขึ้นในระบบ ทั้งจาก Frontend และ Backend
&nbsp;&nbsp;&nbsp;&nbsp;ข้อมูลสำคัญ: `level` (Critical, Error, Warning, Info), `message`, `stack_trace`, `user_id` (FK), `metadata`, `created_at`
&nbsp;&nbsp;&nbsp;&nbsp;**หมายเหตุ (Exception):** คือเหตุการณ์ผิดปกติที่ทำให้โปรแกรมทำงานต่อไม่ได้ตามปกติ เช่น เชื่อมต่อฐานข้อมูลไม่ได้ (Connection Error) หรือการคำนวณผิดพลาด (Division by Zero) ซึ่งระบบจะบันทึกรายละเอียด (StackTrace) ไว้เพื่อให้ Developer เข้ามาแก้ไข

## <u>employees</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: (Manual Fetch) `error_logs.user_id` (FK) &rarr; `employees.user_id` (PK)<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: ระบุตัวตนผู้ใช้งานกรณีที่เป็น **พนักงาน** โดยดึง `email` และ `role` มาแสดงในรายชื่อ Log

## <u>customer</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: (Manual Fetch) `error_logs.user_id` (FK) &rarr; `customer.id` (PK)<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: ระบุตัวตนผู้ใช้งานกรณีที่เป็น **ลูกค้า** โดยดึง `email` มาแสดง (ระบบจะค้นหาในตาราง employees ก่อน ถ้าไม่เจอจะมาหาในตารางนี้)

## <u>role_employees</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: ผ่านตาราง `employees` (`employees.role_employees_id` (FK) &rarr; `role_employees.id` (PK))<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: แสดงชื่อตำแหน่งงาน (Role Name) ของพนักงานที่เจอปัญหา เช่น Admin, Developer

---

## <u>Functions (useAdminSupport.tsx)</u>

### `useAdminErrorLogs(levelFilter, page, pageSize, searchQuery)`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงรายการ Error Logs พร้อมระบบ Pagination และ Filter โดยมีกระบวนการทำงานดังนี้:
1.  **Filtering**: กรองตามระดับความรุนแรง (`level`) และค้นหาข้อความ (`searchQuery`) หรือ Request ID
2.  **Pagination (การแบ่งหน้า)**: เทคนิคการแบ่งข้อมูลที่มีจำนวนมากออกเป็นส่วนๆ (Pages) เพื่อไม่ให้โหลดมาทีเดียวทั้งหมด ช่วยให้ระบบทำงานเร็วขึ้นและประหยัดทรัพยากร (เช่น ดึงทีละ 10 รายการ)
3.  **User Enrichment**: นำ `user_id` ทั้งหมดในหน้าปัจจุบัน (ที่ผ่านการ Pagination แล้ว) ไปค้นหาข้อมูลผู้ใช้จากทั้งตาราง `employees` และ `customer` พร้อมกัน เพื่อระบุให้ได้ว่า Error นี้เกิดจากใคร (พนักงานหรือลูกค้า)
4.  **Result**: ส่งคืนรายการ Log ที่มีข้อมูลผู้ใช้ครบถ้วน (Email, Role)

### `useAdminLogStats()`
&nbsp;&nbsp;&nbsp;&nbsp;คำนวณสถิติภาพรวมของ Error ในระบบ โดยนับจำนวนแยกตามระดับความรุนแรง (Critical, Error, Warning, Info) เพื่อแสดงเป็น Cards สรุปสถานะสุขภาพของระบบที่ด้านบน Dashboard
