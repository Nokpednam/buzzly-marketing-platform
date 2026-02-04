import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  Link2,
  Unlink,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePlatformsDB } from "@/hooks/usePlatformsDB";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const statusConfig = {
  connected: {
    label: "เชื่อมต่อแล้ว",
    icon: CheckCircle2,
    className: "bg-accent text-accent-foreground",
  },
  error: {
    label: "ข้อผิดพลาด",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
  disconnected: {
    label: "ยังไม่เชื่อมต่อ",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
};

export function PlatformConnectionsTab() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, hasTeam } = useWorkspace();
  const {
    platforms,
    loading: platformsLoading,
    connectPlatform,
    disconnectPlatform,
    refreshPlatformStatus,
  } = usePlatformsDB(workspace.id);

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    await connectPlatform(platformId);
    setConnecting(null);
  };

  const handleDisconnect = async (platformId: string) => {
    await disconnectPlatform(platformId);
  };

  const handleRefresh = async (platformId: string) => {
    await refreshPlatformStatus(platformId);
  };

  const connectedCount = platforms.filter((p) => p.status === "connected").length;
  const isLoading = workspaceLoading || platformsLoading;

  // No workspace
  if (!workspaceLoading && !hasTeam) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">ยังไม่มี Workspace</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            กรุณาสร้าง Workspace ก่อนในแท็บ Workspace เพื่อเริ่มเชื่อมต่อ Platform
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Platform Connections</h3>
          <p className="text-sm text-muted-foreground">
            เชื่อมต่อแพลตฟอร์มโฆษณาเพื่อดึงข้อมูลเข้าระบบ
          </p>
        </div>
        <Badge variant="outline">
          {connectedCount} / {platforms.length} เชื่อมต่อแล้ว
        </Badge>
      </div>

      {/* Platform Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const status = statusConfig[platform.status];
          const StatusIcon = status.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {platform.icon_url ? (
                        <img
                          src={platform.icon_url}
                          alt={platform.name}
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Key className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      {platform.category_name && (
                        <p className="text-xs text-muted-foreground">{platform.category_name}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={status.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {platform.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {platform.description}
                  </p>
                )}

                {platform.lastSync && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Last sync: {platform.lastSync}
                  </p>
                )}

                {platform.error && (
                  <p className="text-xs text-destructive mb-3">
                    Error: {platform.error}
                  </p>
                )}

                <div className="flex gap-2">
                  {platform.status === "connected" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRefresh(platform.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยกเลิกการเชื่อมต่อ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณต้องการยกเลิกการเชื่อมต่อ {platform.name} ใช่หรือไม่?
                              ข้อมูลที่ซิงค์ไว้จะยังคงอยู่ แต่จะไม่อัปเดตอีกต่อไป
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDisconnect(platform.id)}>
                              ยืนยัน
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      {isConnecting ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Link to API Keys page for advanced management */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">จัดการ API Keys ขั้นสูง</p>
            <p className="text-sm text-muted-foreground">
              แก้ไข Token, ดูสถานะการซิงค์, และจัดการการเชื่อมต่อแบบละเอียด
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/api-keys")}>
            <Key className="h-4 w-4 mr-2" />
            ไปหน้า API Keys
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
