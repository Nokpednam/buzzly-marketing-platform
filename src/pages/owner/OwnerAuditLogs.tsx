import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2, Activity } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductEvent {
  id: string;
  created_at: string;
  category: string | null;
  description: string | null;
  status: string | null;
  user_id: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Data fetching — query audit_logs_enhanced for product/feature usage events
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES = [
  "feature",
  "authentication",
  "campaign",
  "data",
  "integration",
  "settings",
  "discount",
  "reward",
  "redemption",
  "activity_code",
  "tier",
];

function useProductActivityLogs() {
  return useQuery<ProductEvent[]>({
    queryKey: ["product_activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs_enhanced")
        .select("id, created_at, category, description, status, user_id, ip_address, metadata")
        .in("category", PRODUCT_CATEGORIES)
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) {
        console.error("[ProductActivityLogs] fetch error:", error);
        throw error;
      }
      return (data ?? []) as ProductEvent[];
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pull action_name out of metadata JSONB */
function getEventName(log: ProductEvent): string {
  if (log.metadata && typeof log.metadata === "object") {
    const name = (log.metadata as Record<string, unknown>)["action_name"];
    if (typeof name === "string" && name) return name;
  }
  // Fallback to capitalised description excerpt
  if (log.description) return log.description.slice(0, 60);
  return log.category ?? "—";
}

/**
 * Derive a human-readable Module from page_url in metadata.
 * e.g. "/campaigns/demo" → "Campaigns"
 */
function getModule(log: ProductEvent): string {
  const pageUrl =
    log.metadata && typeof log.metadata === "object"
      ? String((log.metadata as Record<string, unknown>)["page_url"] ?? "")
      : "";

  if (!pageUrl || pageUrl === "/") return "General";

  const segment = pageUrl.split("/").filter(Boolean)[0] ?? "";

  const MODULE_MAP: Record<string, string> = {
    dashboard: "Dashboard",
    campaigns: "Campaigns",
    personas: "Personas",
    social: "Social",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
    team: "Team",
    "api-keys": "API Keys",
    support: "Support",
    "customer-journey": "Customer Journey",
    "aarrr-funnel": "AARRR Funnel",
    auth: "Auth",
    integrations: "Integrations",
  };

  return MODULE_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

/** Best-effort display identifier for a user */
function getUserDisplay(log: ProductEvent): string {
  if (log.metadata && typeof log.metadata === "object") {
    const meta = log.metadata as Record<string, unknown>;
    if (typeof meta["email"] === "string" && meta["email"]) return meta["email"];
  }
  if (log.user_id) return log.user_id.slice(0, 12) + "…";
  return "Anonymous";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "success").toLowerCase();
  const isSuccess = s === "success";
  const isFailed = s === "failed" || s === "error";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isSuccess
          ? "bg-emerald-100 text-emerald-800"
          : isFailed
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {isSuccess ? "Success" : isFailed ? "Failed" : status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  const cat = category ?? "feature";
  const colour: Record<string, string> = {
    feature: "bg-blue-100 text-blue-700",
    authentication: "bg-violet-100 text-violet-700",
    campaign: "bg-pink-100 text-pink-700",
    data: "bg-cyan-100 text-cyan-700",
    integration: "bg-orange-100 text-orange-700",
    settings: "bg-slate-100 text-slate-600",
    discount: "bg-yellow-100 text-yellow-700",
    reward: "bg-teal-100 text-teal-700",
    redemption: "bg-indigo-100 text-indigo-700",
    activity_code: "bg-lime-100 text-lime-700",
    tier: "bg-fuchsia-100 text-fuchsia-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        colour[cat] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {cat.replace(/_/g, " ")}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OwnerAuditLogs() {
  const { data: logs = [], isLoading, error } = useProductActivityLogs();

  return (
    <div className="p-8 bg-white min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Product Activity Logs</h1>
        <p className="text-slate-500 mt-2 text-sm">
          A detailed stream of user events, feature usage, and friction points across the application.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading activity logs…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24 text-sm text-red-500">
            Failed to load activity logs. Please try again.
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Activity className="h-10 w-10 opacity-40" />
            <p className="text-sm">No product activity events found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[175px] font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700">Event / Action</TableHead>
                <TableHead className="font-semibold text-slate-700">Module</TableHead>
                <TableHead className="font-semibold text-slate-700">User / Customer</TableHead>
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 max-w-[260px] truncate">
                    {getEventName(log)}
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium text-sm">
                    {getModule(log)}
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs max-w-[180px] truncate">
                    {getUserDisplay(log)}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={log.category} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <StatusBadge status={log.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && !error && logs.length > 0 && (
        <p className="mt-3 text-xs text-slate-400 text-right">
          Showing {logs.length} most recent product events
        </p>
      )}
    </div>
  );
}
