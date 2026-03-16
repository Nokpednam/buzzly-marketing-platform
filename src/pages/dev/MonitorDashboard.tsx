import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useServerHealth, useDataPipelines, useExternalAPIStatus, useErrorLogStats, usePerformanceMetrics } from "@/hooks/useAdminMonitor";
import { formatDistanceToNow } from "date-fns";

const getStatusIcon = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "running":
    case "operational":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "warning":
    case "degraded":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "critical":
    case "down":
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "running":
    case "operational":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">{status}</Badge>;
    case "warning":
    case "degraded":
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">{status}</Badge>;
    case "critical":
    case "down":
    case "error":
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
};

export default function MonitorDashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverPage, setServerPage] = useState(1);
  const serversPerPage = 4;
  const [pipelinePage, setPipelinePage] = useState(1);
  const pipelinesPerPage = 8;

  const { data: servers, isLoading: serversLoading, refetch: refetchServers } = useServerHealth();

  const indexOfLastServer = serverPage * serversPerPage;
  const indexOfFirstServer = indexOfLastServer - serversPerPage;
  const currentServers = servers?.slice(indexOfFirstServer, indexOfLastServer);
  const totalServerPages = Math.ceil((servers?.length || 0) / serversPerPage);

  const { data: pipelines, isLoading: pipelinesLoading, refetch: refetchPipelines } = useDataPipelines();

  const indexOfLastPipeline = pipelinePage * pipelinesPerPage;
  const indexOfFirstPipeline = indexOfLastPipeline - pipelinesPerPage;
  const currentPipelines = pipelines?.slice(indexOfFirstPipeline, indexOfLastPipeline);
  const totalPipelinePages = Math.ceil((pipelines?.length || 0) / pipelinesPerPage);

  const { data: externalApis, isLoading: apisLoading, refetch: refetchApis } = useExternalAPIStatus();
  const { data: errorStats, refetch: refetchErrors } = useErrorLogStats();
  const { data: perfMetrics, refetch: refetchPerf } = usePerformanceMetrics();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchServers(),
      refetchPipelines(),
      refetchApis(),
      refetchErrors(),
      refetchPerf(),
    ]);
    setIsRefreshing(false);
  };

  const systemStatus = perfMetrics?.criticalServers
    ? "Critical"
    : perfMetrics?.warningServers
      ? "Warning"
      : "Healthy";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitor Dashboard</h1>
          <p className="text-muted-foreground">ระบบตรวจสอบสุขภาพระบบและข้อมูลแบบเรียลไทม์</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus)}
              <div>
                <p className="text-2xl font-bold">{systemStatus}</p>
                <p className="text-xs text-muted-foreground">
                  {perfMetrics?.healthyServers || 0}/{perfMetrics?.totalServers || 0} servers up
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{perfMetrics?.avgCpuUsage || 0}%</div>
              {perfMetrics?.avgCpuUsage && perfMetrics.avgCpuUsage < 70 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <Progress value={perfMetrics?.avgCpuUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{perfMetrics?.avgMemoryUsage || 0}%</div>
            </div>
            <Progress value={perfMetrics?.avgMemoryUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{perfMetrics?.avgDiskUsage || 0}%</div>
            </div>
            <Progress value={perfMetrics?.avgDiskUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Errors (Total)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-destructive">{errorStats?.errors || 0}</div>
              <Badge className={errorStats?.errors === 0 ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                {errorStats?.errors === 0 ? "Normal" : "Review"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{errorStats?.warnings || 0} warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="servers" className="space-y-4 min-h-[600px]">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">
            <Server className="h-4 w-4 mr-2" />
            Servers
          </TabsTrigger>
          <TabsTrigger value="pipelines">
            <Database className="h-4 w-4 mr-2" />
            Data Pipelines
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="apis">
            <Globe className="h-4 w-4 mr-2" />
            External APIs
          </TabsTrigger>
        </TabsList>

        {/* Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          {serversLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading servers...</div>
          ) : servers?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No servers configured yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {currentServers?.map((server) => {
                  const memoryPercent = server.total_memory && server.used_memory
                    ? Math.round((Number(server.used_memory) / Number(server.total_memory)) * 100)
                    : 0;
                  
                  const diskPercent = server.disk_total && server.disk_used
                    ? Math.round((Number(server.disk_used) / Number(server.disk_total)) * 100)
                    : 0;

                  return (
                    <Card key={server.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getStatusIcon(server.status)}
                            {server.hostname || "Unknown Server"}
                          </CardTitle>
                          {getStatusBadge(server.status)}
                        </div>
                        {server.ip_address && (
                          <p className="text-xs text-muted-foreground font-mono">{server.ip_address}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-muted-foreground" />
                              CPU Usage
                            </span>
                            <span className="font-medium">{Number(server.cpu_usage_percent) || 0}%</span>
                          </div>
                          <Progress
                            value={Number(server.cpu_usage_percent) || 0}
                            className={Number(server.cpu_usage_percent) > 70 ? "[&>div]:bg-yellow-500" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <HardDrive className="h-4 w-4 text-muted-foreground" />
                              Memory Usage
                            </span>
                            <span className="font-medium">{memoryPercent}%</span>
                          </div>
                          <Progress
                            value={memoryPercent}
                            className={memoryPercent > 80 ? "[&>div]:bg-yellow-500" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <HardDrive className="h-4 w-4 text-muted-foreground" />
                              Disk Usage
                            </span>
                            <span className="font-medium">{diskPercent}%</span>
                          </div>
                          <Progress
                            value={diskPercent}
                            className={diskPercent > 85 ? "[&>div]:bg-yellow-500" : ""}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {totalServerPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setServerPage((p) => Math.max(1, p - 1))}
                    disabled={serverPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {serverPage} of {totalServerPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setServerPage((p) => Math.min(totalServerPages, p + 1))}
                    disabled={serverPage === totalServerPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Data Pipelines Tab */}
        <TabsContent value="pipelines">
          <Card>
            <CardHeader>
              <CardTitle>Data Pipeline Status</CardTitle>
              <CardDescription>ตรวจสอบสถานะการไหลของข้อมูลแต่ละ pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              {pipelinesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading pipelines...</div>
              ) : pipelines?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pipelines configured</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {currentPipelines?.map((pipeline) => (
                      <div
                        key={pipeline.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(pipeline.status)}
                          <div>
                            <p className="font-medium">{pipeline.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {pipeline.last_run_at
                                ? `Last run: ${formatDistanceToNow(new Date(pipeline.last_run_at), { addSuffix: true })}`
                                : "Never run"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium">{pipeline.schedule_cron || "Manual"}</p>
                            <p className="text-xs text-muted-foreground">Schedule</p>
                          </div>
                          {getStatusBadge(pipeline.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPipelinePages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                        disabled={pipelinePage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pipelinePage} of {totalPipelinePages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPipelinePage((p) => Math.min(totalPipelinePages, p + 1))}
                        disabled={pipelinePage === totalPipelinePages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary (Recent)</CardTitle>
              <CardDescription>Overview of system errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-3xl font-bold">{errorStats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                </div>
                <div className="p-4 rounded-lg border text-center border-red-300 bg-red-100/50 dark:border-red-800 dark:bg-red-900/40">
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">{errorStats?.critical || 0}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
                <div className="p-4 rounded-lg border text-center border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                  <p className="text-3xl font-bold text-red-600">{errorStats?.errors || 0}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
                <div className="p-4 rounded-lg border text-center border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
                  <p className="text-3xl font-bold text-yellow-600">{errorStats?.warnings || 0}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
                <div className="p-4 rounded-lg border text-center border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                  <p className="text-3xl font-bold text-blue-600">{errorStats?.info || 0}</p>
                  <p className="text-sm text-muted-foreground">Info</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate("/dev/support")}>
                  View Detailed Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External APIs Tab */}
        <TabsContent value="apis">
          <Card>
            <CardHeader>
              <CardTitle>External API Status</CardTitle>
              <CardDescription>สถานะ API ภายนอกที่เชื่อมต่อ</CardDescription>
            </CardHeader>
            <CardContent>
              {apisLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading API status...</div>
              ) : externalApis?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No external APIs configured</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {externalApis?.map((api) => {
                    const isHealthy = api.last_status_code && api.last_status_code >= 200 && api.last_status_code < 300;
                    return (
                      <div key={api.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{api.platform_name}</span>
                          <Badge className={isHealthy ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                            {isHealthy ? "Operational" : "Issue"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-mono">{api.last_status_code || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Latency</p>
                            <p className="font-mono">{api.latency_ms ? `${api.latency_ms}ms` : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
