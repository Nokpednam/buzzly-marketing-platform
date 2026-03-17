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
  owner: "Owner",
  admin: "Admin",
  editor: "Member",
  viewer: "Viewer",
};

const roleColors: Record<WorkspaceMemberRole, string> = {
  owner: "bg-sky-50 text-sky-700 border border-sky-200 font-medium",
  admin: "bg-violet-50 text-violet-700 border border-violet-200",
  editor: "bg-amber-50 text-amber-700 border border-amber-200",
  viewer: "bg-gray-50 text-gray-600 border border-gray-200",
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
    role: "editor" as WorkspaceMemberRole,
  });

  const handleInvite = async () => {
    await inviteMember.mutateAsync({
      email: formData.email,
      role: formData.role,
    });
    setInviteDialogOpen(false);
    setFormData({ email: "", role: "editor" });
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
        return <Badge className="bg-success text-success-foreground">Joined</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
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
            <span className="text-sm">Store ABC</span>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite store member
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invited by</TableHead>
            <TableHead>Invited / Joined</TableHead>
              {canManage && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No store members yet
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
                    <Badge variant="outline" className={roleColors[member.role]}>
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
                            Invited{" "}
                            {new Date(member.invitedAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ) : member.joinedAt ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>
                            {new Date(member.invitedAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span>
                            {new Date(member.joinedAt).toLocaleDateString("en-US", {
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
                              Cancel invitation
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {member.status === "active" ? (
                                <DropdownMenuItem
                                  className="text-warning"
                                  onClick={() => handleSuspend(member.id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend access
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-success"
                                  onClick={() => handleReactivate(member.id)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemove(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from store
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
            <DialogTitle>Invite member to store</DialogTitle>
            <DialogDescription>
              Send an invitation via email to join and manage your store
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
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
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: WorkspaceMemberRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground">Manage store and members</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex flex-col">
                      <span>Member</span>
                      <span className="text-xs text-muted-foreground">Work and edit data</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span>Viewer</span>
                      <span className="text-xs text-muted-foreground">View-only access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!formData.email || inviteMember.isPending}>
              {inviteMember.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
