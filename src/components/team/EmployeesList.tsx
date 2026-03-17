import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Shield,
  UserX,
  UserCheck,
  Loader2,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useEmployees, Employee as EmployeeData, EmployeeInsert } from "@/hooks/useEmployees";

const departments = ["การตลาด", "ขาย", "บัญชี", "IT", "HR", "ปฏิบัติการ"];

interface EmployeesListProps {
  canManage: boolean;
}

export function EmployeesList({ canManage }: EmployeesListProps) {
  const {
    employees,
    roles,
    isLoading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    suspendEmployee,
    reactivateEmployee,
    approveEmployee,
    rejectEmployee,
  } = useEmployees();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  const [formData, setFormData] = useState<EmployeeInsert & { department?: string }>({
    email: "",
    first_name: "",
    last_name: "",
    role_employees_id: "",
    aptitude: "",
  });

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      role_employees_id: "",
      aptitude: "",
    });
  };

  const handleAddEmployee = async () => {
    // Bug #L1-4 Fix: Email validation
    if (!formData.email.trim()) {
      toast.error("กรุณาใส่อีเมล");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    // Bug #L1-5 Fix: Name validation
    if (!formData.first_name?.trim() && !formData.last_name?.trim()) {
      toast.error("กรุณาใส่ชื่อหรือนามสกุลอย่างน้อย 1 อย่าง");
      return;
    }

    await createEmployee.mutateAsync(formData);
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;
    await updateEmployee.mutateAsync({
      id: selectedEmployee.id,
      profileId: selectedEmployee.profile?.id,
      updates: {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_employees_id: formData.role_employees_id,
        aptitude: formData.aptitude,
      },
    });
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    resetForm();
  };

  const handleSuspend = async (id: string) => {
    // Bug #L1-2 Fix: Add confirmation
    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะระงับพนักงานนี้?\n\nพนักงานจะไม่สามารถเข้าใช้งานระบบได้ชั่วคราว"
    );

    if (!confirmed) return;

    await suspendEmployee.mutateAsync(id);
  };

  const handleReactivate = async (id: string) => {
    await reactivateEmployee.mutateAsync(id);
  };

  const handleApprove = async (id: string) => {
    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะอนุมัติพนักงานนี้?"
    );
    if (!confirmed) return;

    await approveEmployee.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะปฏิเสธพนักงานนี้?\n\nพนักงานจะไม่สามารถเข้าใช้งานได้"
    );
    if (!confirmed) return;

    await rejectEmployee.mutateAsync(id);
  };

  const handleRemove = async (id: string) => {
    // Bug #L1-1 Fix: Add confirmation
    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะลบพนักงานนี้?\n\nการลบจะลบข้อมูลทั้งหมดรวมถึงโปรไฟล์"
    );

    if (!confirmed) return;

    await deleteEmployee.mutateAsync(id);
  };

  const openEditDialog = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setFormData({
      email: employee.email,
      first_name: employee.profile?.first_name || "",
      last_name: employee.profile?.last_name || "",
      role_employees_id: employee.role_employees_id || "",
      aptitude: employee.profile?.aptitude || "",
    });
    setEditDialogOpen(true);
  };

  const getStatusBadge = (employee: EmployeeData) => {
    const status = employee.status;
    const isSignedUp = !!employee.user_id;

    switch (status) {
      case "active":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ใช้งาน</Badge>;
      case "inactive":
        if (!isSignedUp) {
          return <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-500 bg-slate-800/20">ยังไม่สมัคร</Badge>;
        }
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">รอเปิดใช้งาน</Badge>;
      case "suspended":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">ระงับ</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-500">ไม่ระบุ</Badge>;
    }
  };

  const getApprovalBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">อนุมัติแล้ว</Badge>;
      case "pending":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">รออนุมัติ</Badge>;
      case "rejected":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-500">-</Badge>;
    }
  };

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {canManage && (
        <div className="flex justify-end p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4">
            <Plus className="h-4 w-4" />
            เพิ่มพนักงาน
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/20 border-b border-slate-800 hover:bg-slate-900/20">
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">พนักงาน</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">บทบาท</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">ตำแหน่ง/ความถนัด</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">สถานะ</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">สถานะการอนุมัติ</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">เข้าใช้งานล่าสุด</TableHead>
              {canManage && <TableHead className="w-[80px] text-right pr-6 py-4"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีพนักงานในระบบ
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-800">
                        <AvatarImage src={employee.profile?.profile_img || undefined} />
                        <AvatarFallback className="bg-slate-800 text-slate-300 text-sm">
                          {getInitials(employee.profile?.first_name, employee.profile?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-white text-sm">
                          {employee.profile?.first_name || ""} {employee.profile?.last_name || ""}
                          {!employee.profile?.first_name && !employee.profile?.last_name && employee.email}
                        </p>
                        {(employee.profile?.first_name || employee.profile?.last_name) && (
                          <p className="text-xs text-slate-500 font-medium">{employee.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {employee.role?.role_name || "ไม่ระบุ"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      {employee.profile?.aptitude || "ไม่ระบุ"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">{getStatusBadge(employee)}</TableCell>
                  <TableCell className="py-4">{getApprovalBadge(employee.approval_status)}</TableCell>
                  <TableCell className="py-4">
                    {employee.profile?.last_active ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {formatDistanceToNow(new Date(employee.profile.last_active), { 
                            addSuffix: true,
                            locale: th 
                          })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium pl-4.5">
                          {new Date(employee.profile.last_active).toLocaleString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 italic text-xs">-</span>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right pr-6 py-4">
                      {employee.role?.role_name?.toLowerCase() !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300 shadow-2xl">
                            <DropdownMenuItem onClick={() => openEditDialog(employee)} className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer transition-colors px-3 py-2">
                              <Pencil className="h-4 w-4 mr-3 text-blue-400" />
                              แก้ไขข้อมูล
                            </DropdownMenuItem>

                            {/* Approval Actions - Only for pending employees */}
                            {employee.approval_status === "pending" && (
                              <>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem
                                  className="text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors px-3 py-2"
                                  onClick={() => handleApprove(employee.id)}
                                  disabled={approveEmployee.isPending}
                                >
                                  {approveEmployee.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-3" />
                                  )}
                                  อนุมัติพนักงาน
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer transition-colors px-3 py-2"
                                  onClick={() => handleReject(employee.id)}
                                  disabled={rejectEmployee.isPending}
                                >
                                  {rejectEmployee.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-3" />
                                  )}
                                  ปฏิเสธพนักงาน
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator className="bg-slate-800" />
                            {employee.status === "active" ? (
                              <DropdownMenuItem
                                className="text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer transition-colors px-3 py-2"
                                onClick={() => handleSuspend(employee.id)}
                                disabled={suspendEmployee.isPending}
                              >
                                {suspendEmployee.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4 mr-3" />
                                )}
                                ระงับการใช้งาน
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors px-3 py-2"
                                onClick={() => handleReactivate(employee.id)}
                                disabled={reactivateEmployee.isPending}
                              >
                                {reactivateEmployee.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4 mr-3" />
                                )}
                                เปิดใช้งานอีกครั้ง
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem
                              className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer transition-colors px-3 py-2"
                              onClick={() => handleRemove(employee.id)}
                              disabled={deleteEmployee.isPending}
                            >
                              {deleteEmployee.isPending ? (
                                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-3" />
                              )}
                              ลบพนักงาน
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">เพิ่มพนักงานใหม่</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              กรอกข้อมูลพนักงานที่ต้องการเพิ่มเข้าระบบ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ชื่อ</Label>
                <Input
                  id="firstName"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="ชื่อจริง"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">นามสกุล</Label>
                <Input
                  id="lastName"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="นามสกุล"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">อีเมล (ใช้สำหรับเชื่อมต่อบัญชีตอนสมัคร)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="employee@buzzly.co"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">บทบาท</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_employees_id: value })
                }
              >
                <SelectTrigger className="bg-black/20 border-slate-800 text-slate-300 h-10">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  {roles
                    .filter((role) => role.role_name?.toLowerCase() !== "owner")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id} className="hover:bg-slate-800 focus:bg-slate-800 transition-colors">
                        {role.role_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aptitude" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ความถนัด/ตำแหน่ง</Label>
              <Input
                id="aptitude"
                value={formData.aptitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aptitude: e.target.value })
                }
                placeholder="เช่น Marketing, Sales, Developer"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-900/50 p-6 -m-6 border-t border-slate-800 mt-6 rounded-b-xl">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
              ยกเลิก
            </Button>
            <Button onClick={handleAddEmployee} disabled={createEmployee.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {createEmployee.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              เพิ่มพนักงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">แก้ไขข้อมูลพนักงาน</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              แก้ไขข้อมูลของ {selectedEmployee?.profile?.first_name} {selectedEmployee?.profile?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ชื่อ</Label>
                <Input
                  id="edit-firstName"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">นามสกุล</Label>
                <Input
                  id="edit-lastName"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">อีเมล (ใช้สำหรับเชื่อมต่อบัญชีตอนสมัคร)</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="employee@example.com"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">บทบาท</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_employees_id: value })
                }
              >
                <SelectTrigger className="bg-black/20 border-slate-800 text-slate-300 h-10">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  {roles
                    .filter((role) => role.role_name?.toLowerCase() !== "owner")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id} className="hover:bg-slate-800 focus:bg-slate-800 transition-colors">
                        {role.role_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aptitude" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ความถนัด/ตำแหน่ง</Label>
              <Input
                id="edit-aptitude"
                value={formData.aptitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aptitude: e.target.value })
                }
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-900/50 p-6 -m-6 border-t border-slate-800 mt-6 rounded-b-xl">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
              ยกเลิก
            </Button>
            <Button onClick={handleEditEmployee} disabled={updateEmployee.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {updateEmployee.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
