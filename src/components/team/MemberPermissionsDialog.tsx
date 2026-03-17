import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, User } from "lucide-react";
import {
  TeamMember,
  TeamRole,
  TeamPermissions,
  defaultRolePermissions,
  permissionLabels,
} from "@/hooks/useTeamManagement";

interface MemberPermissionsDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRole: (memberId: string, role: TeamRole) => Promise<boolean>;
  onUpdatePermissions: (memberId: string, permissions: TeamPermissions) => Promise<boolean>;
  canEdit: boolean;
  isCurrentUser: boolean;
}

const roleLabels: Record<TeamRole, { label: string; color: string }> = {
  owner: { label: "Owner", color: "bg-primary text-primary-foreground" },
  admin: { label: "Admin", color: "bg-info text-info-foreground" },
  editor: { label: "Editor", color: "bg-warning text-warning-foreground" },
  viewer: { label: "Viewer", color: "bg-muted text-muted-foreground" },
};

export function MemberPermissionsDialog({
  member,
  open,
  onOpenChange,
  onUpdateRole,
  onUpdatePermissions,
  canEdit,
  isCurrentUser,
}: MemberPermissionsDialogProps) {
  const [role, setRole] = useState<TeamRole>("viewer");
  const [permissions, setPermissions] = useState<TeamPermissions>(defaultRolePermissions.viewer);
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      if (member.custom_permissions) {
        setPermissions(member.custom_permissions);
        setUseCustom(true);
      } else {
        setPermissions(defaultRolePermissions[member.role]);
        setUseCustom(false);
      }
    }
  }, [member]);

  const handleRoleChange = (newRole: TeamRole) => {
    setRole(newRole);
    if (!useCustom) {
      setPermissions(defaultRolePermissions[newRole]);
    }
  };

  const handlePermissionChange = (key: keyof TeamPermissions, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleCustom = (checked: boolean) => {
    setUseCustom(checked);
    if (!checked) {
      setPermissions(defaultRolePermissions[role]);
    }
  };

  const handleSave = async () => {
    if (!member) return;

    setLoading(true);

    // Update role if changed
    if (role !== member.role) {
      await onUpdateRole(member.id, role);
    }

    // Update permissions if using custom
    if (useCustom) {
      await onUpdatePermissions(member.id, permissions);
    } else if (member.custom_permissions) {
      // Clear custom permissions by setting to default
      await onUpdatePermissions(member.id, defaultRolePermissions[role]);
    }

    setLoading(false);
    onOpenChange(false);
  };

  if (!member) return null;

  const displayName = member.profile?.full_name || member.profile?.email || "Unknown Member";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage member permissions
          </DialogTitle>
          <DialogDescription>
            Set role and access permissions for this member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Info */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
            </div>
            <Badge className={roleLabels[member.role].color}>
              {roleLabels[member.role].label}
            </Badge>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => handleRoleChange(v as TeamRole)}
              disabled={!canEdit || member.role === "owner" || isCurrentUser}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(roleLabels) as [TeamRole, typeof roleLabels[TeamRole]][])
                  .filter(([key]) => key !== "owner")
                  .map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {(member.role === "owner" || isCurrentUser) && (
              <p className="text-xs text-muted-foreground">
                {member.role === "owner"
                  ? "Owner role cannot be changed"
                  : "You cannot change your own role"}
              </p>
            )}
          </div>

          <Separator />

          {/* Custom Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Custom permissions</Label>
                <p className="text-xs text-muted-foreground">
                  Override default role permissions
                </p>
              </div>
              <Switch
                checked={useCustom}
                onCheckedChange={handleToggleCustom}
                disabled={!canEdit || member.role === "owner"}
              />
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Permission</span>
                <span>{useCustom ? "Custom" : `Default (${roleLabels[role].label})`}</span>
              </div>
              {(Object.entries(permissionLabels) as [keyof TeamPermissions, string][]).map(
                ([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <Label className="text-sm font-normal">{label}</Label>
                    <Switch
                      checked={permissions[key]}
                      onCheckedChange={(v) => handlePermissionChange(key, v)}
                      disabled={!canEdit || !useCustom || member.role === "owner"}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {canEdit && member.role !== "owner" && !isCurrentUser && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
