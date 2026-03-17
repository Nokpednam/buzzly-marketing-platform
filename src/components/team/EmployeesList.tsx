import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  UserX,
  UserCheck,
  Loader2,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  UserMinus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useEmployees, Employee as EmployeeData, EmployeeInsert } from "@/hooks/useEmployees";

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

  // Control bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [unifiedStatusFilter, setUnifiedStatusFilter] = useState("all");

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

  // --- Summary stats ---
  const totalEmployees = employees.length;
  const pendingApprovals = employees.filter((e) => e.approval_status === "pending").length;
  const activeEmployees = employees.filter((e) => e.status === "active" && e.approval_status === "approved").length;
  const notSignedUpEmployees = employees.filter((e) => e.approval_status === "approved" && !e.user_id).length;

  // --- Filtered employees ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.profile?.first_name ?? ""} ${emp.profile?.last_name ?? ""}`.toLowerCase();
      const email = emp.email?.toLowerCase() ?? "";
      const query = searchQuery.toLowerCase();

      const matchesSearch = !query || fullName.includes(query) || email.includes(query);

      const matchesRole =
        roleFilter === "all" ||
        emp.role?.role_name?.toLowerCase() === roleFilter.toLowerCase();

      let matchesStatus = true;
      if (unifiedStatusFilter === "active") {
        matchesStatus = emp.approval_status === "approved" && emp.status === "active";
      } else if (unifiedStatusFilter === "not_signed_up") {
        matchesStatus = emp.approval_status === "approved" && !emp.user_id;
      } else if (unifiedStatusFilter === "pending") {
        matchesStatus = emp.approval_status === "pending";
      } else if (unifiedStatusFilter === "suspended") {
        matchesStatus = emp.status === "suspended";
      } else if (unifiedStatusFilter === "rejected") {
        matchesStatus = emp.approval_status === "rejected";
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, roleFilter, unifiedStatusFilter]);

  // --- Handlers ---
  const handleAddEmployee = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
      return;
    }
    if (!formData.first_name?.trim() && !formData.last_name?.trim()) {
      toast.error("Please enter at least first or last name");
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
    const confirmed = window.confirm(
      "Are you sure you want to suspend this employee?\n\nThe employee will temporarily lose access to the system."
    );
    if (!confirmed) return;
    await suspendEmployee.mutateAsync(id);
  };

  const handleReactivate = async (id: string) => {
    await reactivateEmployee.mutateAsync(id);
  };

  const handleApprove = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to approve this employee?");
    if (!confirmed) return;
    await approveEmployee.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this employee?\n\nThe employee will not be able to access the system."
    );
    if (!confirmed) return;
    await rejectEmployee.mutateAsync(id);
  };

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?\n\nDeletion will remove all data including profile."
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

  // --- Badges ---
  const getStatusBadge = (employee: EmployeeData) => {
    const status = employee.status;
    const isSignedUp = !!employee.user_id;
    switch (status) {
      case "active":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</Badge>;
      case "inactive":
        if (!isSignedUp) {
          return <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-500 bg-slate-800/20">Not signed up</Badge>;
        }
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending activation</Badge>;
      case "suspended":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Suspended</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-500">Unspecified</Badge>;
    }
  };

  const getApprovalBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</Badge>;
      case "pending":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending approval</Badge>;
      case "rejected":
        return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</Badge>;
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

  // Unique role names for filter dropdown
  const uniqueRoles = Array.from(
    new Set(employees.map((e) => e.role?.role_name).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-4 dev-autofill-fix">
      {/* Decoy fields to consume browser autofill */}
      <div className="sr-only" aria-hidden="true">
        <input type="text" name="email" tabIndex={-1} />
        <input type="password" name="password" tabIndex={-1} />
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalEmployees}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className={`bg-slate-900/50 border rounded-xl p-5 flex items-center gap-4 shadow-lg transition-colors ${pendingApprovals > 0 ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800"}`}>
          <div className={`flex items-center justify-center h-11 w-11 rounded-lg shrink-0 ${pendingApprovals > 0 ? "bg-amber-500/15 border border-amber-500/25" : "bg-slate-800/60 border border-slate-700/40"}`}>
            <AlertTriangle className={`h-5 w-5 ${pendingApprovals > 0 ? "text-amber-400" : "text-slate-500"}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest ${pendingApprovals > 0 ? "text-amber-500/70" : "text-slate-500"}`}>Pending</p>
            <p className={`text-2xl font-bold mt-0.5 ${pendingApprovals > 0 ? "text-amber-400" : "text-white"}`}>{pendingApprovals}</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active</p>
            <p className="text-2xl font-bold text-white mt-0.5">{activeEmployees}</p>
          </div>
        </div>

        {/* Not Signed Up */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-slate-700/30 border border-slate-700/40 shrink-0">
            <UserMinus className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Not Signed Up</p>
            <p className="text-2xl font-bold text-white mt-0.5">{notSignedUpEmployees}</p>
          </div>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
        {/* Left: Search + Filters */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <Input
              id="employee-search-field"
              name="buzzly-search-query-field"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="new-password"
              className="pl-9 bg-black/20 border-slate-700 text-slate-200 placeholder-slate-600 focus-visible:ring-slate-700 h-9 text-sm"
            />
          </div>

          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="bg-black/20 border-slate-700 text-slate-300 h-9 text-sm w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
              <SelectItem value="all" className="hover:bg-slate-800 focus:bg-slate-800">All Roles</SelectItem>
              {uniqueRoles.map((name) => (
                <SelectItem key={name} value={name} className="hover:bg-slate-800 focus:bg-slate-800">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Unified Status Filter */}
          <Select value={unifiedStatusFilter} onValueChange={setUnifiedStatusFilter}>
            <SelectTrigger className="bg-black/20 border-slate-700 text-slate-300 h-9 text-sm w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
              <SelectItem value="all" className="hover:bg-slate-800 focus:bg-slate-800">All Statuses</SelectItem>
              <SelectItem value="active" className="hover:bg-slate-800 focus:bg-slate-800">Active</SelectItem>
              <SelectItem value="not_signed_up" className="hover:bg-slate-800 focus:bg-slate-800">Not signed up</SelectItem>
              <SelectItem value="pending" className="hover:bg-slate-800 focus:bg-slate-800">Pending</SelectItem>
              <SelectItem value="suspended" className="hover:bg-slate-800 focus:bg-slate-800">Suspended</SelectItem>
              <SelectItem value="rejected" className="hover:bg-slate-800 focus:bg-slate-800">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Add Employee */}
        {canManage && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9 text-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/20 border-b border-slate-800 hover:bg-slate-900/20">
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Employee</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Role</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Position/Skill</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Status</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Approval Status</TableHead>
              <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4">Last Active</TableHead>
              {canManage && (
                <TableHead className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider py-4 text-right pr-5">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="text-center py-10 text-slate-500">
                  {employees.length === 0 ? "No employees in the system yet." : "No employees match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                  {/* Employee */}
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

                  {/* Role */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {employee.role?.role_name || "Unspecified"}
                    </div>
                  </TableCell>

                  {/* Position/Skill */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      {employee.profile?.aptitude || "Unspecified"}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">{getStatusBadge(employee)}</TableCell>

                  {/* Approval Status */}
                  <TableCell className="py-4">{getApprovalBadge(employee.approval_status)}</TableCell>

                  {/* Last Active */}
                  <TableCell className="py-4">
                    {employee.profile?.last_active ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {formatDistanceToNow(new Date(employee.profile.last_active), {
                            addSuffix: true,
                            locale: enUS,
                          })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium pl-4.5">
                          {new Date(employee.profile.last_active).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 italic text-xs">-</span>
                    )}
                  </TableCell>

                  {/* ── ACTIONS column ── */}
                  {canManage && (
                    <TableCell className="text-right pr-5 py-4">
                      {employee.role?.role_name?.toLowerCase() !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300 shadow-2xl min-w-[140px]">
                            {employee.approval_status === "pending" ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(employee.id)}
                                  className="text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors px-3 py-2"
                                  disabled={approveEmployee.isPending}
                                >
                                  {approveEmployee.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-3" />
                                  )}
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(employee.id)}
                                  className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer transition-colors px-3 py-2"
                                  disabled={rejectEmployee.isPending}
                                >
                                  {rejectEmployee.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-3" />
                                  )}
                                  Reject
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(employee)}
                                  className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer transition-colors px-3 py-2"
                                >
                                  <Pencil className="h-4 w-4 mr-3 text-blue-400" />
                                  Edit Details
                                </DropdownMenuItem>

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
                                    Suspend
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
                                    Reactivate
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
                                  Delete Employee
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* ── Add Employee Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-xl sm:max-w-[500px] dev-autofill-fix">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">Add New Employee</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Enter employee details to add to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.first_name || ""}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="First name"
                  autoComplete="off"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.last_name || ""}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Last name"
                  autoComplete="off"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email (used to link account on signup)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@buzzly.co"
                autoComplete="off"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Role</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) => setFormData({ ...formData, role_employees_id: value })}
              >
                <SelectTrigger className="bg-black/20 border-slate-800 text-slate-300 h-10">
                  <SelectValue placeholder="Select role" />
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
              <Label htmlFor="aptitude" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Position/Skill</Label>
              <Input
                id="aptitude"
                value={formData.aptitude || ""}
                onChange={(e) => setFormData({ ...formData, aptitude: e.target.value })}
                placeholder="e.g. Marketing, Sales, Developer"
                autoComplete="off"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-900/50 p-6 -m-6 border-t border-slate-800 mt-6 rounded-b-xl">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} disabled={createEmployee.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {createEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Employee Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-xl sm:max-w-[500px] dev-autofill-fix">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">Edit Employee</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Edit details for {selectedEmployee?.profile?.first_name} {selectedEmployee?.profile?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.first_name || ""}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  autoComplete="off"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.last_name || ""}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  autoComplete="off"
                  className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email (used to link account on signup)</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@example.com"
                autoComplete="off"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Role</Label>
              <Select
                value={formData.role_employees_id || ""}
                onValueChange={(value) => setFormData({ ...formData, role_employees_id: value })}
              >
                <SelectTrigger className="bg-black/20 border-slate-800 text-slate-300 h-10">
                  <SelectValue placeholder="Select role" />
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
              <Label htmlFor="edit-aptitude" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Position/Skill</Label>
              <Input
                id="edit-aptitude"
                value={formData.aptitude || ""}
                onChange={(e) => setFormData({ ...formData, aptitude: e.target.value })}
                autoComplete="off"
                className="bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800 h-10"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-900/50 p-6 -m-6 border-t border-slate-800 mt-6 rounded-b-xl">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleEditEmployee} disabled={updateEmployee.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {updateEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
