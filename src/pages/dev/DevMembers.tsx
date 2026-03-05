import { useState } from "react";
import {
    useDevAllMembers,
    useDevAllInvitations,
    useUpdateMember,
    useDeleteMember,
    useDeleteInvitation,
} from "@/hooks/useDevMembers";
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



export default function DevMembers() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("members");
    const [editingMember, setEditingMember] = useState<TeamMemberWithProfile | null>(null);
    const [newRole, setNewRole] = useState<TeamRole>("viewer");
    const [newStatus, setNewStatus] = useState<MemberStatus>("active");

    const { data: allMembers, isLoading: loadingMembers, refetch: refetchMembers } = useDevAllMembers();
    const { data: allInvitations, isLoading: loadingInvitations, refetch: refetchInvitations } = useDevAllInvitations();

    const updateMemberMutation = useUpdateMember();
    const deleteMemberMutation = useDeleteMember();
    const deleteInvitationMutation = useDeleteInvitation();


    const filteredMembers = allMembers?.filter((m) =>
        m.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredInvitations = allInvitations?.filter((inv) =>
        inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv as any).teams?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    <Badge variant={getRoleBadgeVariant(member.role) as any}>
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
                                                        <span>{(invitation as any).teams?.name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeVariant(invitation.role) as any}>
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
