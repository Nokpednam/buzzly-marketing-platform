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
  Crown,
  Shield,
  Store,
} from "lucide-react";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { useTeamManagement, defaultRolePermissions } from "@/hooks/useTeamManagement";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamInvitationsList } from "@/components/team/TeamInvitationsList";
import { TeamActivityLog } from "@/components/team/TeamActivityLog";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { EmployeesList } from "@/components/team/EmployeesList";
import { WorkspaceMembersList } from "@/components/team/WorkspaceMembersList";


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
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Management
          </h1>
          <p className="text-muted-foreground">
            จัดการสมาชิกและสิทธิ์การเข้าถึงของ {team?.name || "Workspace"}
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            เชิญสมาชิก
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMembers.length}</p>
                <p className="text-sm text-muted-foreground">สมาชิกที่ใช้งาน</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Mail className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
                <p className="text-sm text-muted-foreground">คำเชิญที่รอดำเนินการ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Shield className="h-5 w-5 text-info" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {currentUserRole || "viewer"}
                </Badge>
                <p className="text-sm text-muted-foreground">บทบาทของคุณ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Legend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4" />
            บทบาทและสิทธิ์เริ่มต้น
          </CardTitle>
          <CardDescription>
            สมาชิกแต่ละคนจะได้รับสิทธิ์ตาม Role ที่กำหนด สามารถปรับสิทธิ์เฉพาะบุคคลได้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {(["owner", "admin", "editor", "viewer"] as const).map((role) => {
              const permissions = defaultRolePermissions[role];
              const enabledCount = Object.values(permissions).filter(Boolean).length;

              return (
                <div key={role} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className={
                        role === "owner"
                          ? "bg-primary text-primary-foreground"
                          : role === "admin"
                            ? "bg-info text-info-foreground"
                            : role === "editor"
                              ? "bg-warning text-warning-foreground"
                              : "bg-muted text-muted-foreground"
                      }
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {enabledCount}/11 สิทธิ์
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role === "owner" && "จัดการได้ทุกอย่าง รวมถึงลบทีม"}
                    {role === "admin" && "จัดการทีมและสมาชิกได้"}
                    {role === "editor" && "สร้างและแก้ไข Campaigns/Prospects"}
                    {role === "viewer" && "ดูข้อมูลได้อย่างเดียว"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            สมาชิกทีม ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            คำเชิญ ({pendingInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-2">
            <Store className="h-4 w-4" />
            สมาชิกร้านค้า
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="h-4 w-4" />
            ประวัติ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="border-0 shadow-sm">
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
          <Card className="border-0 shadow-sm">
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" />
                สมาชิกร้านค้า
              </CardTitle>
              <CardDescription>
                เชิญและจัดการสมาชิกที่เข้าถึงร้านค้าของคุณ รู้ว่าใครเชิญใครมา
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <WorkspaceMembersList canManage={canManageTeam} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ประวัติกิจกรรมล่าสุด</CardTitle>
              <CardDescription>
                บันทึกการเปลี่ยนแปลงทั้งหมดในทีม
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamActivityLog logs={activityLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
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
      featureDescription="จัดการทีมและเชิญสมาชิกเข้าร่วม Workspace"
    >
      <TeamManagementContent />
    </PlanRestrictedPage>
  );
}
