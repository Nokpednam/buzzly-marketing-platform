import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Globe, Loader2 } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

export function WorkspaceSettings() {
  const {
    workspace,
    setWorkspace,
    businessTypes,
    industries,
    loading,
    saving,
    hasTeam,
    createWorkspace,
    saveWorkspace,
  } = useWorkspace();

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async () => {
    await saveWorkspace(workspace);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setIsCreating(true);
    const result = await createWorkspace(newWorkspaceName.trim());
    if (result) {
      setNewWorkspaceName("");
    }
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No workspace yet - show create form
  if (!hasTeam) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              สร้าง Workspace ใหม่
            </CardTitle>
            <CardDescription>
              คุณยังไม่มี Workspace กรุณาสร้าง Workspace เพื่อเริ่มต้นใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">ชื่อ Workspace *</Label>
              <Input
                id="workspaceName"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="เช่น My Store, ร้านค้าของฉัน"
              />
            </div>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isCreating ? "กำลังสร้าง..." : "สร้าง Workspace"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Identity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Workspace Identity
          </CardTitle>
          <CardDescription>ตั้งค่าข้อมูลพื้นฐานของ Workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Preview */}
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-accent-foreground border-2 border-dashed border-border overflow-hidden">
              {workspace.logo_url ? (
                <img
                  src={workspace.logo_url}
                  alt="Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                workspace.name.charAt(0).toUpperCase() || "W"
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="logoUrl" className="text-sm font-medium">Logo URL</Label>
              <Input
                id="logoUrl"
                value={workspace.logo_url}
                onChange={(e) => setWorkspace({ ...workspace, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">ใส่ URL รูปภาพโลโก้ของ Workspace</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">ชื่อ Workspace *</Label>
              <Input
                id="workspaceName"
                value={workspace.name}
                onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                placeholder="เช่น My Store, ร้านค้าของฉัน"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">ประเภทธุรกิจ (Business Type)</Label>
              <Select
                value={workspace.business_type_id}
                onValueChange={(value) => setWorkspace({ ...workspace, business_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">อุตสาหกรรม (Industry)</Label>
              <Select
                value={workspace.industries_id}
                onValueChange={(value) => setWorkspace({ ...workspace, industries_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกอุตสาหกรรม" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Website URL
              </Label>
              <Input
                id="website"
                value={workspace.workspace_url}
                onChange={(e) => setWorkspace({ ...workspace, workspace_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Timezone
              </Label>
              <Select
                value={workspace.timezone}
                onValueChange={(value) => setWorkspace({ ...workspace, timezone: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบายธุรกิจ</Label>
            <Textarea
              id="description"
              value={workspace.description}
              onChange={(e) => setWorkspace({ ...workspace, description: e.target.value })}
              placeholder="บอกเล่าเกี่ยวกับธุรกิจของคุณ..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !workspace.name.trim()}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {saving ? "กำลังบันทึก..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
