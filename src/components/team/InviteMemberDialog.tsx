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
  owner: { label: "Owner", description: "Full access, including deleting the team" },
  admin: { label: "Admin", description: "Manage team and members" },
  editor: { label: "Editor", description: "Create and edit Campaigns/Prospects" },
  viewer: { label: "Viewer", description: "View-only access" },
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
            Invite new member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join the team via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
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
                  Set custom permissions
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Use custom permissions</Label>
                  <p className="text-xs text-muted-foreground">
                    Override default role permissions
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
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!email || loading}>
            {loading ? "Sending..." : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
