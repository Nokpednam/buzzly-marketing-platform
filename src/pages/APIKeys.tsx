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
  ShieldCheck,
  Activity,
  ChevronRight,
  Rocket,
  Lock,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  } = usePlatformConnections();
  const { state } = useOnboardingGuard();

  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);

  const isLoading = workspaceLoading || platformsLoading;

  if (isLoading) return <LoadingState />;
  if (state !== "ready") {
    return <OnboardingStepper state={state} hasTeam={hasTeam} navigate={navigate} />;
  }

  const stats = {
    connected: platforms.filter((p) => p.status === "connected").length,
    error: platforms.filter((p) => p.status === "error").length,
    total: platforms.length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      {/* 1. HEADER & SECURITY INFO */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Secure Credential Vault
          </div>
          <h1 className="text-4xl font-black tracking-tighter">INTEGRATIONS</h1>
          <p className="text-muted-foreground italic">Manage access tokens and API bridges for <span className="text-foreground font-semibold">{workspace.name}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background shadow-sm border">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-bold">{stats.connected}/{stats.total} Linked</span>
          </div>
          <Badge variant="outline" className="h-8 rounded-lg bg-background border-none shadow-none">
            <Building2 className="h-3 w-3 mr-1.5" /> {workspace.name}
          </Badge>
        </div>
      </div>

      {/* 2. INTEGRATION LIST */}
      <div id="integrations-list" className="grid grid-cols-1 gap-4">
        {platforms.length === 0 ? (
          <EmptyState />
        ) : (
          platforms.map((platform) => {
            const status = statusConfig[platform.status];
            const isVisible = visibleTokens.includes(platform.id);

            return (
              <Card
                key={platform.id}
                className={cn(
                  "group transition-all duration-300 border-l-4 overflow-hidden",
                  platform.status === 'connected' ? "border-l-emerald-500 shadow-sm" : "border-l-transparent"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Platform Brand Section */}
                    <div className="p-6 md:w-64 bg-muted/20 flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r space-y-3">
                      <div className="h-16 w-16 rounded-2xl bg-background shadow-xl flex items-center justify-center p-3 relative group-hover:scale-105 transition-transform">
                        {platform.icon ? (
                          <platform.icon className="h-full w-full" />
                        ) : platform.icon_url ? (
                          <img src={platform.icon_url} alt={platform.name} className="h-full w-full object-contain" />
                        ) : (
                          <Key className="h-8 w-8 text-muted-foreground/40" />
                        )}
                        {platform.status === 'connected' && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                        )}
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="font-black text-lg uppercase tracking-tighter">{platform.name}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-background/50">{platform.category_name || "Service"}</Badge>
                      </div>
                    </div>

                    {/* Credential & Status Section */}
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", status.bg, status.color, status.border, "border")}>
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </div>
                        {platform.lastSync && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3" /> Sync: {platform.lastSync}
                          </span>
                        )}
                      </div>

                      {platform.accessToken ? (
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Token</Label>
                          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border group-hover:bg-muted/50 transition-colors">
                            <code className="flex-1 font-mono text-sm truncate">
                              {isVisible ? platform.accessToken : "•".repeat(24)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-background"
                              onClick={() => setVisibleTokens(prev =>
                                isVisible ? prev.filter(i => i !== platform.id) : [...prev, platform.id]
                              )}
                            >
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <p className="text-xs font-medium text-amber-700">Action Required: Establish connection to sync marketing data.</p>
                        </div>
                      )}

                      {platform.error && (
                        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                          <p className="text-[10px] font-medium text-destructive leading-normal">ERROR: {platform.error}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="p-6 md:border-l flex md:flex-col items-center justify-center gap-2 bg-muted/10">
                      {platform.status === "connected" ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleRefreshStatus(platform.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <EditAction platform={platform} handleUpdateKey={handleUpdateKey} newToken={newToken} setNewToken={setNewToken} editingPlatformId={editingPlatformId} setEditingPlatformId={setEditingPlatformId} />
                          <DeleteAction platform={platform} handleDeleteKey={handleDeleteKey} />
                        </>
                      ) : (
                        <Button
                          className="w-full md:w-auto px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                          onClick={() => handleConnect(platform.id)}
                          disabled={connecting === platform.id}
                        >
                          {connecting === platform.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Link2 className="h-4 w-4 mr-2" />
                          )}
                          {connecting === platform.id ? "Linking..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  // -- INTERNAL HELPERS --

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
    await connectPlatform(platformId);
    setConnecting(null);
  }
}

// -- ONBOARDING STEPPER --

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
      description:
        "Set up your workspace to organize your team, campaigns, and integrations. This is the foundation for everything in Buzzly.",
      status: step1Status,
      buttonLabel: "Go to Workspace Settings",
      buttonDisabled: false,
      onAction: () => navigate("/settings?tab=workspace"),
      icon: Building2,
    },
    {
      number: 2,
      title: "Connect Your First Platform",
      description:
        "Link your marketing platform (e.g., Facebook Ads, Google Ads) to start syncing campaign data and insights.",
      status: step2Status,
      buttonLabel: !hasTeam ? "Complete Step 1 first" : "Set Up Integration",
      buttonDisabled: !hasTeam,
      disabledHint: !hasTeam ? "Complete Step 1 first" : undefined,
      onAction: () => {
        const el = document.getElementById("integrations-list");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      icon: Link2,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
          <Rocket className="h-4 w-4" /> Getting Started
        </div>
        <h1 className="text-3xl font-black tracking-tighter">Welcome to Buzzly</h1>
        <p className="text-muted-foreground">
          Let's get you set up in 2 quick steps before you can access your dashboard.
        </p>
      </div>

      {/* Steps */}
      <Card className="rounded-3xl border shadow-lg overflow-hidden">
        <CardContent className="p-8 space-y-0">
          {steps.map((step, idx) => (
            <StepRow key={step.number} step={step} isLast={idx === steps.length - 1} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StepRow({ step, isLast }: { step: Step; isLast: boolean }) {
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";
  const isLocked = step.status === "locked";

  return (
    <div className="flex gap-6">
      {/* Number + connector line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2 transition-colors",
            isCompleted && "bg-emerald-500 border-emerald-500 text-white",
            isCurrent && "bg-primary border-primary text-primary-foreground",
            isLocked && "bg-muted border-border text-muted-foreground"
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isLocked ? <Lock className="h-4 w-4" /> : step.number}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 my-2 min-h-[2.5rem]",
              isCompleted ? "bg-emerald-500/40" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-8 flex-1", isLast && "pb-0")}>
        <div className="flex items-center gap-3 mb-1">
          <h3
            className={cn(
              "font-black text-base uppercase tracking-tight",
              isLocked && "text-muted-foreground",
              isCompleted && "text-muted-foreground"
            )}
          >
            {step.title}
          </h3>
          {isCompleted && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase tracking-widest font-bold">
              Completed
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-sm mb-4 leading-relaxed",
            isLocked || isCompleted ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {step.description}
        </p>
        {!isCompleted && (
          <Button
            disabled={step.buttonDisabled}
            onClick={step.onAction}
            className={cn(
              "rounded-xl transition-all",
              isCurrent && "shadow-lg shadow-primary/20 hover:scale-[1.02]",
              isLocked && "opacity-50 cursor-not-allowed"
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
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Sub-components for cleaner structure

function EditAction({ platform, handleUpdateKey, newToken, setNewToken, editingPlatformId, setEditingPlatformId }: any) {
  return (
    <Dialog open={editingPlatformId === platform.id} onOpenChange={(open) => !open && setEditingPlatformId(null)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setEditingPlatformId(platform.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">UPDATE CREDENTIALS</DialogTitle>
          <CardDescription>Rotate or update your API key for {platform.name}.</CardDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Access Token</Label>
            <Input type="password" value={newToken} onChange={(e) => setNewToken(e.target.value)} placeholder="Paste new key here..." className="h-12 rounded-xl bg-muted/50 border-none focus:ring-2" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditingPlatformId(null)}>Cancel</Button>
          <Button className="rounded-xl px-8" onClick={() => handleUpdateKey(platform.id)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAction({ platform, handleDeleteKey }: any) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black">REVOKE ACCESS?</AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect {platform.name} and pause all data synchronization. This action is immediate and secure.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-none">Keep Integration</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteKey(platform.id)} className="rounded-xl bg-destructive hover:bg-destructive/90">
            Revoke Keys
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LoadingState() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 flex-1 rounded-2xl" />)}
      </div>
      <div className="space-y-4 pt-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    </div>
  );
}

function NoWorkspaceState({ navigate }: { navigate: any }) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed rounded-[3rem] bg-muted/10">
      <div className="bg-background p-6 rounded-full shadow-xl mb-6"><Building2 className="h-10 w-10 text-primary" /></div>
      <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Workspace Required</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">Establish your workspace environment first to begin linking external marketing platforms.</p>
      <Button onClick={() => navigate("/settings?tab=workspace")} size="lg" className="rounded-full px-10 shadow-lg shadow-primary/20">
        Setup Workspace <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-muted/30 rounded-[3rem] border border-dashed flex flex-col items-center">
      <Link2 className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <p className="font-bold text-muted-foreground">No supported platforms available in your region.</p>
    </div>
  );
}