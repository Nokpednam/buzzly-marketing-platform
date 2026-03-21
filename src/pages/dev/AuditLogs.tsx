import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  LogIn,
  LogOut,
  Key,
  FileDown,
  Settings,
  UserCog,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import { useAuditLogs, useAuditLogStats } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import { AuditLogModal, type AuditLogEntry } from "@/components/dev/AuditLogModal";

const getActionBadge = (action: string | undefined, status: string | null) => {
  const actionLower = action?.toLowerCase();

  if (status === "failed" || actionLower?.includes("failed")) {
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
};

const getCategoryBadge = (category: string | null) => {
  switch (category) {
    case "authentication":
    case "auth":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
          Auth
        </Badge>
      );
    case "data":
    case "report":
    case "export":
    case "import":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-blue-500/30 text-blue-400 bg-blue-500/5">
          Data
        </Badge>
      );
    case "security":
    case "subscription":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-rose-500/30 text-rose-400 bg-rose-500/5">
          Security
        </Badge>
      );
    case "settings":
    case "workspace":
    case "api_key":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-blue-500/30 text-blue-400 bg-blue-500/5">
          Settings
        </Badge>
      );
    case "campaign":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-pink-500/30 text-pink-400 bg-pink-500/5">
          Campaign
        </Badge>
      );
    case "integration":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-amber-500/30 text-amber-400 bg-amber-500/5">
          Integration
        </Badge>
      );
    case "feature":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
          Feature
        </Badge>
      );
    case "discount":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-orange-500/30 text-orange-400 bg-orange-500/5">
          Discount
        </Badge>
      );
    case "reward":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
          Reward
        </Badge>
      );
    case "redemption":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-violet-500/30 text-violet-400 bg-violet-500/5">
          Redemption
        </Badge>
      );
    case "activity_code":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-teal-500/30 text-teal-400 bg-teal-500/5">
          Activity
        </Badge>
      );
    case "tier":
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-slate-500/30 text-slate-400 bg-slate-500/5">
          Tier
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-slate-700 text-slate-500">
          {category || "Other"}
        </Badge>
      );
  }
};

const getRoleBadge = (role: string | null) => {
  if (!role) return null;
  const colorMap: Record<string, string> = {
    owner: "border-violet-500/30 text-violet-400 bg-violet-500/5",
    dev: "border-slate-600 text-slate-400 bg-slate-800/50",
    support: "border-sky-500/30 text-sky-400 bg-sky-500/5",
    customer: "border-amber-500/30 text-amber-400 bg-amber-500/5",
  };
  const classes = colorMap[role.toLowerCase()] ?? "border-slate-700 text-slate-400 bg-slate-800/30";
  return (
    <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight ${classes}`}>
      {role}
    </Badge>
  );
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const { data, isLoading, isFetching, refetch } = useAuditLogs(
    selectedCategory,
    page,
    pageSize,
    searchQuery,
    selectedRole,
    selectedStatus,
    selectedAction
  );
  const auditLogs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const { data: stats } = useAuditLogStats();

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, selectedRole, selectedStatus, selectedAction]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="w-full max-w-full space-y-6 text-slate-200 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-slate-400 font-medium">User activity and system event history</p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-cyan-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feature Views</p>
                <p className="text-2xl font-bold text-cyan-400">{stats?.featureViews ?? 0}</p>
              </div>
              <LayoutDashboard className="h-5 w-5 text-cyan-500/40 group-hover:text-cyan-400 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Logins</p>
                <p className="text-2xl font-bold text-white">{stats?.totalLogins || 0}</p>
              </div>
              <LogIn className="h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-rose-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Failed Logins</p>
                <p className="text-2xl font-bold text-rose-500">{stats?.failedLogins || 0}</p>
              </div>
              <Shield className="h-5 w-5 text-rose-500/30 group-hover:text-rose-500/50 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Exports</p>
                <p className="text-2xl font-bold text-white">{stats?.dataExports || 0}</p>
              </div>
              <FileDown className="h-5 w-5 text-blue-500/30 group-hover:text-blue-500/50 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-amber-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Actions</p>
                <p className="text-2xl font-bold text-white">{stats?.securityActions || 0}</p>
              </div>
              <Key className="h-5 w-5 text-amber-500/30 group-hover:text-amber-500/50 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg group hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settings Changes</p>
                <p className="text-2xl font-bold text-white">{stats?.settingsChanges || 0}</p>
              </div>
              <Settings className="h-5 w-5 text-blue-500/30 group-hover:text-blue-500/50 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table & Filters integrated */}
      <Card className="bg-slate-900/50 border-slate-800 shadow-xl overflow-hidden rounded-xl">
        <CardHeader className="space-y-4 border-b border-slate-800 bg-slate-900/30 pb-6">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg font-bold">Activity Logs</CardTitle>
              <CardDescription className="text-slate-400">All activities ({totalCount} items)</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefreshing || isFetching}
              className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Integrated Filters */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by details, action, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/40 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-700 h-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] bg-black/40 border-slate-800 text-slate-300 h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="feature">Feature (Page View)</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="reward">Reward</SelectItem>
                  <SelectItem value="redemption">Redemption</SelectItem>
                  <SelectItem value="activity_code">Activity Code</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                  <SelectItem value="authentication">Auth</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[120px] bg-black/40 border-slate-800 text-slate-300 h-9 text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[110px] bg-black/40 border-slate-800 text-slate-300 h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[140px] bg-black/40 border-slate-800 text-slate-300 h-9 text-xs">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Page View">Page View</SelectItem>
                  <SelectItem value="Login">Login</SelectItem>
                  <SelectItem value="Logout">Logout</SelectItem>
                  <SelectItem value="login failed">Login Failed</SelectItem>
                  <SelectItem value="Export">Export</SelectItem>
                  <SelectItem value="api_key_created">API Key</SelectItem>
                  <SelectItem value="settings_changed">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {!data && isLoading ? (
            <div className="text-center py-12 text-slate-500 animate-pulse font-medium">Loading audit logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No audit logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      User
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Action
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      IP Address
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    "transition-opacity duration-200",
                    isFetching && "opacity-50"
                  )}
                >
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 cursor-pointer transition-colors group"
                      onClick={() => setSelectedLog(log as AuditLogEntry)}
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-700 bg-slate-900 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-slate-800 text-slate-300">
                              {log.user_email ? log.user_email.slice(0, 2).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-200 truncate">
                              {log.user_email || "Unknown User"}
                            </p>
                            <div className="mt-0.5">{getRoleBadge(log.user_role)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-white whitespace-nowrap">
                            {log.action_name || "Unknown Action"}
                          </span>
                          {getCategoryBadge(log.category)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {getActionBadge(log.action_name, log.status)}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-300">
                          {log.ip_address || "N/A"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 whitespace-nowrap">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {log.created_at
                            ? format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")
                            : "Unknown"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 group-hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log as AuditLogEntry);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {auditLogs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800">
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                Showing{" "}
                <span className="text-slate-300">{(page - 1) * pageSize + 1}</span>
                {" "}to{" "}
                <span className="text-slate-300">{Math.min(page * pageSize, totalCount)}</span>
                {" "}of{" "}
                <span className="text-slate-300">{totalCount}</span> logs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                  className="h-8 bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <div className="text-xs font-semibold text-slate-400 px-2 min-w-[80px] text-center">
                  Page <span className="text-slate-200">{page}</span> of{" "}
                  <span className="text-slate-200">{totalPages}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  className="h-8 bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Detail Modal */}
      <AuditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
