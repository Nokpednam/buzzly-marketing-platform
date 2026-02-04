import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Mail, Settings2 } from "lucide-react";
import { 
  TeamRole, 
  TeamPermissions, 
  defaultRolePermissions, 
  permissionLabels 
} from "@/hooks/useTeamManagement";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: TeamRole, customPermissions?: TeamPermissions) => Promise<boolean>;
}

const roleLabels: Record<TeamRole, { label: string; description: string }> = {
  owner: { label: "Owner", description: "จัดการได้ทุกอย่าง รวมถึงลบทีม" },
  admin: { label: "Admin", description: "จัดการทีมและสมาชิกได้" },
  editor: { label: "Editor", description: "สร้างและแก้ไข Campaigns/Prospects" },
  viewer: { label: "Viewer", description: "ดูข้อมูลได้อย่างเดียว" },
};

export function InviteMemberDialog({ open, onOpenChange, onInvite }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("viewer");
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<TeamPermissions>(defaultRolePermissions.viewer);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: TeamRole) => {
    setRole(newRole);
    if (!useCustomPermissions) {
      setCustomPermissions(defaultRolePermissions[newRole]);
    }
  };

  const handlePermissionChange = (key: keyof TeamPermissions, value: boolean) => {
    setCustomPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    const success = await onInvite(
      email,
      role,
      useCustomPermissions ? customPermissions : undefined
    );
    setLoading(false);

    if (success) {
      setEmail("");
      setRole("viewer");
      setUseCustomPermissions(false);
      setCustomPermissions(defaultRolePermissions.viewer);
      setIsAdvancedOpen(false);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("viewer");
    setUseCustomPermissions(false);
    setCustomPermissions(defaultRolePermissions.viewer);
    setIsAdvancedOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            เชิญสมาชิกใหม่
          </DialogTitle>
          <DialogDescription>
            ส่งคำเชิญเข้าร่วมทีมผ่านอีเมล
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>บทบาท (Role)</Label>
            <Select value={role} onValueChange={(v) => handleRoleChange(v as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(roleLabels) as [TeamRole, typeof roleLabels[TeamRole]][])
                  .filter(([key]) => key !== "owner")
                  .map(([key, { label, description }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <span className="flex items-center gap-2 text-sm">
                  <Settings2 className="h-4 w-4" />
                  ตั้งค่าสิทธิ์เฉพาะบุคคล
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>ใช้สิทธิ์เฉพาะบุคคล</Label>
                  <p className="text-xs text-muted-foreground">
                    แทนที่สิทธิ์เริ่มต้นของ Role
                  </p>
                </div>
                <Switch
                  checked={useCustomPermissions}
                  onCheckedChange={setUseCustomPermissions}
                />
              </div>

              {useCustomPermissions && (
                <div className="space-y-2 rounded-lg border p-3">
                  {(Object.entries(permissionLabels) as [keyof TeamPermissions, string][]).map(
                    ([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm font-normal">{label}</Label>
                        <Switch
                          checked={customPermissions[key]}
                          onCheckedChange={(v) => handlePermissionChange(key, v)}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!email || loading}>
            {loading ? "กำลังส่ง..." : "ส่งคำเชิญ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
