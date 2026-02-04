import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Employee {
  id: string;
  email: string;
  user_id: string | null;
  role_employees_id: string | null;
  status: string | null;
  approval_status: string | null;
  is_locked: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  // Profile data (from employees_profile table)
  profile?: {
    id?: string;
    first_name: string | null;
    last_name: string | null;
    profile_img: string | null;
    aptitude: string | null;
    last_active: string | null;
  };
  // Role data (from role_employees table - uses role_name, not name)
  role?: {
    id?: string;
    role_name: string | null;
    description: string | null;
  };
}

export interface EmployeeInsert {
  email: string;
  first_name?: string;
  last_name?: string;
  role_employees_id?: string;
  aptitude?: string;
}

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (employeesError) throw employeesError;

      // Fetch employee profiles
      const employeeIds = employeesData?.map(e => e.id) || [];
      const { data: profiles } = await supabase
        .from("employees_profile")
        .select("*")
        .in("employees_id", employeeIds);

      // Fetch roles
      const roleIds = [...new Set(employeesData?.map(e => e.role_employees_id).filter(Boolean) as string[])];
      const { data: roles } = await supabase
        .from("role_employees")
        .select("*")
        .in("id", roleIds);

      const profileMap = new Map(profiles?.map(p => [p.employees_id, {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        profile_img: p.profile_img,
        aptitude: p.aptitude,
        last_active: p.last_active,
      }]) || []);
      const roleMap = new Map(roles?.map(r => [r.id, {
        id: r.id,
        role_name: r.role_name,
        description: r.description,
      }]) || []);

      return employeesData.map(emp => ({
        id: emp.id,
        email: emp.email,
        user_id: emp.user_id,
        role_employees_id: emp.role_employees_id,
        status: emp.status,
        approval_status: emp.approval_status,
        is_locked: emp.is_locked,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        profile: profileMap.get(emp.id),
        role: emp.role_employees_id ? roleMap.get(emp.role_employees_id) : undefined,
      })) as Employee[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["employee-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_employees")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (newEmployee: EmployeeInsert) => {
      // Create employee record
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .insert({
          email: newEmployee.email,
          role_employees_id: newEmployee.role_employees_id,
          status: "active",
          approval_status: "pending",
        })
        .select()
        .single();

      if (empError) throw empError;

      // Create employee profile
      const { error: profileError } = await supabase
        .from("employees_profile")
        .insert({
          employees_id: employee.id,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          aptitude: newEmployee.aptitude,
          role_employees_id: newEmployee.role_employees_id,
        });

      if (profileError) throw profileError;

      return employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("เพิ่มพนักงานสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถเพิ่มพนักงาน: ${error.message}`);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ 
      id, 
      profileId,
      updates 
    }: { 
      id: string; 
      profileId?: string;
      updates: Partial<EmployeeInsert> & { status?: string; is_locked?: boolean } 
    }) => {
      // Update employee record if needed
      if (updates.role_employees_id || updates.status !== undefined || updates.is_locked !== undefined) {
        const { error: empError } = await supabase
          .from("employees")
          .update({
            role_employees_id: updates.role_employees_id,
            status: updates.status,
            is_locked: updates.is_locked,
          })
          .eq("id", id);

        if (empError) throw empError;
      }

      // Update employee profile if needed
      if (profileId && (updates.first_name || updates.last_name || updates.aptitude)) {
        const { error: profileError } = await supabase
          .from("employees_profile")
          .update({
            first_name: updates.first_name,
            last_name: updates.last_name,
            aptitude: updates.aptitude,
            role_employees_id: updates.role_employees_id,
          })
          .eq("id", profileId);

        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("อัปเดตข้อมูลพนักงานสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตพนักงาน: ${error.message}`);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      // Delete profile first
      await supabase
        .from("employees_profile")
        .delete()
        .eq("employees_id", id);

      // Delete employee
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("ลบพนักงานสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบพนักงาน: ${error.message}`);
    },
  });

  const suspendEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .update({ status: "suspended" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("ระงับพนักงานสำเร็จ");
    },
  });

  const reactivateEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("เปิดใช้งานพนักงานอีกครั้ง");
    },
  });

  return {
    employees,
    roles,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    suspendEmployee,
    reactivateEmployee,
  };
}
