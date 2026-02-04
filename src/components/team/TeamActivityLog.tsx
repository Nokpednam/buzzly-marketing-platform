import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  Shield,
  Mail,
  MailX,
  Settings,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { TeamActivityLog as ActivityLogType } from "@/hooks/useTeamManagement";

interface TeamActivityLogProps {
  logs: ActivityLogType[];
}

const actionConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  invitation_sent: {
    label: "ส่งคำเชิญ",
    icon: Mail,
    color: "text-info",
  },
  invitation_cancelled: {
    label: "ยกเลิกคำเชิญ",
    icon: MailX,
    color: "text-warning",
  },
  invitation_accepted: {
    label: "ยอมรับคำเชิญ",
    icon: UserPlus,
    color: "text-success",
  },
  invitation_declined: {
    label: "ปฏิเสธคำเชิญ",
    icon: UserMinus,
    color: "text-muted-foreground",
  },
  member_role_changed: {
    label: "เปลี่ยน Role",
    icon: Shield,
    color: "text-primary",
  },
  member_permissions_updated: {
    label: "อัพเดทสิทธิ์",
    icon: Settings,
    color: "text-primary",
  },
  member_suspended: {
    label: "ระงับสมาชิก",
    icon: UserX,
    color: "text-destructive",
  },
  member_reactivated: {
    label: "เปิดใช้งานใหม่",
    icon: UserCheck,
    color: "text-success",
  },
  member_removed: {
    label: "ลบสมาชิก",
    icon: UserMinus,
    color: "text-destructive",
  },
};

export function TeamActivityLog({ logs }: TeamActivityLogProps) {
  const getActionDisplay = (action: string) => {
    return (
      actionConfig[action] || {
        label: action,
        icon: Activity,
        color: "text-muted-foreground",
      }
    );
  };

  const formatDetails = (log: ActivityLogType) => {
    const details = log.details as Record<string, unknown> | null;
    
    if (log.action === "member_role_changed" && details) {
      return `${details.old_role} → ${details.new_role}`;
    }
    
    if (log.target_email) {
      return log.target_email;
    }
    
    return null;
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {logs.map((log) => {
          const { label, icon: Icon, color } = getActionDisplay(log.action);
          const details = formatDetails(log);

          return (
            <Card key={log.id} className="border-0 shadow-none bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-background ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                      {details && (
                        <span className="text-sm text-muted-foreground truncate">
                          {details}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>โดย {log.actor?.full_name || log.actor?.email || "System"}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: th })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            ยังไม่มีประวัติกิจกรรม
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
