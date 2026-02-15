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
  MoreVertical,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Plus,
  Building2,
  Briefcase,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">ใช้งาน</Badge>;
      case "suspended":
        return <Badge variant="destructive">ระงับ</Badge>;
      default:
        return <Badge variant="secondary">ไม่ระบุ</Badge>;
    }
  };

  const getApprovalBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">อนุมัติแล้ว</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">รออนุมัติ</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
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
        <div className="flex justify-end p-4 border-b">
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มพนักงาน
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>พนักงาน</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>ตำแหน่ง/ความถนัด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สถานะการอนุมัติ</TableHead>
              <TableHead>เข้าใช้งานล่าสุด</TableHead>
              {canManage && <TableHead className="w-[50px]"></TableHead>}
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
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={employee.profile?.profile_img || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(employee.profile?.first_name, employee.profile?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {employee.profile?.first_name || ""} {employee.profile?.last_name || ""}
                          {!employee.profile?.first_name && !employee.profile?.last_name && employee.email}
                        </p>
                        {(employee.profile?.first_name || employee.profile?.last_name) && (
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {employee.role?.role_name || "ไม่ระบุ"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {employee.profile?.aptitude || "ไม่ระบุ"}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{getApprovalBadge(employee.approval_status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {employee.profile?.last_active
                      ? new Date(employee.profile.last_active).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : "-"}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            แก้ไขข้อมูล
                          </DropdownMenuItem>

                          {/* Approval Actions - Only for pending employees */}
                          {employee.approval_status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-success"
                                onClick={() => handleApprove(employee.id)}
                                disabled={approveEmployee.isPending}
                              >
                                {approveEmployee.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                อนุมัติพนักงาน
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleReject(employee.id)}
                                disabled={rejectEmployee.isPending}
                              >
                                {rejectEmployee.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-2" />
                                )}
                                ปฏิเสธพนักงาน
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />
                          {employee.status === "active" ? (
                            <DropdownMenuItem
                              className="text-warning"
                              onClick={() => handleSuspend(employee.id)}
                              disabled={suspendEmployee.isPending}
                            >
                              {suspendEmployee.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <UserX className="h-4 w-4 mr-2" />
                              )}
                              ระงับการใช้งาน
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-success"
                              onClick={() => handleReactivate(employee.id)}
                              disabled={reactivateEmployee.isPending}
                            >
                              {reactivateEmployee.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <UserCheck className="h-4 w-4 mr-2" />
                              )}
                              เปิดใช้งานอีกครั้ง
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemove(employee.id)}
                            disabled={deleteEmployee.isPending}
                          >
                            {deleteEmployee.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            ลบพนักงาน
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลพนักงานที่ต้องการเพิ่มเข้าระบบ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input
                  id="firstName"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="ชื่อจริง"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="นามสกุล"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="employee@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">บทบาท</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_employees_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aptitude">ความถนัด/ตำแหน่ง</Label>
              <Input
                id="aptitude"
                value={formData.aptitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aptitude: e.target.value })
                }
                placeholder="เช่น Marketing, Sales, Developer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddEmployee} disabled={createEmployee.isPending}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของ {selectedEmployee?.profile?.first_name} {selectedEmployee?.profile?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">ชื่อ</Label>
                <Input
                  id="edit-firstName"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">นามสกุล</Label>
                <Input
                  id="edit-lastName"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">บทบาท</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_employees_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aptitude">ความถนัด/ตำแหน่ง</Label>
              <Input
                id="edit-aptitude"
                value={formData.aptitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aptitude: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEditEmployee} disabled={updateEmployee.isPending}>
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
