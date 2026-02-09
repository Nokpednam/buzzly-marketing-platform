# 📋 Setup Checklist สำหรับเพื่อนคุณ

สิ่งที่ต้องทำหลังจาก `git clone`:

## ✅ ขั้นตอนที่จำเป็น (Must Do)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Supabase**
   ```bash
   npx supabase start
   ```
   - จะใช้เวลาสักครู่ (ครั้งแรกดาวน์โหลด Docker images)
   - รอจนเห็น "Started supabase local development setup"

3. **สร้าง Owner Account**  
   ```bash
   ./setup-owner.sh
   ```
   หรือถ้าไม่ได้ให้รัน:
   ```bash
   chmod +x setup-owner.sh && ./setup-owner.sh
   ```

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
- เช็คว่ารัน `./setup-owner.sh` แล้วหรือยัง
- ลอง reset database:
  ```bash
  npx supabase db reset
  ./setup-owner.sh
  ```

---

## 📝 สรุป

**คำสั่งทั้งหมดลำดับเดียว:**
```bash
npm install
npx supabase start
./setup-owner.sh
npm run dev
```

เสร็จแล้วเปิด http://localhost:5173/admin/login ได้เลย!
