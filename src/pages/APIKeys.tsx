import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronRight,
  Lock,
  FlaskConical,
  MoreVertical,
  Plus,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { KEYS_BY_PLATFORM } from "@/lib/mockApiKeys";
import type { Platform } from "@/hooks/usePlatformConnections";

const statusConfig = {
  connected: {
    label: "Active",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  error: {
    label: "System Error",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  disconnected: {
    label: "Inactive",
    icon: AlertCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
};

const PLATFORM_DESCRIPTIONS: Record<string, string> = {
  facebook: "Connect Facebook Ads to sync campaign data, ad insights, and audience analytics.",
  instagram: "Connect Instagram to sync marketing analytics and engagement metrics.",
  tiktok: "Connect TikTok Ads for campaign performance and creative analytics.",
  shopee: "Connect Shopee for e-commerce analytics and ads performance data.",
  google: "Connect Google Ads for search and display campaign data and conversions.",
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
    refetch,
  } = usePlatformConnections();
  const { state } = useOnboardingGuard();
  const { data: members = [] } = useWorkspaceMembers();

  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "status" | "lastSync">("name");

  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = workspaceLoading || platformsLoading;

  if (isLoading) return <LoadingState />;

  if (state === "no_workspace") {
    return <OnboardingStepper state={state} hasTeam={hasTeam} navigate={navigate} />;
  }

  const categories = ["All", ...Array.from(new Set(platforms.map((p) => p.category_name || "Other").filter(Boolean)))];
  const filteredPlatforms = platforms
    .filter((p) => categoryFilter === "All" || (p.category_name || "Other") === categoryFilter)
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "status") return (a.status === "connected" ? 0 : 1) - (b.status === "connected" ? 0 : 1);
      return 0;
    });

  const connectedPlatforms = filteredPlatforms.filter((p) => p.status === "connected");
  const inactivePlatforms = filteredPlatforms.filter((p) => p.status !== "connected");

  return (
    <div className="space-y-6">
      {/* 0. ONBOARDING STEPPER */}
      {state === "no_platform" && (
        <div className="mb-8">
          <OnboardingStepper state={state} hasTeam={hasTeam} navigate={navigate} />
        </div>
      )}

      {/* 1. PAGE HEADER — Apps integration style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
            <p className="text-sm text-muted-foreground">Manage platform integrations and credentials</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate("/settings")}>Workspace Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById("integrations-list")?.scrollIntoView({ behavior: "smooth" })}>
                View Integrations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-muted">
                  {(m.fullName || m.email || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter("All")}>All categories</DropdownMenuItem>
              {categories.filter((c) => c !== "All").map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCategoryFilter(c)}>
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("status")}>Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("lastSync")}>Last sync</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. SECTION TITLE + CATEGORY PILLS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full shrink-0",
                  categoryFilter === cat && "bg-muted-foreground/15 text-foreground"
                )}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* 3. INTEGRATIONS — sectioned: connected first, then available */}
      <div id="integrations-list" className="space-y-8">
        {filteredPlatforms.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Connected — expanded cards at top */}
            {connectedPlatforms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Connected ({connectedPlatforms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedPlatforms.map((platform) => (
                    <IntegrationCard
                      key={platform.id}
                      platform={platform}
                      visibleTokens={visibleTokens}
                      setVisibleTokens={setVisibleTokens}
                      openFormId={openFormId}
                      setOpenFormId={setOpenFormId}
                      apiKeyInputs={apiKeyInputs}
                      setApiKeyInputs={setApiKeyInputs}
                      connecting={connecting}
                      editingPlatformId={editingPlatformId}
                      setEditingPlatformId={setEditingPlatformId}
                      newToken={newToken}
                      setNewToken={setNewToken}
                      onConnect={handleConnect}
                      onUpdateKey={handleUpdateKey}
                      onDeleteKey={handleDeleteKey}
                      onRefreshStatus={handleRefreshStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available — compact grid */}
            {inactivePlatforms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {connectedPlatforms.length > 0 ? "Connect more" : "Available platforms"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {inactivePlatforms.map((platform) => (
                    <IntegrationCard
                      key={platform.id}
                      platform={platform}
                      visibleTokens={visibleTokens}
                      setVisibleTokens={setVisibleTokens}
                      openFormId={openFormId}
                      setOpenFormId={setOpenFormId}
                      apiKeyInputs={apiKeyInputs}
                      setApiKeyInputs={setApiKeyInputs}
                      connecting={connecting}
                      editingPlatformId={editingPlatformId}
                      setEditingPlatformId={setEditingPlatformId}
                      newToken={newToken}
                      setNewToken={setNewToken}
                      onConnect={handleConnect}
                      onUpdateKey={handleUpdateKey}
                      onDeleteKey={handleDeleteKey}
                      onRefreshStatus={handleRefreshStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  async function handleUpdateKey(platformId: string) {
    if (!newToken) return;
    await updatePlatformToken(platformId, newToken);
    setEditingPlatformId(null);
    setNewToken("");
  }

  async function handleDeleteKey(platformId: string) {
    await disconnectPlatform(platformId);
  }

  async function handleRefreshStatus(platformId: string) {
    await refreshPlatformStatus(platformId);
  }

  async function handleConnect(platformId: string) {
    setConnecting(platformId);
    const key = apiKeyInputs[platformId]?.trim() || undefined;
    await connectPlatform(platformId, key);
    setConnecting(null);
    setOpenFormId(null);
    setApiKeyInputs((prev) => {
      const next = { ...prev };
      delete next[platformId];
      return next;
    });
  }
}

interface IntegrationCardProps {
  platform: Platform;
  visibleTokens: string[];
  setVisibleTokens: React.Dispatch<React.SetStateAction<string[]>>;
  openFormId: string | null;
  setOpenFormId: React.Dispatch<React.SetStateAction<string | null>>;
  apiKeyInputs: Record<string, string>;
  setApiKeyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  connecting: string | null;
  editingPlatformId: string | null;
  setEditingPlatformId: React.Dispatch<React.SetStateAction<string | null>>;
  newToken: string;
  setNewToken: React.Dispatch<React.SetStateAction<string>>;
  onConnect: (id: string) => Promise<void>;
  onUpdateKey: (id: string) => Promise<void>;
  onDeleteKey: (id: string) => Promise<void>;
  onRefreshStatus: (id: string) => Promise<void>;
}

function IntegrationCard({
  platform,
  visibleTokens,
  setVisibleTokens,
  openFormId,
  setOpenFormId,
  apiKeyInputs,
  setApiKeyInputs,
  connecting,
  editingPlatformId,
  setEditingPlatformId,
  newToken,
  setNewToken,
  onConnect,
  onUpdateKey,
  onDeleteKey,
  onRefreshStatus,
}: IntegrationCardProps) {
  const status = statusConfig[platform.status];
  const isVisible = visibleTokens.includes(platform.id);
  const description = PLATFORM_DESCRIPTIONS[platform.slug ?? ""] ?? `Connect ${platform.name} to sync data.`;
  const isConnected = platform.status === "connected";

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md",
        isConnected && "min-h-[220px]"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden p-2">
            {platform.icon ? (
              <platform.icon className="h-8 w-8 shrink-0" id={platform.id} />
            ) : platform.icon_url ? (
              <img src={platform.icon_url} alt={platform.name} className="h-8 w-8 object-contain" />
            ) : (
              <Key className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {platform.status === "connected" ? (
            <Badge className="shrink-0 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-medium px-2 py-0.5">
              Active
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full border bg-background hover:bg-muted"
              onClick={() => setOpenFormId((prev) => (prev === platform.id ? null : platform.id))}
              disabled={connecting === platform.id}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <h3 className="font-semibold text-base mb-1">{platform.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="text-[10px] font-medium rounded-md">
            {platform.category_name || "Service"}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] rounded-md", status.color)}>
            {status.label}
          </Badge>
        </div>

        {platform.accessToken && (
          <div className="space-y-1.5 mb-3">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Token</Label>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <code className="flex-1 truncate text-xs font-mono">
                {isVisible ? platform.accessToken : "•".repeat(20)}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() =>
                  setVisibleTokens((prev) =>
                    isVisible ? prev.filter((i) => i !== platform.id) : [...prev, platform.id]
                  )
                }
              >
                {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        )}

        {openFormId === platform.id && platform.status !== "connected" && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase">API Key</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste API key..."
                value={apiKeyInputs[platform.id] ?? ""}
                onChange={(e) => setApiKeyInputs((prev) => ({ ...prev, [platform.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && connecting !== platform.id && onConnect(platform.id)}
                className="h-9 text-xs rounded-lg"
                disabled={connecting === platform.id}
              />
              <Button
                size="sm"
                className="h-9 shrink-0"
                onClick={() => onConnect(platform.id)}
                disabled={connecting === platform.id}
              >
                {connecting === platform.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
              </Button>
            </div>
            {import.meta.env.DEV && (KEYS_BY_PLATFORM[platform.slug ?? ""] ?? []).length > 0 && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2 space-y-1">
                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <FlaskConical className="h-3 w-3" /> Dev keys
                </p>
                {(KEYS_BY_PLATFORM[platform.slug ?? ""] ?? []).map((hint) => (
                  <button
                    key={hint.key}
                    type="button"
                    className="block w-full text-left"
                    onClick={() => setApiKeyInputs((prev) => ({ ...prev, [platform.id]: hint.key }))}
                  >
                    <code className="text-[10px] text-amber-800 dark:text-amber-300 font-mono">{hint.key}</code>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {platform.status === "connected" && (
          <div className="flex items-center gap-1 pt-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onRefreshStatus(platform.id)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <EditAction
              platform={platform}
              handleUpdateKey={onUpdateKey}
              newToken={newToken}
              setNewToken={setNewToken}
              editingPlatformId={editingPlatformId}
              setEditingPlatformId={setEditingPlatformId}
            />
            <DeleteAction platform={platform} handleDeleteKey={onDeleteKey} />
          </div>
        )}

        {platform.error && (
          <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-[10px] text-destructive">{platform.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EditAction({
  platform,
  handleUpdateKey,
  newToken,
  setNewToken,
  editingPlatformId,
  setEditingPlatformId,
}: {
  platform: Platform;
  handleUpdateKey: (id: string) => Promise<void>;
  newToken: string;
  setNewToken: React.Dispatch<React.SetStateAction<string>>;
  editingPlatformId: string | null;
  setEditingPlatformId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <Dialog open={editingPlatformId === platform.id} onOpenChange={(open) => !open && setEditingPlatformId(null)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingPlatformId(platform.id)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Update credentials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New access token</Label>
            <Input
              type="password"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              placeholder="Paste new key..."
              className="rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditingPlatformId(null)}>
            Cancel
          </Button>
          <Button onClick={() => handleUpdateKey(platform.id)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAction({
  platform,
  handleDeleteKey,
}: {
  platform: Platform;
  handleDeleteKey: (id: string) => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke access?</AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect {platform.name} and pause data sync.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteKey(platform.id)} className="bg-destructive hover:bg-destructive/90">
            Revoke
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── ONBOARDING STEPPER ─────────────────────────────────────────────────────

type StepStatus = "completed" | "current" | "locked";

interface Step {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
  buttonLabel: string;
  buttonDisabled: boolean;
  disabledHint?: string;
  onAction: () => void;
  icon: React.ElementType;
}

function OnboardingStepper({
  state,
  hasTeam,
  navigate,
}: {
  state: string;
  hasTeam: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const step1Status: StepStatus = hasTeam ? "completed" : "current";
  const step2Status: StepStatus = !hasTeam ? "locked" : "current";

  const steps: Step[] = [
    {
      number: 1,
      title: "Create Your Workspace",
      description: "Set up your workspace to organize your team, campaigns, and integrations.",
      status: step1Status,
      buttonLabel: "Go to Workspace Settings",
      buttonDisabled: false,
      onAction: () => navigate("/settings?tab=workspace"),
      icon: Building2,
    },
    {
      number: 2,
      title: "Connect Your First Platform",
      description: "Link your marketing platform to start syncing campaign data and insights.",
      status: step2Status,
      buttonLabel: !hasTeam ? "Complete Step 1 first" : "Set Up Integration",
      buttonDisabled: !hasTeam,
      disabledHint: !hasTeam ? "Complete Step 1 first" : undefined,
      onAction: () => {
        document.getElementById("integrations-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      icon: Link2,
    },
  ];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-8 overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 border border-border/50">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse delay-2000" />

      <div className="max-w-3xl w-full relative z-10 space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-md text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Getting Started
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
            SETUP BUZZLY.
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-lg mx-auto font-medium">
            Complete these two steps to unlock your intelligent dashboard.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000" />
          <Card className="relative rounded-[3rem] border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden pt-8 pb-4">
            <CardContent className="p-8 md:p-12 space-y-0 relative z-10">
              {steps.map((step, idx) => (
                <StepRow key={step.number} step={step} isLast={idx === steps.length - 1} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepRow({ step, isLast }: { step: Step; isLast: boolean }) {
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";
  const isLocked = step.status === "locked";

  return (
    <div className={cn("flex gap-8 group/step transition-all duration-500", isCurrent ? "opacity-100" : "opacity-60")}>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 border-2 transition-all duration-500",
            isCompleted && "bg-emerald-500 border-emerald-500 text-white",
            isCurrent && "bg-gradient-to-br from-indigo-500 to-cyan-500 border-transparent text-white shadow-xl scale-110",
            isLocked && "bg-muted/50 border-border/50 text-muted-foreground"
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5 opacity-50" /> : step.number}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 my-4 min-h-[3rem]",
              isCompleted ? "bg-emerald-500/30" : "bg-border/60"
            )}
          />
        )}
      </div>
      <div className={cn("pb-10 flex-1", isCurrent && "translate-x-2", isLast && "pb-0")}>
        <div className="flex items-center gap-4 mb-2">
          <h3
            className={cn(
              "font-black text-2xl uppercase tracking-tighter",
              isLocked && "text-muted-foreground",
              isCompleted && "text-muted-foreground line-through decoration-2 decoration-emerald-500/30",
              isCurrent && "text-foreground"
            )}
          >
            {step.title}
          </h3>
          {isCompleted && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs uppercase font-bold px-3 py-1">
              Done
            </Badge>
          )}
        </div>
        <p className={cn("text-base md:text-lg mb-6 leading-relaxed max-w-xl font-medium", (isLocked || isCompleted) && "text-muted-foreground/60")}>
          {step.description}
        </p>
        {!isCompleted && (
          <Button
            disabled={step.buttonDisabled}
            onClick={step.onAction}
            size="lg"
            className={cn(
              "rounded-2xl font-bold tracking-wide uppercase text-xs h-12 px-8",
              isCurrent && "bg-foreground text-background shadow-xl hover:scale-105",
              isLocked && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
            )}
            variant={isCurrent ? "default" : "outline"}
          >
            {step.buttonDisabled ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {step.buttonLabel}
              </>
            ) : (
              <>
                <step.icon className="h-4 w-4 mr-2" />
                {step.buttonLabel}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed flex flex-col items-center">
      <Link2 className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <p className="font-bold text-muted-foreground">No platforms available in this category.</p>
    </div>
  );
}
