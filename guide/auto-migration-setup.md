# วิธีการทำให้ Migrations รันอัตโนมัติหลังจาก Git Pull

โปรเจกต์นี้มีระบบ Git hooks ที่จะรัน Supabase migrations โดยอัตโนมัติทุกครั้งที่คุณ pull โค้ดจาก repository

## 🚀 ติดตั้ง Git Hooks (ครั้งแรกเท่านั้น)

หลังจาก clone repository หรือ pull โปรเจกต์มาครั้งแรก ให้รันคำสั่ง:

```bash
bash scripts/setup-hooks.sh
```

คำสั่งนี้จะ:
- ติดตั้ง Git hooks ให้อัตโนมัติ
- ตั้งค่า Git ให้ใช้ `.githooks` directory
- ทำให้ hooks สามารถรันได้

## ✨ คุณสมบัติ

หลังจากติดตั้งแล้ว เมื่อคุณรัน `git pull` ระบบจะ:

1. **ตรวจสอบ migrations ใหม่** - ถ้ามีไฟล์ใหม่ใน `supabase/migrations`
2. **รัน migrations อัตโนมัติ** - ใช้คำสั่ง `npx supabase db push`
3. **ติดตั้ง dependencies** - ถ้า `package.json` เปลี่ยนแปลง จะรัน `npm install` ให้อัตโนมัติ

## 📝 ตอนทำงาน

เมื่อคุณ pull โค้ดใหม่:

```bash
git pull origin main
```

คุณจะเห็นข้อความแบบนี้:

```
🔍 Checking for new migrations...
✨ New migrations detected! Running migrations...
✅ Migrations completed successfully!
```

## 🔧 การรัน Migrations ด้วยตนเอง

หากต้องการรัน migrations ด้วยตนเอง:

```bash
npx supabase db push
```

## ⚙️ การตั้งค่าเพิ่มเติม

- **ดู hooks ที่ติดตั้งแล้ว**: ตรวจสอบไฟล์ใน `.githooks/` directory
- **แก้ไข hooks**: แก้ไขไฟล์ `.githooks/post-merge` แล้ว commit ลง Git
- **ปิดการใช้งานชั่วคราว**: ลบหรือเปลี่ยนชื่อไฟล์ `.githooks/post-merge`

## 🐛 Troubleshooting

หาก migrations ไม่รันอัตโนมัติ:

1. ตรวจสอบว่าได้รัน setup script แล้ว:
   ```bash
   git config core.hooksPath
   ```
   ควรจะแสดงผล: `.githooks`

2. ตรวจสอบว่า hook มี permission ในการรัน:
   ```bash
   ls -l .githooks/post-merge
   ```
   ควรจะเห็น `x` (executable permission)

3. รันอีกครั้ง:
   ```bash
   bash scripts/setup-hooks.sh
   ```

## 👥 สำหรับทีม

สมาชิกทุกคนในทีมต้องรัน setup script หลังจาก clone repository:

```bash
bash scripts/setup-hooks.sh
```

เพื่อให้ทุกคนได้ประโยชน์จากการรัน migrations อัตโนมัติ
