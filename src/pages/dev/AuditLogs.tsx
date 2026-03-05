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
    return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>;
  }

  switch (actionLower) {
    case "login":
      return <Badge className="bg-green-500/10 text-green-600">Login</Badge>;
    case "logout":
      return <Badge variant="secondary">Logout</Badge>;
    case "export":
      return <Badge className="bg-blue-500/10 text-blue-600">Export</Badge>;
    case "api_key_created":
      return <Badge className="bg-yellow-500/10 text-yellow-600">API Key Created</Badge>;
    case "api_key_revoked":
      return <Badge className="bg-orange-500/10 text-orange-600">API Key Revoked</Badge>;
    case "settings_changed":
      return <Badge className="bg-purple-500/10 text-purple-600">Settings</Badge>;
    case "user_role_changed":
      return <Badge className="bg-orange-500/10 text-orange-600">Role Changed</Badge>;
    default:
      return <Badge variant="outline">{action || "Unknown"}</Badge>;
  }
};

const getCategoryBadge = (category: string | null) => {
  switch (category) {
    case "authentication":
    case "auth":
      return <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">Auth</Badge>;
    case "data":
    case "report":
    case "export":
    case "import":
      return <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">Data</Badge>;
    case "security":
    case "subscription":
    case "discount":
      return <Badge variant="outline" className="text-xs border-red-500/30 text-red-600">Security</Badge>;
    case "settings":
    case "workspace":
    case "api_key":
      return <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600">Settings</Badge>;
    case "campaign":
      return <Badge variant="outline" className="text-xs border-pink-500/30 text-pink-600">Campaign</Badge>;
    case "integration":
      return <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600">Integration</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{category || "Other"}</Badge>;
  }
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isFetching, refetch } = useAuditLogs(selectedCategory, page, pageSize, searchQuery);
  const auditLogs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const { data: stats } = useAuditLogStats();

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">ประวัติการใช้งานและกิจกรรมของผู้ใช้ในระบบ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logins</p>
                <p className="text-2xl font-bold">{stats?.totalLogins || 0}</p>
              </div>
              <LogIn className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-red-500">{stats?.failedLogins || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Exports</p>
                <p className="text-2xl font-bold">{stats?.dataExports || 0}</p>
              </div>
              <FileDown className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Actions</p>
                <p className="text-2xl font-bold">{stats?.securityActions || 0}</p>
              </div>
              <Key className="h-8 w-8 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Settings Changes</p>
                <p className="text-2xl font-bold">{stats?.settingsChanges || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div >

      {/* Filters */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตามรายละเอียด, action หรือ IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="data">Data & Reports</SelectItem>
                <SelectItem value="security">Security & Roles</SelectItem>
                <SelectItem value="settings">Settings & Workspace</SelectItem>
                <SelectItem value="campaign">Marketing Campaigns</SelectItem>
                <SelectItem value="integration">Integrations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card >

      {/* Logs Table */}
      < Card >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>รายการกิจกรรมทั้งหมด ({totalCount} รายการ)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefreshing || isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isFetching) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="relative">
          {(!data && isLoading) ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className={cn("space-y-3 transition-opacity duration-200", isFetching && "opacity-50")}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getActionIcon(log.action_name)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {log.user_email
                            ? log.user_email.slice(0, 2).toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action_name || "Unknown Action"}</span>
                          {getCategoryBadge(log.category)}
                          {log.user_role && (
                            <Badge variant="outline" className="text-xs">
                              {log.user_role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description || "No description"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.user_email || "Unknown user"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-mono text-muted-foreground">{log.ip_address || "N/A"}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} logs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {page} of {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
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
