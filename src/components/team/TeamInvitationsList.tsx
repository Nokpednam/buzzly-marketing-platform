import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react";
import { format, isPast } from "date-fns";
import { th } from "date-fns/locale";
import { TeamInvitation, TeamRole, InvitationStatus } from "@/hooks/useTeamManagement";

interface TeamInvitationsListProps {
  invitations: TeamInvitation[];
  canManage: boolean;
  onCancel: (invitationId: string) => Promise<boolean>;
}

const roleStyles: Record<TeamRole, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-primary text-primary-foreground" },
  admin: { label: "Admin", className: "bg-info text-info-foreground" },
  editor: { label: "Editor", className: "bg-warning text-warning-foreground" },
  viewer: { label: "Viewer", className: "bg-muted text-muted-foreground" },
};

const statusConfig: Record<InvitationStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "รอการตอบรับ",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  accepted: {
    label: "ยอมรับแล้ว",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-success/10 text-success border-success/20",
  },
  declined: {
    label: "ปฏิเสธ",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "หมดอายุ",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
};

export function TeamInvitationsList({
  invitations,
  canManage,
  onCancel,
}: TeamInvitationsListProps) {
  const getEffectiveStatus = (invitation: TeamInvitation): InvitationStatus => {
    if (invitation.status === "pending" && isPast(new Date(invitation.expires_at))) {
      return "expired";
    }
    return invitation.status;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>อีเมล</TableHead>
          <TableHead>บทบาท</TableHead>
          <TableHead>สิทธิ์</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead>เชิญโดย</TableHead>
          <TableHead>หมดอายุ</TableHead>
          {canManage && <TableHead className="w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => {
          const effectiveStatus = getEffectiveStatus(invitation);
          const statusInfo = statusConfig[effectiveStatus];
          const isExpired = effectiveStatus === "expired";
          const canCancel = canManage && effectiveStatus === "pending";

          return (
            <TableRow key={invitation.id} className={isExpired ? "opacity-60" : ""}>
              <TableCell className="font-medium">{invitation.email}</TableCell>
              <TableCell>
                <Badge className={roleStyles[invitation.role].className}>
                  {roleStyles[invitation.role].label}
                </Badge>
              </TableCell>
              <TableCell>
                {invitation.custom_permissions ? (
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    <Settings className="mr-1 h-3 w-3" />
                    Custom
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Default</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusInfo.className}>
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {invitation.inviter?.full_name || invitation.inviter?.email || "Unknown"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(invitation.expires_at), "d MMM yyyy HH:mm", { locale: th })}
              </TableCell>
              {canManage && (
                <TableCell>
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onCancel(invitation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {invitations.length === 0 && (
          <TableRow>
            <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8 text-muted-foreground">
              ยังไม่มีคำเชิญที่รอดำเนินการ
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
