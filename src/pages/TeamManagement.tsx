import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Mail,
  History,
  Shield,
  Store,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import {
  useTeamManagement,
  defaultRolePermissions,
  permissionLabels,
  type TeamPermissions,
} from "@/hooks/useTeamManagement";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamInvitationsList } from "@/components/team/TeamInvitationsList";
import { TeamActivityLog } from "@/components/team/TeamActivityLog";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { WorkspaceMembersList } from "@/components/team/WorkspaceMembersList";
import { cn } from "@/lib/utils";

function TeamManagementContent() {
  const {
    team,
    members,
    invitations,
    activityLogs,
    loading,
    currentUserId,
    currentUserRole,
    canManageTeam,
    sendInvitation,
    cancelInvitation,
    updateMemberRole,
    updateMemberPermissions,
    suspendMember,
    reactivateMember,
    removeMember,
  } = useTeamManagement();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — clean, minimal */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Team Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage members and access permissions for {team?.name || "Workspace"}
        </p>
      </div>

      {/* Stats — subtle color accents */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums">{activeMembers.length}</p>
                <p className="text-sm text-muted-foreground">Active members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums">{pendingInvitations.length}</p>
                <p className="text-sm text-muted-foreground">Pending invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal text-muted-foreground border-gray-200 dark:border-gray-700 capitalize">
                  {currentUserRole || "viewer"}
                </Badge>
                <p className="text-sm text-muted-foreground">Your role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles — horizontal list, monochromatic, subtle borders */}
      <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Default roles and permissions
          </CardTitle>
          <CardDescription className="text-xs">
            Each member receives permissions based on their role. Individual permissions can be customized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
            {(["owner", "admin", "editor", "viewer"] as const).map((role) => {
              const permissions = defaultRolePermissions[role];
              const enabledCount = Object.values(permissions).filter(Boolean).length;
              const roleLabels: Record<string, string> = {
                owner: "Full access, including deleting the team",
                admin: "Manage team and members",
                editor: "Create and edit Campaigns/Prospects",
                viewer: "View-only access",
              };
              const roleColors: Record<string, string> = {
                owner: "text-sky-600",
                admin: "text-violet-600",
                editor: "text-amber-600",
                viewer: "text-gray-600",
              };
              const permKeys = Object.keys(permissions) as (keyof TeamPermissions)[];
              return (
                <div
                  key={role}
                  className="border-r border-b border-gray-100 dark:border-gray-800 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b md:[&:nth-last-child(-n+4)]:border-b-0"
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset rounded-none"
                      >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            roleColors[role]
                          )}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground tabular-nums">
                          {enabledCount}/11
                          <ChevronDown className="h-3 w-3 opacity-60" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {roleLabels[role]}
                      </p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                          Click to view all permissions
                        </span>
                      </button>
                    </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-80 p-0 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                      <p className="text-sm font-medium text-foreground">
                        {role.charAt(0).toUpperCase() + role.slice(1)} permissions
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {enabledCount} of 11 permissions
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {permKeys.map((key) => {
                        const enabled = permissions[key];
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60"
                          >
                            {enabled ? (
                              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <X className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                            )}
                            <span
                              className={cn(
                                "text-sm",
                                enabled ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {permissionLabels[key]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs — Segmented Control style */}
      <Tabs defaultValue="members" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="inline-flex h-9 items-center rounded-full bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700 w-fit">
            <TabsTrigger
              value="members"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-gray-700 transition-all"
            >
              <Users className="h-3.5 w-3.5 mr-2" />
              Team members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-gray-700 transition-all"
            >
              <Mail className="h-3.5 w-3.5 mr-2" />
              Invitations ({pendingInvitations.length})
            </TabsTrigger>
            <TabsTrigger
              value="workspace"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-gray-700 transition-all"
            >
              <Store className="h-3.5 w-3.5 mr-2" />
              Store members
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200/80 dark:data-[state=active]:border-gray-700 transition-all"
            >
              <History className="h-3.5 w-3.5 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>
          {canManageTeam && (
            <Button
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
              className="gap-2 rounded-lg h-9 px-4"
            >
              <UserPlus className="h-4 w-4" />
              Invite member
            </Button>
          )}
        </div>

        <TabsContent value="members">
          <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none overflow-hidden">
            <CardContent className="p-0">
              <TeamMembersList
                members={members}
                currentUserId={currentUserId}
                canManage={canManageTeam}
                onUpdateRole={updateMemberRole}
                onUpdatePermissions={updateMemberPermissions}
                onSuspend={suspendMember}
                onReactivate={reactivateMember}
                onRemove={removeMember}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none overflow-hidden">
            <CardContent className="p-0">
              <TeamInvitationsList
                invitations={invitations}
                canManage={canManageTeam}
                onCancel={cancelInvitation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace">
          <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                Store members
              </CardTitle>
              <CardDescription className="text-sm">
                Invite and manage members who can access your store. See who invited whom.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-0">
              <WorkspaceMembersList canManage={canManageTeam} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Recent activity</CardTitle>
              <CardDescription className="text-sm">
                Log of all changes in the team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamActivityLog logs={activityLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
      />
    </div>
  );
}

export default function TeamManagement() {
  return (
    <PlanRestrictedPage
      requiredFeature="teamCollaboration"
      featureDescription="Manage team and invite members to your Workspace"
    >
      <TeamManagementContent />
    </PlanRestrictedPage>
  );
}
