import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MoreHorizontal, 
  Search, 
  Mail,
  Clock,
  Building2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Link as LinkIcon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TeamRole = Database["public"]["Enums"]["team_role"];
type MemberStatus = Database["public"]["Enums"]["member_status"];
type InvitationStatus = Database["public"]["Enums"]["invitation_status"];

interface TeamMemberWithProfile {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  status: MemberStatus;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
}

interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: string;
  status: InvitationStatus;
  created_at: string;
  teams?: {
    id: string;
    name: string;
  } | null;
  inviter?: {
    full_name: string | null;
  } | null;
}

interface WorkspaceMemberData {
  id: string;
  workspace_id: string;
  user_id: string;
  status: string | null;
  joined_at: string | null;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
}

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [editingMember, setEditingMember] = useState<TeamMemberWithProfile | null>(null);
  const [newRole, setNewRole] = useState<TeamRole>("viewer");
  const [newStatus, setNewStatus] = useState<MemberStatus>("active");

  // Fetch all team members
  const { data: allMembers, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["admin-all-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, team_id, user_id, role, status, joined_at")
        .order("joined_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles and teams separately
      const userIds = data.map(m => m.user_id);
      const teamIds = [...new Set(data.map(m => m.team_id))];
      
      const [profilesRes, teamsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", userIds),
        supabase.from("teams").select("id, name").in("id", teamIds)
      ]);
      
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const teamMap = new Map((teamsRes.data || []).map(t => [t.id, t]));
      
      return data.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || null,
        team: teamMap.get(m.team_id) || null
      })) as TeamMemberWithProfile[];
    },
  });

  // Fetch all invitations
  const { data: allInvitations, isLoading: loadingInvitations, refetch: refetchInvitations } = useQuery({
    queryKey: ["admin-all-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, team_id, email, role, invited_by, expires_at, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch teams and inviter profiles
      const teamIds = [...new Set(data.map(i => i.team_id))];
      const inviterIds = [...new Set(data.map(i => i.invited_by))];
      
      const [teamsRes, profilesRes] = await Promise.all([
        supabase.from("teams").select("id, name").in("id", teamIds),
        supabase.from("profiles").select("id, full_name").in("id", inviterIds)
      ]);
      
      const teamMap = new Map((teamsRes.data || []).map(t => [t.id, t]));
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      
      return data.map(i => ({
        ...i,
        teams: teamMap.get(i.team_id) || null,
        inviter: profileMap.get(i.invited_by) || null
      })) as TeamInvitation[];
    },
  });

  // Fetch workspace members (member chains)
  const { data: workspaceMembers, isLoading: loadingWorkspaceMembers, refetch: refetchWorkspaceMembers } = useQuery({
    queryKey: ["admin-workspace-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("id, workspace_id, user_id, status, joined_at")
        .order("joined_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles and workspaces
      const userIds = data.map(m => m.user_id);
      const workspaceIds = [...new Set(data.map(m => m.workspace_id))];
      
      const [profilesRes, teamsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", userIds),
        supabase.from("teams").select("id, name").in("id", workspaceIds)
      ]);
      
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const teamMap = new Map((teamsRes.data || []).map(t => [t.id, t]));
      
      return data.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || null,
        team: teamMap.get(m.workspace_id) || null
      })) as WorkspaceMemberData[];
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, role, status }: { id: string; role: TeamRole; status: MemberStatus }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role, status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Member updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-all-members"] });
      setEditingMember(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Member removed successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-all-members"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Invitation deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-all-invitations"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete invitation.", variant: "destructive" });
    },
  });

  const filteredMembers = allMembers?.filter((m) =>
    m.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvitations = allInvitations?.filter((inv) =>
    inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.teams?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkspaceMembers = workspaceMembers?.filter((wm) =>
    wm.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wm.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wm.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingInvitations = filteredInvitations?.filter((inv) => inv.status === "pending");
  const acceptedInvitations = filteredInvitations?.filter((inv) => inv.status === "accepted");

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner": return "default";
      case "admin": return "secondary";
      case "editor": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active": return <Badge variant="default">Active</Badge>;
      case "suspended": return <Badge variant="destructive">Suspended</Badge>;
      case "removed": return <Badge variant="secondary">Removed</Badge>;
      default: return <Badge variant="default">Active</Badge>;
    }
  };

  const getInvitationStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleRefresh = () => {
    refetchMembers();
    refetchInvitations();
    refetchWorkspaceMembers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members Management</h1>
          <p className="text-muted-foreground">
            Manage all members, invitations, and workspace connections
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMembers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {pendingInvitations?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {acceptedInvitations?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workspace Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaceMembers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                All Members ({allMembers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="invitations">
                <Mail className="h-4 w-4 mr-2" />
                Invitations ({allInvitations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="chains">
                <LinkIcon className="h-4 w-4 mr-2" />
                Member Chains ({workspaceMembers?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* All Members Tab */}
            <TabsContent value="members">
              {loadingMembers ? (
                <div className="text-center py-8 text-muted-foreground">Loading members...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.profile?.full_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.profile?.email || member.user_id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{member.team?.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(member.joined_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingMember(member);
                                setNewRole(member.role);
                                setNewStatus(member.status);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteMemberMutation.mutate(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMembers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations">
              {loadingInvitations ? (
                <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitations?.map((invitation) => (
                      <TableRow key={invitation.id} className={invitation.status === "expired" ? "opacity-60" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invitation.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{invitation.teams?.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invitation.inviter?.full_name || "System"}
                        </TableCell>
                        <TableCell>
                          {getInvitationStatusBadge(invitation.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvitations?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No invitations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Member Chains Tab */}
            <TabsContent value="chains">
              {loadingWorkspaceMembers ? (
                <div className="text-center py-8 text-muted-foreground">Loading workspace members...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkspaceMembers?.map((wm) => (
                      <TableRow key={wm.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {wm.profile?.full_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {wm.profile?.email || wm.user_id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{wm.team?.name || "Unknown Workspace"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(wm.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {wm.joined_at 
                            ? format(new Date(wm.joined_at), "MMM d, yyyy")
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWorkspaceMembers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No workspace members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update role and status for {editingMember?.profile?.full_name || "this member"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as MemberStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingMember) {
                  updateMemberMutation.mutate({
                    id: editingMember.id,
                    role: newRole,
                    status: newStatus,
                  });
                }
              }}
              disabled={updateMemberMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
