import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Check,
  FileText,
  Database,
  User,
  Globe,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action_name: string | null;
  category: string | null;
  status: string | null;
  ip_address: string | null;
  created_at: string | null;
  description: string | null;
  metadata: Record<string, unknown> | string | null;
  user_email: string | null;
  user_role: string | null;
}

interface AuditLogModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function StatusBadge({ action, status }: { action: string | null; status: string | null }) {
  const isFailed = status === "failed" || action?.toLowerCase().includes("failed");
  if (isFailed) {
    return (
      <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Success
    </Badge>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  const map: Record<string, string> = {
    authentication: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    auth:           "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    feature:        "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
    data:           "border-blue-500/30 text-blue-400 bg-blue-500/5",
    report:         "border-blue-500/30 text-blue-400 bg-blue-500/5",
    export:         "border-blue-500/30 text-blue-400 bg-blue-500/5",
    import:         "border-blue-500/30 text-blue-400 bg-blue-500/5",
    security:       "border-rose-500/30 text-rose-400 bg-rose-500/5",
    subscription:   "border-rose-500/30 text-rose-400 bg-rose-500/5",
    settings:       "border-blue-500/30 text-blue-400 bg-blue-500/5",
    workspace:      "border-blue-500/30 text-blue-400 bg-blue-500/5",
    api_key:        "border-blue-500/30 text-blue-400 bg-blue-500/5",
    campaign:       "border-pink-500/30 text-pink-400 bg-pink-500/5",
    integration:    "border-amber-500/30 text-amber-400 bg-amber-500/5",
    discount:       "border-orange-500/30 text-orange-400 bg-orange-500/5",
    reward:         "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    redemption:     "border-violet-500/30 text-violet-400 bg-violet-500/5",
    activity_code:  "border-teal-500/30 text-teal-400 bg-teal-500/5",
    tier:           "border-slate-500/30 text-slate-400 bg-slate-500/5",
  };
  const cls = map[category?.toLowerCase() ?? ""] ?? "border-slate-700 text-slate-400 bg-slate-800/30";
  const label = category ? category.toUpperCase() : "OTHER";
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {label}
    </Badge>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return <span className="text-sm text-slate-600 italic">—</span>;
  const map: Record<string, string> = {
    owner:    "border-violet-500/30 text-violet-400 bg-violet-500/5",
    dev:      "border-slate-600 text-slate-400 bg-slate-800/50",
    support:  "border-sky-500/30 text-sky-400 bg-sky-500/5",
    customer: "border-amber-500/30 text-amber-400 bg-amber-500/5",
  };
  const cls = map[role.toLowerCase()] ?? "border-slate-700 text-slate-400 bg-slate-800/30";
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {role}
    </Badge>
  );
}

// ── Metadata renderer ─────────────────────────────────────────────────────────

function MetadataBlock({ metadata }: { metadata: AuditLogEntry["metadata"] }) {
  if (!metadata) return null;

  const raw =
    typeof metadata === "string"
      ? metadata
      : JSON.stringify(metadata, null, 2);

  // Simple keyword-aware token coloring
  const lines = raw.split("\n");

  return (
    <pre className="bg-[#090E17] border border-slate-800/70 rounded-xl p-4 overflow-x-auto overflow-y-auto max-h-[400px] shadow-inner text-[11px] font-mono leading-relaxed">
      {lines.map((line, i) => {
        // key: "value" ← color key cyan, value emerald
        const keyValueMatch = line.match(/^(\s*)("[\w\s-]+")(\s*:\s*)(.*)$/);
        if (keyValueMatch) {
          const [, indent, key, colon, value] = keyValueMatch;
          const isString = value.startsWith('"');
          const isNumber = /^-?\d/.test(value.trim());
          const isBoolean = /^(true|false|null)/.test(value.trim());
          return (
            <span key={i} className="block">
              {indent}
              <span className="text-sky-400">{key}</span>
              <span className="text-slate-500">{colon}</span>
              <span
                className={
                  isString
                    ? "text-emerald-400"
                    : isNumber
                    ? "text-amber-300"
                    : isBoolean
                    ? "text-violet-400"
                    : "text-slate-300"
                }
              >
                {value}
              </span>
            </span>
          );
        }
        return (
          <span key={i} className="block text-slate-400">
            {line}
          </span>
        );
      })}
    </pre>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AuditLogModal({ log, onClose }: AuditLogModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Audit log details copied as JSON",
    });
  };

  const isFailed =
    log?.status === "failed" ||
    log?.action_name?.toLowerCase().includes("failed");

  const hasMetadata =
    log?.metadata !== null &&
    log?.metadata !== undefined &&
    (typeof log.metadata === "string"
      ? log.metadata.trim().length > 0
      : Object.keys(log.metadata).length > 0);

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-800 text-slate-200 shadow-2xl overflow-hidden rounded-xl">
        {/* ── Header ── */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold text-white tracking-tight flex-wrap">
                Activity Details
                {log && <CategoryBadge category={log.category} />}
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">
                Logged{" "}
                {log?.created_at &&
                  format(new Date(log.created_at), "PPP 'at' HH:mm:ss")}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => log && copyToClipboard(JSON.stringify(log, null, 2))}
              className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        {log && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">

              {/* ── Top Context Grid (4 cols) ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-950/40 rounded-xl border border-slate-800/60 shadow-inner">

                {/* Col 1 – Actor */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Actor
                  </label>
                  <div
                    className="text-sm font-bold text-white truncate"
                    title={log.user_email ?? "Unknown"}
                  >
                    {log.user_email || "Anonymous"}
                  </div>
                  <div className="mt-1">
                    <RoleBadge role={log.user_role} />
                  </div>
                </div>

                {/* Col 2 – IP Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />
                    IP Address
                  </label>
                  <code className="text-sm font-mono font-bold text-slate-200 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    {log.ip_address || "N/A"}
                  </code>
                </div>

                {/* Col 3 – Action */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    Action
                  </label>
                  <div className="text-sm font-bold text-white">
                    {log.action_name || "Unknown"}
                  </div>
                </div>

                {/* Col 4 – Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Status
                  </label>
                  <div>
                    <StatusBadge action={log.action_name} status={log.status} />
                  </div>
                </div>
              </div>

              {/* ── Event Description ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Event Description
                </h3>
                <div
                  className={`p-5 rounded-xl border shadow-inner ${
                    isFailed
                      ? "border-rose-500/20 bg-rose-500/5"
                      : "border-slate-800 bg-slate-900/30"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed ${
                      isFailed ? "text-rose-300" : "text-slate-300"
                    }`}
                  >
                    {log.description || (
                      <span className="italic text-slate-600">
                        No description provided for this event.
                      </span>
                    )}
                  </p>
                  {log.category === "feature" &&
                    typeof log.metadata === "object" &&
                    log.metadata !== null &&
                    "page_url" in log.metadata && (
                      <p className="text-xs text-cyan-400/90 mt-2 font-mono">
                        Path: {(log.metadata as Record<string, unknown>).page_url as string}
                      </p>
                    )}
                </div>
              </div>

              {/* ── Metadata Payload ── */}
              {hasMetadata && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-500" />
                    Metadata Payload
                  </h3>
                  <MetadataBlock metadata={log.metadata} />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
