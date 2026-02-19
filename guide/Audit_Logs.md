# Audit Logs Documentation

เอกสารฉบับนี้อธิบายโครงสร้างและหน้าที่ของตาราง (Database Tables) ที่เกี่ยวข้องกับการแสดงผลในหน้า Audit Logs (`/admin/audit-logs`)

## <u>audit_logs_enhanced</u>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บข้อมูลกิจกรรมหลักทั้งหมดที่เกิดขึ้นในระบบ (Who, What, Where, When)
&nbsp;&nbsp;&nbsp;&nbsp;ข้อมูลสำคัญ: `user_id`, `action_type_id`, `description`, `status`, `ip_address`, `metadata`, `created_at`
&nbsp;&nbsp;&nbsp;&nbsp;**หมายเหตุ:** ตารางนี้รองรับการเก็บ Log ของผู้ใช้ทุกประเภท (ทั้ง Employee และ Customer) ผ่าน `user_id` แต่การแสดงผลชื่อ/Role ในหน้า Admin จะเน้นเชื่อมโยงกับ `employees` เป็นหลักในปัจจุบัน

## <u>action_type</u> (Lookup Table)
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: `audit_logs_enhanced.action_type_id` &rarr; `action_type.id`<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: เก็บชื่อมาตรฐานของการกระทำ (Action Name) เช่น `login`, `logout`, `export_data` เพื่อลดความซ้ำซ้อนและให้แก้ไขชื่อได้ง่ายในจุดเดียว

## <u>employees</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: (Manual Fetch) `audit_logs_enhanced.user_id` &rarr; `employees.user_id`<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: ดึงข้อมูลพนักงานที่ทำรายการนั้นๆ (`email`) มาแสดงในตาราง Log เพื่อระบุตัวตนผู้ใช้งาน
&nbsp;&nbsp;&nbsp;&nbsp;**ข้อจำกัดปัจจุบัน:** ระบบจะดึงข้อมูลผู้ใช้จากตาราง `employees` เท่านั้น หากเป็น Log ของ **ลูกค้า (Customers)** ระบบจะพยายามดึงข้อมูลจาก `metadata` แทน หรือแสดงเป็น "Unknown" หากไม่มีข้อมูลใน metadata

## <u>role_employees</u>
&nbsp;&nbsp;&nbsp;&nbsp;JOIN: ผ่านตาราง `employees` (`employees.role_employees_id` &rarr; `role_employees.id`<br>
&nbsp;&nbsp;&nbsp;&nbsp;เพื่อ: ดึงชื่อตำแหน่ง (`role_name`) ของพนักงานที่ทำรายการ เช่น Admin, Manager เพื่อแสดงระดับสิทธิ์ของผู้ใช้งานในขณะนั้น

---

## <u>Functions (useAuditLogs.tsx)</u>

### `useAuditLogs(category)`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงรายการ Audit Logs ล่าสุด 200 รายการ โดยสามารถกรองตามหมวดหมู่ (`category`) ได้ ซึ่งระบบจะทำการ Map หมวดหมู่จาก UI ไปยังกลุ่มของหมวดหมู่ในฐานข้อมูล (เช่นเลือก 'Authentication' จะค้นหาทั้ง 'authentication', 'auth', 'login') พร้อมฟังก์ชันการระบุตัวตนผู้ใช้งานดังนี้:
1.  นำ `user_id` ไปค้นหาในตาราง `employees` เพื่อดึง Email และ Role
2.  หากไม่พบใน `employees` จะนำ `user_id` ไปค้นหาในตาราง `customer`
3.  หากยังไม่พบอีก จะพยายามดึงข้อมูลจาก `metadata` ใน Log record นั้นๆ แทน
4.  หากไม่พบข้อมูลทั้งหมด จะแสดงผลเป็น "Unknown"

### `useAuditLogStats()`
&nbsp;&nbsp;&nbsp;&nbsp;ดึงข้อมูล Audit Logs 1,000 รายการล่าสุดมาคำนวณสถิติภาพรวม เช่น จำนวนการล็อกอินสำเร็จ/ล้มเหลว, การ Export ข้อมูล, และการแก้ไขตั้งค่าความปลอดภัย เพื่อแสดงเป็น Cards สรุปด้านบนสุดของหน้า
