import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  LogIn,
  LogOut,
  Key,
  FileDown,
  Settings,
  UserCog,
  Shield,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuditLogs, useAuditLogStats } from "@/hooks/useAuditLogs";
import { format, formatDistanceToNow } from "date-fns";

const getActionIcon = (action: string | undefined) => {
  switch (action?.toLowerCase()) {
    case "login":
      return <LogIn className="h-4 w-4 text-green-500" />;
    case "logout":
      return <LogOut className="h-4 w-4 text-muted-foreground" />;
    case "login_failed":
      return <LogIn className="h-4 w-4 text-red-500" />;
    case "export":
      return <FileDown className="h-4 w-4 text-blue-500" />;
    case "api_key_created":
    case "api_key_revoked":
      return <Key className="h-4 w-4 text-yellow-500" />;
    case "settings_changed":
      return <Settings className="h-4 w-4 text-purple-500" />;
    case "user_role_changed":
      return <UserCog className="h-4 w-4 text-orange-500" />;
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActionBadge = (action: string | undefined, status: string | null) => {
  const actionLower = action?.toLowerCase();

  if (status === "failed" || actionLower?.includes("failed")) {
    return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Failed</Badge>;
  }

  switch (actionLower) {
    case "login":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Login</Badge>;
    case "logout":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">Logout</Badge>;
    case "export":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Export</Badge>;
    case "api_key_created":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">API Key Created</Badge>;
    case "api_key_revoked":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">API Key Revoked</Badge>;
    case "settings_changed":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Settings</Badge>;
    case "user_role_changed":
      return <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Role Changed</Badge>;
    default:
      return <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium border-slate-700 text-slate-400">{action || "Unknown"}</Badge>;
  }
};

const getCategoryBadge = (category: string | null) => {
  switch (category) {
    case "authentication":
    case "auth":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-emerald-500/30 text-emerald-400 bg-emerald-500/5">Auth</Badge>;
    case "data":
    case "report":
    case "export":
    case "import":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-blue-500/30 text-blue-400 bg-blue-500/5">Data</Badge>;
    case "security":
    case "subscription":
    case "discount":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-rose-500/30 text-rose-400 bg-rose-500/5">Security</Badge>;
    case "settings":
    case "workspace":
    case "api_key":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-blue-500/30 text-blue-400 bg-blue-500/5">Settings</Badge>;
    case "campaign":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-pink-500/30 text-pink-400 bg-pink-500/5">Campaign</Badge>;
    case "integration":
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-amber-500/30 text-amber-400 bg-amber-500/5">Integration</Badge>;
    default:
      return <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-slate-700 text-slate-500">{category || "Other"}</Badge>;
  }
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isFetching, refetch } = useAuditLogs(selectedCategory, page, pageSize, searchQuery, selectedRole, selectedStatus);
  const auditLogs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const { data: stats } = useAuditLogStats();

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, selectedRole, selectedStatus]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6 text-slate-200 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-slate-400 font-medium">ประวัติการใช้งานและกิจกรรมของผู้ใช้ในระบบ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Logins</p>
                <p className="text-2xl font-bold text-white leading-tight">{stats?.totalLogins || 0}</p>
              </div>
              <LogIn className="h-5 w-5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Failed Logins</p>
                <p className="text-2xl font-bold text-rose-500 leading-tight">{stats?.failedLogins || 0}</p>
              </div>
              <Shield className="h-5 w-5 text-rose-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Data Exports</p>
                <p className="text-2xl font-bold text-white leading-tight">{stats?.dataExports || 0}</p>
              </div>
              <FileDown className="h-5 w-5 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Security Actions</p>
                <p className="text-2xl font-bold text-white leading-tight">{stats?.securityActions || 0}</p>
              </div>
              <Key className="h-5 w-5 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Settings Changes</p>
                <p className="text-2xl font-bold text-white leading-tight">{stats?.settingsChanges || 0}</p>
              </div>
              <Settings className="h-5 w-5 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
      </div >

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="ค้นหาตามรายละเอียด, action หรือ IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/20 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-slate-800"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-black/20 border-slate-800 text-slate-300">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="data">Data & Reports</SelectItem>
                <SelectItem value="security">Security & Roles</SelectItem>
                <SelectItem value="settings">Settings & Workspace</SelectItem>
                <SelectItem value="campaign">Marketing Campaigns</SelectItem>
                <SelectItem value="integration">Integrations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[150px] bg-black/20 border-slate-800 text-slate-300">
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
              <SelectTrigger className="w-full md:w-[140px] bg-black/20 border-slate-800 text-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card >

      {/* Logs Table */}
      <Card className="bg-slate-900/50 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-900/20">
          <div>
            <CardTitle className="text-white text-lg font-bold">Activity Logs</CardTitle>
            <CardDescription className="text-slate-400">รายการกิจกรรมทั้งหมด ({totalCount} รายการ)</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefreshing || isFetching}
            className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isFetching) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0 relative">
          {(!data && isLoading) ? (
            <div className="text-center py-12 text-slate-500 animate-pulse font-medium">Loading audit logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No audit logs found</div>
          ) : (
            <div className={cn("divide-y divide-slate-800/50 transition-opacity duration-200", isFetching && "opacity-50")}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800">
                      {getActionIcon(log.action_name)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-800">
                        <AvatarFallback className="text-xs bg-slate-800 text-slate-300">
                          {log.user_email
                            ? log.user_email.slice(0, 2).toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{log.action_name || "Unknown Action"}</span>
                          {getCategoryBadge(log.category)}
                          {log.user_role && (
                            <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight border-slate-700 text-slate-500">
                              {log.user_role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{log.description || "No description"}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {log.user_email || "Unknown user"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-mono text-slate-500">{log.ip_address || "N/A"}</p>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {log.created_at
                          ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                          : "Unknown"}
                      </p>
                    </div>
                    {getActionBadge(log.action_name, log.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {auditLogs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800">
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                Showing <span className="text-slate-300">{(page - 1) * pageSize + 1}</span> to <span className="text-slate-300">{Math.min(page * pageSize, totalCount)}</span> of <span className="text-slate-300">{totalCount}</span> logs
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
                  Page <span className="text-slate-200">{page}</span> of <span className="text-slate-200">{totalPages}</span>
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
    </div>
  );
}
