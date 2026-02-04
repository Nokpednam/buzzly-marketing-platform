import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  Link2,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePlatformsDB } from "@/hooks/usePlatformsDB";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  connected: {
    label: "Connected",
    icon: CheckCircle2,
    className: "bg-accent text-accent-foreground",
  },
  error: {
    label: "Error",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
  disconnected: {
    label: "Disconnected",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
};

export default function APIKeys() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, hasTeam } = useWorkspace();
  const {
    platforms,
    loading: platformsLoading,
    connectPlatform,
    disconnectPlatform,
    updatePlatformToken,
    refreshPlatformStatus,
  } = usePlatformsDB(workspace.id);

  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleUpdateKey = async (platformId: string) => {
    if (!newToken) return;
    await updatePlatformToken(platformId, newToken);
    setEditingPlatformId(null);
    setNewToken("");
  };

  const handleDeleteKey = async (platformId: string) => {
    await disconnectPlatform(platformId);
  };

  const handleRefreshStatus = async (platformId: string) => {
    await refreshPlatformStatus(platformId);
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    await connectPlatform(platformId);
    setConnecting(null);
  };

  const connectedCount = platforms.filter((p) => p.status === "connected").length;
  const errorCount = platforms.filter((p) => p.status === "error").length;
  const disconnectedCount = platforms.filter((p) => p.status === "disconnected").length;

  const isLoading = workspaceLoading || platformsLoading;

  // No workspace - prompt to create
  if (!workspaceLoading && !hasTeam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys Management</h1>
          <p className="text-muted-foreground">
            Connect and manage your platform integrations
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มี Workspace</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              คุณต้องสร้าง Workspace ก่อนจึงจะสามารถเชื่อมต่อ Platform ต่างๆ ได้
            </p>
            <Button onClick={() => navigate("/settings")}>
              <Building2 className="h-4 w-4 mr-2" />
              ไปสร้าง Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys Management</h1>
          <p className="text-muted-foreground">
            Connect and manage your platform integrations
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys Management</h1>
          <p className="text-muted-foreground">
            Connect and manage your platform integrations
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Building2 className="h-3 w-3 mr-1" />
          {workspace.name}
        </Badge>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{connectedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-muted-foreground">Error</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{errorCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Disconnected</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{disconnectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Platform Connections</CardTitle>
          <CardDescription>Manage your API keys and access tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ไม่พบ Platform ที่สามารถเชื่อมต่อได้</p>
            </div>
          ) : (
            <div className="space-y-4">
              {platforms.map((platform) => {
                const status = statusConfig[platform.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
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
                          <Key className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{platform.name}</p>
                          <Badge className={status.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          {platform.category_name && (
                            <Badge variant="outline" className="text-xs">
                              {platform.category_name}
                            </Badge>
                          )}
                        </div>
                        {platform.accessToken && (
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {visibleTokens.includes(platform.id)
                                ? platform.accessToken
                                : "••••••••••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleTokenVisibility(platform.id)}
                            >
                              {visibleTokens.includes(platform.id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                        {platform.lastSync && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last sync: {platform.lastSync}
                          </p>
                        )}
                        {platform.error && (
                          <p className="text-xs text-destructive mt-1">Error: {platform.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {platform.status === "connected" ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRefreshStatus(platform.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={editingPlatformId === platform.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingPlatformId(null);
                                setNewToken("");
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingPlatformId(platform.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit {platform.name} API Key</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label>Access Token / API Key</Label>
                                  <Input
                                    type="password"
                                    value={newToken}
                                    onChange={(e) => setNewToken(e.target.value)}
                                    placeholder="Enter new API key"
                                  />
                                </div>
                              </div>
                              <DialogFooter className="mt-6">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingPlatformId(null);
                                    setNewToken("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={() => handleUpdateKey(platform.id)}>
                                  Update Key
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the {platform.name} API key? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteKey(platform.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleConnect(platform.id)}
                          disabled={connecting === platform.id}
                        >
                          {connecting === platform.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                          {connecting === platform.id ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
