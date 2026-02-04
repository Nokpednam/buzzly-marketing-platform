import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Shield,
  UserMinus,
  UserX,
  UserCheck,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  TeamMember,
  TeamRole,
  TeamPermissions,
} from "@/hooks/useTeamManagement";
import { MemberPermissionsDialog } from "./MemberPermissionsDialog";

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string | null;
  canManage: boolean;
  onUpdateRole: (memberId: string, role: TeamRole) => Promise<boolean>;
  onUpdatePermissions: (memberId: string, permissions: TeamPermissions) => Promise<boolean>;
  onSuspend: (memberId: string) => Promise<boolean>;
  onReactivate: (memberId: string) => Promise<boolean>;
  onRemove: (memberId: string) => Promise<boolean>;
}

const roleStyles: Record<TeamRole, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-primary text-primary-foreground" },
  admin: { label: "Admin", className: "bg-info text-info-foreground" },
  editor: { label: "Editor", className: "bg-warning text-warning-foreground" },
  viewer: { label: "Viewer", className: "bg-muted text-muted-foreground" },
};

const statusStyles: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  suspended: { label: "Suspended", className: "bg-destructive/10 text-destructive border-destructive/20" },
  removed: { label: "Removed", className: "bg-muted text-muted-foreground" },
};

export function TeamMembersList({
  members,
  currentUserId,
  canManage,
  onUpdateRole,
  onUpdatePermissions,
  onSuspend,
  onReactivate,
  onRemove,
}: TeamMembersListProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "reactivate" | "remove";
    member: TeamMember;
  } | null>(null);

  const handleAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "suspend":
        await onSuspend(confirmAction.member.id);
        break;
      case "reactivate":
        await onReactivate(confirmAction.member.id);
        break;
      case "remove":
        await onRemove(confirmAction.member.id);
        break;
    }
    setConfirmAction(null);
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>สมาชิก</TableHead>
            <TableHead>บทบาท</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>สิทธิ์</TableHead>
            <TableHead>เข้าร่วมเมื่อ</TableHead>
            {canManage && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const isOwner = member.role === "owner";

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(member.profile?.full_name, member.profile?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.profile?.full_name || "Unknown"}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(คุณ)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={roleStyles[member.role].className}>
                    {roleStyles[member.role].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[member.status].className}>
                    {statusStyles[member.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.custom_permissions ? (
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      <Settings className="mr-1 h-3 w-3" />
                      Custom
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Default</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(member.joined_at), "d MMM yyyy", { locale: th })}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setPermissionsDialogOpen(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          จัดการสิทธิ์
                        </DropdownMenuItem>
                        {!isOwner && !isCurrentUser && (
                          <>
                            <DropdownMenuSeparator />
                            {member.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: "suspend", member })}
                                className="text-warning"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                ระงับการเข้าถึง
                              </DropdownMenuItem>
                            ) : member.status === "suspended" ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: "reactivate", member })}
                                className="text-success"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                เปิดใช้งานใหม่
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({ type: "remove", member })}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              ลบออกจากทีม
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={canManage ? 6 : 5} className="text-center py-8 text-muted-foreground">
                ยังไม่มีสมาชิกในทีม
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <MemberPermissionsDialog
        member={selectedMember}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        onUpdateRole={onUpdateRole}
        onUpdatePermissions={onUpdatePermissions}
        canEdit={canManage}
        isCurrentUser={selectedMember?.user_id === currentUserId}
      />

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "suspend" && "ระงับการเข้าถึงสมาชิก?"}
              {confirmAction?.type === "reactivate" && "เปิดใช้งานสมาชิกใหม่?"}
              {confirmAction?.type === "remove" && "ลบสมาชิกออกจากทีม?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "suspend" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} จะไม่สามารถเข้าถึงทีมได้จนกว่าจะเปิดใช้งานใหม่`}
              {confirmAction?.type === "reactivate" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} จะสามารถเข้าถึงทีมได้อีกครั้ง`}
              {confirmAction?.type === "remove" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} จะถูกลบออกจากทีมอย่างถาวร`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                confirmAction?.type === "remove"
                  ? "bg-destructive hover:bg-destructive/90"
                  : confirmAction?.type === "reactivate"
                  ? "bg-success hover:bg-success/90"
                  : ""
              }
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
