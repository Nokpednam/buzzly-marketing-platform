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
  Filter,
  Copy,
  Check
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

import { logError } from "@/services/errorLogger";
import { useToast } from "@/hooks/use-toast";

export default function AdminSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [copied, setCopied] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Error details copied to clipboard",
    });
  };

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch error logs
  const { data, isLoading, refetch } = useAdminErrorLogs(levelFilter, page, pageSize, searchQuery);
  const errorLogs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };




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
        return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Info</Badge>;
      case "debug":
        return <Badge variant="secondary">Debug</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // Fetch stats separately
  const { data: statsData, isLoading: isLoadingStats } = useAdminLogStats();

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support & Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor system health and diagnose issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleSimulateError}>
            <Bug className="h-4 w-4 mr-2" />
            Test Error
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="h-3 w-3" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-700 dark:text-red-500">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600">{stats.warnings}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Info className="h-3 w-3" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset page on search
                }}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={(val) => {
              setLevelFilter(val);
              setPage(1); // Reset page on filter change
            }}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading error logs...
            </div>
          ) : (
            <div className="rounded-md border border-t-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead className="w-[400px]">Message</TableHead>
                    <TableHead className="w-[150px]">User</TableHead>
                    <TableHead className="w-[120px]">Request ID</TableHead>
                    <TableHead className="w-[150px]">Time</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs?.map((log) => (
                    <TableRow key={log.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                      <TableCell className="align-top py-3">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3 max-w-[400px]">
                        <div className="font-mono text-sm line-clamp-2 break-all" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        {log.user_id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5" title={log.user_email || "Unknown Email"}>
                              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium truncate max-w-[130px]">
                                {log.user_email?.split('@')[0] || "Unknown"}
                              </span>
                            </div>
                            <code className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded w-fit">
                              {log.user_id.slice(0, 8)}
                            </code>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-3">
                        {log.request_id ? (
                          <div className="flex items-center gap-1.5" title={log.request_id}>
                            <code className="text-xs text-muted-foreground">
                              {log.request_id.slice(0, 8)}
                            </code>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : "-"}
                          </span>
                          <span>
                            {log.created_at ? format(new Date(log.created_at), "MMM d, HH:mm:ss") : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {errorLogs?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Check className="h-8 w-8 text-green-500/50" />
                          <p>No error logs found matching your criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {errorLogs.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {selectedLog && getLevelIcon(selectedLog.level)}
                  Error Details
                  {selectedLog && getLevelBadge(selectedLog.level)}
                </DialogTitle>
                <DialogDescription>
                  Occurred {selectedLog?.created_at && format(new Date(selectedLog.created_at), "PPP 'at' pp")}
                </DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => selectedLog && copyToClipboard(JSON.stringify(selectedLog, null, 2))}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            </div>
          </DialogHeader>

          {selectedLog && (
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">

                {/* Context Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User</label>
                    <div className="text-sm font-medium truncate" title={selectedLog.user_email || "N/A"}>
                      {selectedLog.user_email || "Anonymous"}
                    </div>
                    {selectedLog.user_id && (
                      <code className="text-[10px] bg-muted px-1 py-0.5 rounded block w-fit">
                        {selectedLog.user_id}
                      </code>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request ID</label>
                    <div>
                      {selectedLog.request_id ? (
                        <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{selectedLog.request_id}</code>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</label>
                    <div className="text-sm">
                      {selectedLog.metadata?.service || "Backend"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Environment</label>
                    <div className="text-sm">
                      {selectedLog.metadata?.env || "Production"}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Error Message
                  </h3>
                  <div className="p-4 bg-muted/50 border rounded-lg font-mono text-sm whitespace-pre-wrap break-all text-destructive-foreground bg-destructive/5 border-destructive/20">
                    {selectedLog.message}
                  </div>
                </div>

                {/* Stack Trace */}
                {selectedLog.stack_trace && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      Stack Trace
                    </h3>
                    <div className="p-4 bg-slate-950 text-slate-50 rounded-lg font-mono text-xs whitespace-pre overflow-x-auto shadow-inner">
                      {selectedLog.stack_trace}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      Additional Metadata
                    </h3>
                    <div className="p-4 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap border">
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
