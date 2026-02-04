import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  UserX,
  UserCheck,
  Trash2,
  UserPlus,
  Store,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useWorkspaceMembers, WorkspaceMemberRole, WorkspaceMemberStatus } from "@/hooks/useWorkspaceMembers";

const roleLabels: Record<WorkspaceMemberRole, string> = {
  owner: "เจ้าของ",
  admin: "ผู้ดูแล",
  member: "สมาชิก",
  viewer: "ผู้ดู",
};

const roleColors: Record<WorkspaceMemberRole, string> = {
  owner: "bg-primary text-primary-foreground",
  admin: "bg-info text-info-foreground",
  member: "bg-warning text-warning-foreground",
  viewer: "bg-muted text-muted-foreground",
};

interface WorkspaceMembersListProps {
  canManage: boolean;
}

export function WorkspaceMembersList({ canManage }: WorkspaceMembersListProps) {
  const { 
    members, 
    isLoading,
    inviteMember,
    suspendMember,
    reactivateMember,
    removeMember,
  } = useWorkspaceMembers();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "member" as WorkspaceMemberRole,
  });

  const handleInvite = async () => {
    await inviteMember.mutateAsync({
      email: formData.email,
      role: formData.role,
    });
    setInviteDialogOpen(false);
    setFormData({ email: "", role: "member" });
  };

  const handleSuspend = async (id: string) => {
    await suspendMember.mutateAsync(id);
  };

  const handleReactivate = async (id: string) => {
    await reactivateMember.mutateAsync(id);
  };

  const handleRemove = async (id: string) => {
    await removeMember.mutateAsync(id);
  };

  const handleCancelInvite = async (id: string) => {
    await removeMember.mutateAsync(id);
  };

  const getStatusBadge = (status: WorkspaceMemberStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">เข้าร่วมแล้ว</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">รอตอบรับ</Badge>;
      case "suspended":
        return <Badge variant="destructive">ระงับ</Badge>;
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
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
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Store className="h-4 w-4" />
            <span className="text-sm">ร้านขายของ ABC</span>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            เชิญสมาชิกร้านค้า
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สมาชิก</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>เชิญโดย</TableHead>
              <TableHead>วันที่เชิญ/เข้าร่วม</TableHead>
              {canManage && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีสมาชิกในร้านค้า
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(member.fullName, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.fullName || member.email}
                        </p>
                        {member.fullName && (
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{member.inviterName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {member.status === "pending" ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            เชิญเมื่อ{" "}
                            {new Date(member.invitedAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ) : member.joinedAt ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>
                            {new Date(member.invitedAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span>
                            {new Date(member.joinedAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </div>
                  </TableCell>
                  {canManage && member.role !== "owner" && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.status === "pending" ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancelInvite(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              ยกเลิกคำเชิญ
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {member.status === "active" ? (
                                <DropdownMenuItem
                                  className="text-warning"
                                  onClick={() => handleSuspend(member.id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  ระงับการเข้าถึง
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-success"
                                  onClick={() => handleReactivate(member.id)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  เปิดใช้งานอีกครั้ง
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemove(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                นำออกจากร้านค้า
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                  {canManage && member.role === "owner" && (
                    <TableCell></TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เชิญสมาชิกเข้าร่วมร้านค้า</DialogTitle>
            <DialogDescription>
              ส่งคำเชิญไปยังอีเมลเพื่อเข้าร่วมดูแลร้านค้าของคุณ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">อีเมล</Label>
              <Input
                id="invite-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="member@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">บทบาท</Label>
              <Select
                value={formData.role}
                onValueChange={(value: WorkspaceMemberRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span>ผู้ดูแล (Admin)</span>
                      <span className="text-xs text-muted-foreground">จัดการร้านค้าและสมาชิกได้</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex flex-col">
                      <span>สมาชิก (Member)</span>
                      <span className="text-xs text-muted-foreground">ทำงานและแก้ไขข้อมูลได้</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span>ผู้ดู (Viewer)</span>
                      <span className="text-xs text-muted-foreground">ดูข้อมูลได้อย่างเดียว</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleInvite} disabled={!formData.email || inviteMember.isPending}>
              {inviteMember.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              ส่งคำเชิญ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
