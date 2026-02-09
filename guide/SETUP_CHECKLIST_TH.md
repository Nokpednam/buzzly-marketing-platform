# 📋 Setup Checklist สำหรับเพื่อนคุณ

สิ่งที่ต้องทำหลังจาก `git clone`:

## ✅ ขั้นตอนที่จำเป็น (Must Do)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **รัน First-Time Setup** (ครั้งแรกเท่านั้น)
   ```bash
   ./setup-first-step.sh
   ```
   หรือถ้าไม่ได้ให้รัน:
   ```bash
   chmod +x setup-first-step.sh && ./setup-first-step.sh
   ```
   
   สคริปต์นี้จะ:
   - ✅ Start Supabase (ถ้ายังไม่ได้เปิด)
   - ✅ Reset database และรัน migrations ทั้งหมด
   - ✅ สร้าง Owner Account อัตโนมัติ

4. **Start Dev Server**
   ```bash
   npm run dev
   ```

5. **Login!**
   - URL: http://localhost:5173/admin/login
   - Email: hachikonoluna@gmail.com
   - Password: owner123

---

## 🔧 ขั้นตอนเสริม (Optional)

### ถ้าต้องการข้อมูลตัวอย่าง
```bash
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)
cat sample-data/sample-data.sql | docker exec -i $DB_CONTAINER psql -U postgres -d postgres
```

### ถ้า .env หาย
```bash
cp .env.example .env
```
(แต่ตามปกติ Supabase จะสร้างให้อัตโนมัติ)

---

## 🐛 Troubleshooting

### "Cannot find Supabase container"
```bash
npx supabase start
```

### "Port already in use"
```bash
npx supabase stop
npx supabase start
```

### "Login returns 500 error"
- เช็คว่ารัน `./setup-first-step.sh` แล้วหรือยัง
- ลอง reset database:
  ```bash
  ./setup-first-step.sh
  ```

---

## 📝 สรุป

**คำสั่งทั้งหมดลำดับเดียว (ครั้งแรก):**
```bash
npm install
./setup-first-step.sh
npm run dev
```

**คำสั่งสำหรับรันครั้งถัดไป:**
```bash
npx supabase start
npm run dev
```

เสร็จแล้วเปิด http://localhost:5173/admin/login ได้เลย!
