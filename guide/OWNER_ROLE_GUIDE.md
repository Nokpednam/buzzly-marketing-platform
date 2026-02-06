-- รันอันนี้ก่อน 1 รอบ
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);


DO $$
DECLARE
    target_email TEXT := 'hachikonoluna@gmail.com'; -- <<< ใส่อีเมลตรงนี้
    target_user_id UUID;
BEGIN
    -- 1. หา User ID
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    -- เช็คว่าเจอ User ไหม
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '❌ ไม่พบผู้ใช้ email: %', target_email;
    END IF;

    -- 2. เช็คว่ามี Role อยู่แล้วหรือยัง
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id) THEN
        -- กรณีมีอยู่แล้ว -> อัปเดตเป็น owner
        UPDATE public.user_roles 
        SET role = 'owner' 
        WHERE user_id = target_user_id;
        RAISE NOTICE '✅ อัปเดตผู้ใช้ % เป็น OWNER เรียบร้อยแล้ว', target_email;
    ELSE
        -- กรณีไม่มี -> เพิ่มใหม่
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'owner');
        RAISE NOTICE '✅ เพิ่มสิทธิ์ OWNER ให้ผู้ใช้ % เรียบร้อยแล้ว', target_email;
    END IF;

END $$;