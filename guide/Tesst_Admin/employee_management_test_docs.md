# Employee Management Test Documentation

เอกสารนี้อธิบายวิธีการทดสอบระบบจัดการพนักงาน (Employee Management) ในหน้า `/admin/employees`

## 1. Overview
เราได้ทำการเขียน **Unit Tests** สำหรับทั้ง **Hooks** และ **Components** เพื่อครอบคลุมฟีเจอร์หลักๆ ดังนี้:
- **Data Fetching**: การดึงข้อมูลพนักงาน (Employees) และตำแหน่ง (Roles) พร้อม Profile
- **CRUD Operations**: เพิ่ม (Create), แก้ไข (Update), ลบ (Delete) พนักงาน
- **Status Management**: ระงับการใช้งาน (Suspend), เปิดใช้งาน (Reactivate)
- **Approvals**: อนุมัติ (Approve), ปฏิเสธ (Reject) พนักงานใหม่
- **Validation**: ตรวจสอบข้อมูลก่อนบันทึก (อีเมล, ชื่อ, นามสกุล)

## 2. Test Locations
| Component / Hook | Test File | Description |
|------------------|-----------|-------------|
| `useEmployees` (Approval) | `src/hooks/__tests__/useEmployees_approval.test.tsx` | ทดสอบ Flow การอนุมัติและปฏิเสธ พร้อม Audit Logs |
| `useEmployees` (Operations) | `src/hooks/__tests__/useEmployees.test.tsx` | (Existing) ทดสอบ CRUD พื้นฐานและ Data Fetching |
| `EmployeesList` | `src/components/team/__tests__/EmployeesList.test.tsx` | ทดสอบการแสดงผลหน้า UI, Dialogs, และการโต้ตอบกับปุ่ม Action ต่างๆ |

## 3. How to Run Tests
สามารถรันคำสั่งต่อไปนี้เพื่อทดสอบเฉพาะส่วน Employee Management:

```bash
npm run test:employee
```

หรือรันทั้งหมด (รวม Audit Logs และอื่นๆ):
```bash
npm run test:monitor
# OR manual command:
npx vitest run
```

## 4. Test Scenarios Covered
### Hook: `useEmployees_approval`
- **Approve Employee**: ตรวจสอบว่าเรียก API update status เป็น `approved` และบันทึก Audit Log ถูกต้อง
- **Reject Employee**: ตรวจสอบว่าเรียก API update status และบันทึก Audit Log ถูกต้อง

### Component: `EmployeesList`
- **Loading State**: แสดงสถานะกำลังโหลด
- **Empty State**: แสดงข้อความเมื่อไม่มีพนักงาน
- **List Rendering**: แสดงข้อมูลพนักงาน (ชื่อ, ตำแหน่ง, สถานะ) ถูกต้อง
- **Add Employee**:
  - เปิด Dialog เพิ่มพนักงาน
  - Validate ข้อมูล (ไม่ให้บันทึกถ้าข้อมูลไม่ครบ)
  - เรียก `createEmployee` เมื่อข้อมูลถูกต้อง (By-pass role selection test due to UI lib limitation)
- **Actions**:
  - **Approve**: คลิกปุ่มอนุมัติแล้วเรียก `approveEmployee`
  - **Suspend**: คลิกปุ่มระงับแล้วเรียก `suspendEmployee`
  - **Reactivate**: คลิกปุ่มเปิดใช้งานแล้วเรียก `reactivateEmployee`
  - **Delete**: คลิกปุ่มลบแล้วเรียก `deleteEmployee`

## 5. Notes
- **Sonner Mock**: มีการ Mock `sonner` (Toast notification) เพื่อป้องกัน error ระหว่างทดสอบ
- **Radix UI Select**: การทดสอบเลือก Role ใน Dropdown มีข้อจำกัดใน JSDOM จึงทำการข้าม (Skip) ในบาง Test case แต่ Logic หลักยังถูกทดสอบผ่าน Mutation calls
