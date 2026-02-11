-- สั่งลบ Trigger ตัวปัญหา (ที่มักจะชื่อนี้) ออกไปก่อน
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- (แถม) ลบฟังก์ชันของมันด้วย
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();