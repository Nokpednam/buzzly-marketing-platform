import { useState } from "react";
import {
  useAdminWorkspaces,
  useAdminWorkspaceStats,
  useAdminWorkspaceMembers,
  useAdminWorkspaceAdAccounts,
  useToggleAdAccount,
  type Team,
  type WorkspaceMember,
  type AdAccount,
} from "@/hooks/useAdminWorkspaces";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  MoreHorizontal,
  Search,
  Ban,
  CheckCircle,
  Globe,
  Link2,
  RefreshCw,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export default function AdminWorkspaces() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Team | null>(null);
  const [viewMode, setViewMode] = useState<"members" | "api" | null>(null);

  // Mock suspended state (would need DB column in production)
  const [suspendedWorkspaces, setSuspendedWorkspaces] = useState<Set<string>>(new Set());

  // Fetch all workspaces (teams)
  const { data: workspaces, isLoading, refetch } = useAdminWorkspaces();

  // Fetch team stats (members count, ad accounts)
  const { data: rawStats } = useAdminWorkspaceStats();
  // Normalize stats shape to match existing JSX (members/adAccounts keys)
  const workspaceStats = rawStats
    ? Object.fromEntries(
      Object.entries(rawStats).map(([id, s]) => [
        id,
        { members: s.memberCount, adAccounts: s.adAccountCount },
      ])
    )
    : undefined;

  // Fetch members for selected workspace
  const { data: workspaceMembers, isLoading: loadingMembers } = useAdminWorkspaceMembers(
    selectedWorkspace?.id ?? null,
    viewMode === "members"
  );

  // Fetch ad accounts for selected workspace
  const { data: workspaceAdAccounts, isLoading: loadingAdAccounts } = useAdminWorkspaceAdAccounts(
    selectedWorkspace?.id ?? null,
    viewMode === "api"
  );

  const toggleAdAccountMutation = useToggleAdAccount();

  const filteredWorkspaces = workspaces?.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.business_types?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspendToggle = (workspaceId: string) => {
    const newSuspended = new Set(suspendedWorkspaces);
    if (newSuspended.has(workspaceId)) {
      newSuspended.delete(workspaceId);
      toast({
        title: "Workspace Activated",
        description: "Workspace has been reactivated successfully.",
      });
    } else {
      newSuspended.add(workspaceId);
      toast({
        title: "Workspace Suspended",
        description: "Workspace has been suspended.",
        variant: "destructive",
      });
    }
    setSuspendedWorkspaces(newSuspended);
  };

  const handleToggleAdAccount = async (accountId: string, currentStatus: boolean | null) => {
    await toggleAdAccountMutation.mutateAsync({ id: accountId, isActive: !currentStatus });
    refetch();
  };


  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner": return "default";
      case "admin": return "secondary";
      case "editor": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces Management</h1>
          <p className="text-muted-foreground">
            View and manage all workspaces across the platform
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {(workspaces?.length || 0) - suspendedWorkspaces.size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {suspendedWorkspaces.size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(workspaceStats || {}).reduce((sum, s) => sum + s.members, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces by name, description, or business type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading workspaces...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Ad Accounts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces?.map((workspace) => {
                  const stats = workspaceStats?.[workspace.id] || { members: 0, adAccounts: 0 };
                  const isSuspended = suspendedWorkspaces.has(workspace.id);

                  return (
                    <TableRow key={workspace.id} className={isSuspended ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {workspace.logo_url ? (
                              <img
                                src={workspace.logo_url}
                                alt={workspace.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{workspace.name}</div>
                            {workspace.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {workspace.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {workspace.business_types?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {workspace.industries?.name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.members}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.adAccounts}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isSuspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(workspace.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedWorkspace(workspace);
                                setViewMode("members");
                              }}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Members
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedWorkspace(workspace);
                                setViewMode("api");
                              }}
                            >
                              <Link2 className="h-4 w-4 mr-2" />
                              API Connections
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSuspendToggle(workspace.id)}
                              className={isSuspended ? "text-primary" : "text-destructive"}
                            >
                              {isSuspended ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredWorkspaces?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No workspaces found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Workspace Detail Dialog */}
      <Dialog
        open={!!selectedWorkspace && !!viewMode}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWorkspace(null);
            setViewMode(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkspace?.logo_url ? (
                <img
                  src={selectedWorkspace.logo_url}
                  alt={selectedWorkspace.name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
              {selectedWorkspace?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkspace?.description || "No description available"}
            </DialogDescription>
          </DialogHeader>

          {/* Workspace Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
            {selectedWorkspace?.business_types?.name && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Business Type</div>
                <div className="font-medium">{selectedWorkspace.business_types.name}</div>
              </div>
            )}
            {selectedWorkspace?.industries?.name && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Industry</div>
                <div className="font-medium">{selectedWorkspace.industries.name}</div>
              </div>
            )}
            {selectedWorkspace?.workspace_url && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Website</div>
                <a href={selectedWorkspace.workspace_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Visit
                </a>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium">{selectedWorkspace?.status || "Active"}</div>
            </div>
          </div>

          <Tabs value={viewMode || "members"} onValueChange={(v) => setViewMode(v as "members" | "api")}>
            <TabsList>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members ({workspaceMembers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="api">
                <Link2 className="h-4 w-4 mr-2" />
                API Connections ({workspaceAdAccounts?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              {loadingMembers ? (
                <div className="text-center py-8 text-muted-foreground">Loading members...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspaceMembers?.map((member) => (
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
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(member.joined_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {workspaceMembers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="api" className="mt-4">
              {loadingAdAccounts ? (
                <div className="text-center py-8 text-muted-foreground">Loading API connections...</div>
              ) : (
                <div className="space-y-4">
                  {workspaceAdAccounts?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No API connections configured</p>
                    </div>
                  ) : (
                    workspaceAdAccounts?.map((account) => (
                      <Card key={account.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                {account.platforms?.icon_url ? (
                                  <img
                                    src={account.platforms.icon_url}
                                    alt=""
                                    className="h-6 w-6"
                                  />
                                ) : (
                                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{account.account_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {account.platforms?.name || "Unknown Platform"} •
                                  ID: {account.platform_account_id || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={account.is_active ? "default" : "secondary"}>
                                {account.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAdAccount(account.id, account.is_active)}
                              >
                                {account.is_active ? (
                                  <>
                                    <Ban className="h-3 w-3 mr-1" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Enable
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
