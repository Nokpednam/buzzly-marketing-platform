import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  FolderOpen,
  Play,
  Pause,
  FileText,
  Link2,
} from "lucide-react";
import { useAdGroups, type AdGroupWithCount } from "@/hooks/useAdGroups";
import { LinkItemsDialog } from "@/components/social/analytics/LinkItemsDialog";

interface AdGroupsListProps {
  onGroupsChange?: (groups: { id: string; name: string }[]) => void;
}

export function AdGroupsList({ onGroupsChange }: AdGroupsListProps) {
  const { adGroups, isLoading, createAdGroup, updateAdGroup, deleteAdGroup } = useAdGroups();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkDialogGroup, setLinkDialogGroup] = useState<AdGroupWithCount | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AdGroupWithCount | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    status: "draft",
  });

  const resetForm = () => {
    setFormData({ name: "", status: "draft" });
  };

  const handleAdd = () => {
    createAdGroup.mutate({
      name: formData.name,
      status: formData.status,
    });
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedGroup) return;
    updateAdGroup.mutate({
      id: selectedGroup.id,
      updates: {
        name: formData.name,
        status: formData.status,
      },
    });
    setEditDialogOpen(false);
    setSelectedGroup(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteAdGroup.mutate(id);
  };

  const handleToggleStatus = (group: AdGroupWithCount) => {
    updateAdGroup.mutate({
      id: group.id,
      updates: {
        status: group.status === "active" ? "paused" : "active",
      },
    });
  };

  const openEditDialog = (group: AdGroupWithCount) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      status: group.status || "draft",
    });
    setEditDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">กำลังทำงาน</Badge>;
      case "paused":
        return <Badge className="bg-warning text-warning-foreground">หยุดชั่วคราว</Badge>;
      case "draft":
        return <Badge variant="secondary">แบบร่าง</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active":
        return <div className="h-2 w-2 rounded-full bg-success" />;
      case "paused":
        return <div className="h-2 w-2 rounded-full bg-warning" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{adGroups.length} กลุ่มโฆษณา</p>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างกลุ่มโฆษณา
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(group.status)}
                  <CardTitle className="text-base">{group.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(group)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLinkDialogGroup(group)}>
                      <Link2 className="h-4 w-4 mr-2" />
                      เชื่อมโยงโพสต์/โฆษณา
                    </DropdownMenuItem>
                    {(group.status === "active" || group.status === "paused") && (
                      <DropdownMenuItem onClick={() => handleToggleStatus(group)}>
                        {group.status === "active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            หยุดชั่วคราว
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            เปิดใช้งาน
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {group.ads_count} โฆษณา
                  </span>
                  <span className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    {group.posts_count} โพสต์
                  </span>
                </div>
                {getStatusBadge(group.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                อัปเดตล่าสุด:{" "}
                {new Date(group.updated_at).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {adGroups.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มีกลุ่มโฆษณา</p>
            <p className="text-sm">สร้างกลุ่มโฆษณาเพื่อจัดระเบียบโฆษณาของคุณ</p>
          </div>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างกลุ่มโฆษณาใหม่</DialogTitle>
            <DialogDescription>
              จัดกลุ่มโฆษณาเพื่อให้ง่ายต่อการจัดการ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อกลุ่ม</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale Campaign"
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="active">เปิดใช้งาน</SelectItem>
                  <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={!formData.name || createAdGroup.isPending}>
              {createAdGroup.isPending ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Items Dialog */}
      {linkDialogGroup && (
        <LinkItemsDialog
          groupId={linkDialogGroup.id}
          groupName={linkDialogGroup.name}
          open={!!linkDialogGroup}
          onOpenChange={(open) => { if (!open) setLinkDialogGroup(null); }}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขกลุ่มโฆษณา</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อกลุ่ม</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="active">เปิดใช้งาน</SelectItem>
                  <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={updateAdGroup.isPending}>
              {updateAdGroup.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
