import { useState, useEffect } from "react";
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
  FlaskConical,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { KEYS_BY_PLATFORM } from "@/lib/mockApiKeys";

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
    refetch,
  } = usePlatformConnections();
  const { state } = useOnboardingGuard();

  // Re-fetch platform connections every time this page is entered via SPA navigation.
  // PlatformConnectionsProvider fetches once on app-level mount and holds the result
  // in context — it does not re-fetch on route changes. Calling refetch() here ensures
  // the integration list is always current when the user lands on this page.
  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  // API key input form state (per platform)
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});

  const isLoading = workspaceLoading || platformsLoading;

  if (isLoading) return <LoadingState />;

  // ถ้าไม่มี workspace เลย (no_workspace) -> แสดง Stepper เต็มหน้าเหมือนเดิม
  if (state === "no_workspace") {
    return <OnboardingStepper state={state} hasTeam={hasTeam} navigate={navigate} />;
  }

  const stats = {
    connected: platforms.filter((p) => p.status === "connected").length,
    error: platforms.filter((p) => p.status === "error").length,
    total: platforms.length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      {/* 0. ONBOARDING STEPPER (ถ้ามี workspace แล้วแต่ยังไม่มี platform) */}
      {state === "no_platform" && (
        <div className="mb-12">
          <OnboardingStepper state={state} hasTeam={hasTeam} navigate={navigate} />
        </div>
      )}

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

                      {/* ── Inline API Key Form (expands on Connect click) ── */}
                      {openFormId === platform.id && platform.status !== "connected" && (
                        <div className="space-y-3 pt-2 border-t border-border/50">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            API Key — ใส่ Key เพื่อดึงข้อมูลจริง (ไม่ใส่ = demo data)
                          </p>
                          <div className="flex gap-2">
                            <Input
                              placeholder={`เช่น FB_TEST_KEY_SHOP_A`}
                              value={apiKeyInputs[platform.id] ?? ""}
                              onChange={e =>
                                setApiKeyInputs(prev => ({ ...prev, [platform.id]: e.target.value }))
                              }
                              onKeyDown={e => e.key === "Enter" && connecting !== platform.id && handleConnect(platform.id)}
                              className="h-10 font-mono text-xs rounded-xl bg-muted/50 border-border/50"
                              disabled={connecting === platform.id}
                            />
                            <Button
                              className="h-10 px-5 rounded-xl shrink-0"
                              onClick={() => handleConnect(platform.id)}
                              disabled={connecting === platform.id}
                            >
                              {connecting === platform.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </Button>
                          </div>

                          {/* Dev hints — only in development builds */}
                          {import.meta.env.DEV && (KEYS_BY_PLATFORM[platform.slug ?? ""] ?? []).length > 0 && (
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 space-y-1.5">
                              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                                <FlaskConical className="h-3 w-3" /> Dev — Valid Test Keys
                              </p>
                              {(KEYS_BY_PLATFORM[platform.slug ?? ""] ?? []).map(hint => (
                                <button
                                  key={hint.key}
                                  type="button"
                                  className="block w-full text-left"
                                  onClick={() =>
                                    setApiKeyInputs(prev => ({ ...prev, [platform.id]: hint.key }))
                                  }
                                >
                                  <code className="text-[11px] text-amber-800 dark:text-amber-300 hover:underline cursor-pointer font-mono">
                                    {hint.key}
                                  </code>
                                  <span className="text-[10px] text-amber-600 dark:text-amber-500 ml-2">
                                    — {hint.shopLabel}
                                  </span>
                                </button>
                              ))}
                              <p className="text-[10px] text-amber-600 dark:text-amber-500">
                                คลิก key เพื่อใส่อัตโนมัติ · Mock server ต้องรันที่ :3001
                              </p>
                            </div>
                          )}
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
                          className={cn(
                            "w-full md:w-auto px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]",
                            openFormId === platform.id && "bg-secondary text-secondary-foreground shadow-none hover:scale-100"
                          )}
                          variant={openFormId === platform.id ? "secondary" : "default"}
                          onClick={() => setOpenFormId(prev => prev === platform.id ? null : platform.id)}
                          disabled={connecting === platform.id}
                        >
                          {connecting === platform.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Link2 className="h-4 w-4 mr-2" />
                          )}
                          {connecting === platform.id ? "Linking..." : openFormId === platform.id ? "Cancel" : "Connect"}
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
    const key = apiKeyInputs[platformId]?.trim() || undefined;
    await connectPlatform(platformId, key);
    setConnecting(null);
    setOpenFormId(null);
    setApiKeyInputs(prev => { const next = { ...prev }; delete next[platformId]; return next; });
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
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      icon: Link2,
    },
  ];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-8 overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 border border-border/50">

      {/* MetaMask style ambient background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse delay-2000" />

      <div className="max-w-3xl w-full relative z-10 space-y-10">
        {/* Statement Header - MetaMask typography + Gamma structure */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-md text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Getting Started
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
            SETUP BUZZLY.
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-lg mx-auto font-medium">
            Let's build your foundation. Complete these two simple steps to unlock your intelligent dashboard.
          </p>
        </div>

        {/* Wizard Card - Gamma Glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />

          <Card className="relative rounded-[3rem] border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden pt-8 pb-4">
            <CardContent className="p-8 md:p-12 space-y-0 relative z-10">
              {steps.map((step, idx) => (
                <StepRow key={step.number} step={step} isLast={idx === steps.length - 1} />
              ))}
            </CardContent>

            {/* Subtle decorative mesh within the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-tr-full pointer-events-none" />
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
      {/* Number + connector line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 border-2 transition-all duration-500",
            isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            isCurrent && "bg-gradient-to-br from-indigo-500 to-cyan-500 border-transparent text-white shadow-xl shadow-indigo-500/20 scale-110",
            isLocked && "bg-muted/50 border-border/50 text-muted-foreground backdrop-blur-sm"
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5 opacity-50" /> : step.number}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 my-4 min-h-[3rem] transition-colors duration-500 relative overflow-hidden",
              isCompleted ? "bg-emerald-500/30" : "bg-border/60"
            )}
          >
            {/* Animated pulse on connector if previous is done and current is next */}
            {isCompleted && (
              <div className="absolute top-0 left-0 w-full h-1/3 bg-emerald-500 animate-[bounce_2s_infinite]" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-10 flex-1 transition-transform duration-500", isCurrent && "translate-x-2", isLast && "pb-0")}>
        <div className="flex items-center gap-4 mb-2">
          <h3
            className={cn(
              "font-black text-2xl uppercase tracking-tighter",
              isLocked && "text-muted-foreground",
              isCompleted && "text-muted-foreground line-through decoration-2 decoration-emerald-500/30",
              isCurrent && "text-foreground bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
            )}
          >
            {step.title}
          </h3>
          {isCompleted && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs uppercase tracking-widest font-bold px-3 py-1">
              Done
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-base md:text-lg mb-6 leading-relaxed max-w-xl font-medium",
            isLocked || isCompleted ? "text-muted-foreground/60" : "text-slate-600 dark:text-slate-300"
          )}
        >
          {step.description}
        </p>
        {!isCompleted && (
          <Button
            disabled={step.buttonDisabled}
            onClick={step.onAction}
            size="lg"
            className={cn(
              "rounded-2xl transition-all duration-300 font-bold tracking-wide uppercase text-xs h-12 px-8",
              isCurrent && "bg-foreground text-background shadow-xl hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-primary/30",
              isLocked && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
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
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover/step:translate-x-1" />
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