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
import {
  TeamMember,
  TeamRole,
  TeamPermissions,
} from "@/hooks/useTeamManagement";
import { MemberPermissionsDialog } from "./MemberPermissionsDialog";
import { cn } from "@/lib/utils";

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
  owner: { label: "Owner", className: "bg-sky-50 text-sky-700 border border-sky-200 font-medium" },
  admin: { label: "Admin", className: "bg-violet-50 text-violet-700 border border-violet-200" },
  editor: { label: "Editor", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  viewer: { label: "Viewer", className: "bg-gray-50 text-gray-600 border border-gray-200" },
};

const statusStyles: Record<string, { label: string; dotClass: string; textClass: string }> = {
  active: { label: "Active", dotClass: "bg-emerald-500", textClass: "text-muted-foreground" },
  suspended: { label: "Suspended", dotClass: "bg-amber-500", textClass: "text-muted-foreground" },
  removed: { label: "Removed", dotClass: "bg-gray-300", textClass: "text-muted-foreground" },
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
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Joined</TableHead>
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
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-sky-50 text-sky-600">
                        {getInitials(member.profile?.full_name, member.profile?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.profile?.full_name || "Unknown"}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal", roleStyles[member.role].className)}>
                    {roleStyles[member.role].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusStyles[member.status]?.dotClass ?? "bg-gray-300"}`}
                    />
                    <span className={`text-sm ${statusStyles[member.status]?.textClass ?? "text-muted-foreground"}`}>
                      {statusStyles[member.status]?.label ?? member.status}
                    </span>
                  </div>
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
                  {format(new Date(member.joined_at), "d MMM yyyy")}
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
                          Manage permissions
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
                                Suspend access
                              </DropdownMenuItem>
                            ) : member.status === "suspended" ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: "reactivate", member })}
                                className="text-success"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({ type: "remove", member })}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from team
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
                No members in team yet
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
              {confirmAction?.type === "suspend" && "Suspend member access?"}
              {confirmAction?.type === "reactivate" && "Reactivate member?"}
              {confirmAction?.type === "remove" && "Remove member from team?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "suspend" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} will not be able to access the team until reactivated`}
              {confirmAction?.type === "reactivate" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} will be able to access the team again`}
              {confirmAction?.type === "remove" &&
                `${confirmAction.member.profile?.full_name || confirmAction.member.profile?.email} will be permanently removed from the team`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
