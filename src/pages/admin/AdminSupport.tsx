import { useState } from "react";
import { useAdminErrorLogs, useAdminLogStats, ErrorLog } from "@/hooks/useAdminSupport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Info,
  Search,
  XCircle,
  RefreshCw,
  Eye,
  Clock,
  User,
  Server,
  Code,
  FileText,
  Filter
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { logError } from "@/services/errorLogger";
import { useToast } from "@/hooks/use-toast";

export default function AdminSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const { toast } = useToast();

  // Test Error Function
  const handleSimulateError = () => {
    try {
      throw new Error("Test error generated manually by Admin");
    } catch (err) {
      logError("Manual Test Error Verification", err, {
        component: "AdminSupport",
        action: "simulate_error",
        source: "admin_ui"
      });

      toast({
        title: "Test Error Logged",
        description: "A test error has been sent to the system. Refreshing list...",
      });

      // Wait a bit for DB insertion then refetch
      setTimeout(() => refetch(), 1500);
    }
  };

  // Fetch error logs
  const { data, isLoading, refetch } = useAdminErrorLogs(levelFilter);
  const errorLogs = data?.logs || [];
  const totalCount = data?.totalCount || 0;

  const filteredLogs = errorLogs.filter((log) =>
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "debug":
        return <Bug className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive" className="bg-red-800 hover:bg-red-900">Critical</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "warning":
      case "warn":
        return <Badge className="bg-amber-500 text-white">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-500 text-white">Info</Badge>;
      case "debug":
        return <Badge variant="secondary">Debug</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // Fetch stats separately
  const { data: statsData, isLoading: isLoadingStats } = useAdminLogStats();

  // Calculate stats - prefer fetched stats, fallback to 0 or local if needed (though local is filtered now)
  const stats = {
    total: statsData?.total || 0,
    critical: statsData?.critical || 0,
    errors: statsData?.error || 0,
    warnings: statsData?.warning || 0,
    info: statsData?.info || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support & Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze system errors and issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleSimulateError}>
            <Bug className="h-4 w-4 mr-2" />
            Test Error
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-700 dark:text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-500">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.warnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by message, request ID, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="error">Errors Only</SelectItem>
                <SelectItem value="warning">Warnings Only</SelectItem>
                <SelectItem value="info">Info Only</SelectItem>
                <SelectItem value="debug">Debug Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading error logs...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px] truncate font-mono text-sm">
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.user_email || "Unknown"}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-mono">{log.user_id.slice(0, 8)}...</span>
                            {log.user_role && <Badge variant="outline" className="text-[10px] h-4">{log.user_role}</Badge>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.request_id ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Server className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{log.request_id.slice(0, 8)}...</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span title={log.created_at ? format(new Date(log.created_at), "PPpp") : ""}>
                          {log.created_at
                            ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                            : "-"
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No error logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLevelIcon(selectedLog.level)}
              Error Log Details
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.created_at && format(new Date(selectedLog.created_at), "PPpp")}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Level & IDs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Level</label>
                    <div>{getLevelBadge(selectedLog.level)}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">User ID</label>
                    <div className="font-mono text-sm">{selectedLog.user_id || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Request ID</label>
                    <div className="font-mono text-sm">{selectedLog.request_id || "-"}</div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Message
                  </label>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
                    {selectedLog.message}
                  </div>
                </div>

                {/* Stack Trace */}
                {selectedLog.stack_trace && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      Stack Trace
                    </label>
                    <div className="p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap break-all overflow-x-auto">
                      {selectedLog.stack_trace}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      Metadata
                    </label>
                    <div className="p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
