-- เพิ่มคอลัมน์ company_name ในตาราง workspaces เพื่อรองรับข้อมูลนิติบุคคล
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- หมายเหตุ: คอลัมน์นี้จะถูกใช้เก็บชื่อบริษัทจดทะเบียน (Legal Name) 
-- ของแต่ละ Workspace โดยแยกจากชื่อร้านค้า (Display Name)
