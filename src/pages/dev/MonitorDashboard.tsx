import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Clock, TrendingUp, TrendingDown, Zap, Globe, AlertCircle, Search, Play, Filter } from "lucide-react";
import { useServerHealth, useDataPipelines, useExternalAPIStatus, useErrorLogStats, usePerformanceMetrics } from "@/hooks/useAdminMonitor";
import { formatDistanceToNow } from "date-fns";
import { SparklineTrend } from "@/components/dev/SparklineTrend";
import { Input } from "@/components/ui/input";

// Removed MOCK_PIPELINES as we are now using data from the database

const getStatusIcon = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "running":
    case "operational":
    case "active":
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "warning":
    case "degraded":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "critical":
    case "down":
    case "error":
    case "failed":
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
    case "active":
    case "success":
      return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">{status}</Badge>;
    case "warning":
    case "degraded":
      return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">{status}</Badge>;
    case "critical":
    case "down":
    case "error":
    case "failed":
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">{status}</Badge>;
    default:
      return <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">{status || "Unknown"}</Badge>;
  }
};

const getBarColor = (value: number) => {
  if (value >= 85) return "bg-red-500";
  if (value >= 70) return "bg-yellow-400";
  return "bg-green-500";
};

const getHexColor = (value: number) => {
  if (value >= 85) return "#ef4444"; // red-500
  if (value >= 70) return "#facc15"; // yellow-400
  return "#22c55e"; // green-500
};

export default function MonitorDashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverPage, setServerPage] = useState(1);
  const serversPerPage = 4;
  const [pipelinePage, setPipelinePage] = useState(1);
  const pipelinesPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: servers, isLoading: serversLoading, refetch: refetchServers } = useServerHealth();

  const indexOfLastServer = serverPage * serversPerPage;
  const indexOfFirstServer = indexOfLastServer - serversPerPage;
  const currentServers = servers?.slice(indexOfFirstServer, indexOfLastServer);
  const totalServerPages = Math.ceil((servers?.length || 0) / serversPerPage);

  const { data: pipelines, isLoading: pipelinesLoading, refetch: refetchPipelines } = useDataPipelines();

  const filteredAndSortedPipelines = (pipelines || [])
    .filter(pipeline => pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(pipeline => statusFilter === "All" || (pipeline.status || "").toLowerCase() === statusFilter.toLowerCase())
    .sort((a, b) => {
      const order: Record<string, number> = { failed: 0, error: 0, critical: 0, warning: 1, active: 2, running: 2, healthy: 2 };
      return (order[(a.status || "").toLowerCase()] ?? 3) - (order[(b.status || "").toLowerCase()] ?? 3);
    });

  const indexOfLastPipeline = pipelinePage * pipelinesPerPage;
  const indexOfFirstPipeline = indexOfLastPipeline - pipelinesPerPage;
  const currentPipelines = filteredAndSortedPipelines.slice(indexOfFirstPipeline, indexOfLastPipeline);
  const totalPipelinePages = Math.ceil(filteredAndSortedPipelines.length / pipelinesPerPage);

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
    <div className="space-y-6 text-slate-200 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Monitor Dashboard</h1>
          <p className="text-slate-400 font-medium">Real-time System Status and Metrics Monitoring</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-[#111827] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">System Status</CardTitle>
            <Server className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getStatusIcon(systemStatus)}
              <div>
                <p className="text-2xl font-bold text-white leading-tight">{systemStatus}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {perfMetrics?.healthyServers || 0}/{perfMetrics?.totalServers || 0} servers up
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">{perfMetrics?.avgCpuUsage || 0}%</div>
                {perfMetrics?.avgCpuUsage && perfMetrics.avgCpuUsage < 70 ? (
                  <TrendingDown className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <div className="flex flex-col items-end">
                <SparklineTrend color={getHexColor(perfMetrics?.avgCpuUsage || 0)} />
                <span className="text-[10px] text-slate-500 font-medium">(Last 1h Trend)</span>
              </div>
            </div>
            <Progress 
              value={perfMetrics?.avgCpuUsage || 0} 
              className="h-1.5 bg-slate-800"
              indicatorClassName={getBarColor(perfMetrics?.avgCpuUsage || 0)}
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{perfMetrics?.avgMemoryUsage || 0}%</div>
              <div className="flex flex-col items-end">
                <SparklineTrend color={getHexColor(perfMetrics?.avgMemoryUsage || 0)} />
                <span className="text-[10px] text-slate-500 font-medium">(Last 1h Trend)</span>
              </div>
            </div>
            <Progress 
              value={perfMetrics?.avgMemoryUsage || 0} 
              className="h-1.5 bg-slate-800"
              indicatorClassName={getBarColor(perfMetrics?.avgMemoryUsage || 0)}
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{perfMetrics?.avgDiskUsage || 0}%</div>
              <div className="flex flex-col items-end">
                <SparklineTrend color={getHexColor(perfMetrics?.avgDiskUsage || 0)} />
                <span className="text-[10px] text-slate-500 font-medium">(Last 1h Trend)</span>
              </div>
            </div>
            <Progress 
              value={perfMetrics?.avgDiskUsage || 0} 
              className="h-1.5 bg-slate-800"
              indicatorClassName={getBarColor(perfMetrics?.avgDiskUsage || 0)}
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Errors (Total)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-500 tracking-tight">{errorStats?.errors || 0}</div>
              <Badge className={errorStats?.errors === 0 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}>
                {errorStats?.errors === 0 ? "Normal" : "Review"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">{errorStats?.warnings || 0} warnings identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="servers" className="space-y-4 min-h-[600px]">
        <TabsList className="grid w-full grid-cols-4 bg-[#111827] border border-slate-800 p-1">
          <TabsTrigger value="servers" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-slate-400">
            <Server className="h-4 w-4 mr-2" />
            Servers
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-slate-400">
            <Database className="h-4 w-4 mr-2" />
            Data Pipelines
          </TabsTrigger>
          <TabsTrigger value="errors" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-slate-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="apis" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-slate-400">
            <Globe className="h-4 w-4 mr-2" />
            External APIs
          </TabsTrigger>
        </TabsList>

        {/* Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          {serversLoading ? (
            <div className="text-center py-12 text-slate-500 animate-pulse font-medium">Loading server infrastructure details...</div>
          ) : servers?.length === 0 ? (
            <Card className="bg-[#111827] border-slate-800">
              <CardContent className="py-12 text-center text-slate-500 font-medium">
                No servers configured in the monitoring system
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
                    <Card key={server.id} className="bg-[#111827] border-slate-800 hover:border-blue-500/30 transition-all duration-300 shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2 text-white">
                            {getStatusIcon(server.status)}
                            {server.hostname || "Unknown Server"}
                          </CardTitle>
                          {getStatusBadge(server.status)}
                        </div>
                        {server.ip_address && (
                          <p className="text-xs text-slate-500 font-mono mt-1 opacity-80">{server.ip_address}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-slate-400">
                            <span className="flex items-center gap-2">
                              <Cpu className="h-3.5 w-3.5" />
                              CPU Utilization
                            </span>
                            <span className="text-slate-200">{Number(server.cpu_usage_percent) || 0}%</span>
                          </div>
                          <Progress
                            value={Number(server.cpu_usage_percent) || 0}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName={getBarColor(Number(server.cpu_usage_percent) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-slate-400">
                            <span className="flex items-center gap-2">
                              <HardDrive className="h-3.5 w-3.5" />
                              Memory Allocation
                            </span>
                            <span className="text-slate-200">{memoryPercent}%</span>
                          </div>
                          <Progress
                            value={memoryPercent}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName={getBarColor(memoryPercent)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-slate-400">
                            <span className="flex items-center gap-2">
                              <HardDrive className="h-3.5 w-3.5" />
                              Disk Occupancy
                            </span>
                            <span className="text-slate-200">{diskPercent}%</span>
                          </div>
                          <Progress
                            value={diskPercent}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName={getBarColor(diskPercent)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {totalServerPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setServerPage((p) => Math.max(1, p - 1))}
                    disabled={serverPage === 1}
                    className="bg-[#111827] border-slate-700 text-slate-300 hover:text-white"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-500 font-medium">
                    Page <span className="text-slate-200">{serverPage}</span> of <span className="text-slate-200">{totalServerPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setServerPage((p) => Math.min(totalServerPages, p + 1))}
                    disabled={serverPage === totalServerPages}
                    className="bg-[#111827] border-slate-700 text-slate-300 hover:text-white"
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
          <Card className="bg-[#0B0F1A] border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827]">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#1F2937]/50 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9"
                />
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#1F2937]/50 rounded-lg border border-slate-700 overflow-x-auto w-full sm:w-auto">
                <Filter className="h-4 w-4 text-slate-500 ml-2 mr-1" />
                {['All', 'Active', 'Warning', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap",
                      statusFilter === status
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-0">
              {currentPipelines.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">No pipelines match your search criteria</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {currentPipelines.map((pipeline) => (
                    <div
                      key={pipeline.id}
                      className="group flex flex-col md:flex-row md:items-center p-4 hover:bg-[#1F2937]/30 transition-colors bg-[#0B0F1A]"
                    >
                      {/* Col 1: Name and Subtitle */}
                      <div className="flex-1 min-w-[200px] mb-3 md:mb-0">
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-semibold text-white tracking-tight text-sm">{pipeline.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {pipeline.last_run_at
                                ? `Processed ${formatDistanceToNow(new Date(pipeline.last_run_at), { addSuffix: true })}`
                                : "Awaiting first execution"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end flex-wrap md:flex-nowrap">

                        {/* Col 2: Cron Schedule */}
                        <div className="w-[100px] text-left">
                          <p className="font-mono text-xs font-semibold text-slate-400">{pipeline.schedule_cron || "MANUAL"}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Schedule</p>
                        </div>

                        {/* Col 3: Status Badge */}
                        <div className="w-[100px] text-right">
                          {getStatusBadge(pipeline.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination Footer */}
                  {totalPipelinePages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-t border-slate-800">
                      <span className="text-xs text-slate-500 font-medium">
                        Showing {indexOfFirstPipeline + 1} to {Math.min(indexOfLastPipeline, filteredAndSortedPipelines.length)} of {filteredAndSortedPipelines.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                          disabled={pipelinePage === 1}
                          className="h-8 bg-[#1F2937] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPipelinePage((p) => Math.min(totalPipelinePages, p + 1))}
                          disabled={pipelinePage === totalPipelinePages}
                          className="h-8 bg-[#1F2937] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card className="bg-[#111827] border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">System Error Analytics</CardTitle>
              <CardDescription className="text-slate-400">Comprehensive overview of real-time system anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 rounded-lg border border-slate-800 bg-[#1F2937]/20 text-center">
                  <p className="text-3xl font-bold text-white">{errorStats?.total || 0}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Total Logs</p>
                </div>
                <div className="p-4 rounded-lg border border-red-900/50 bg-red-950/20 text-center">
                  <p className="text-3xl font-bold text-red-400">{errorStats?.critical || 0}</p>
                  <p className="text-xs text-red-500/70 font-bold uppercase tracking-widest mt-1">Critical</p>
                </div>
                <div className="p-4 rounded-lg border border-red-900/30 bg-red-950/10 text-center">
                  <p className="text-3xl font-bold text-red-500">{errorStats?.errors || 0}</p>
                  <p className="text-xs text-red-500/60 font-bold uppercase tracking-widest mt-1">Errors</p>
                </div>
                <div className="p-4 rounded-lg border border-yellow-900/30 bg-yellow-950/10 text-center">
                  <p className="text-3xl font-bold text-yellow-500">{errorStats?.warnings || 0}</p>
                  <p className="text-xs text-yellow-500/60 font-bold uppercase tracking-widest mt-1">Warnings</p>
                </div>
                <div className="p-4 rounded-lg border border-blue-900/30 bg-blue-950/10 text-center">
                  <p className="text-3xl font-bold text-blue-400">{errorStats?.info || 0}</p>
                  <p className="text-xs text-blue-500/60 font-bold uppercase tracking-widest mt-1">Info</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dev/support")}
                  className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white px-8"
                >
                  Access Detailed System Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External APIs Tab */}
        <TabsContent value="apis">
          <Card className="bg-[#111827] border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">External Service Health</CardTitle>
              <CardDescription className="text-slate-400">Monitoring connectivity and latency for critical external platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {apisLoading ? (
                <div className="text-center py-12 text-slate-500 font-medium">Probing external endpoints...</div>
              ) : externalApis?.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">No external service integrations found</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {externalApis?.map((api) => {
                    const isHealthy = api.last_status_code && api.last_status_code >= 200 && api.last_status_code < 300;
                    return (
                      <div key={api.id} className="p-4 rounded-lg border border-slate-800 bg-[#1F2937]/30 hover:bg-[#1F2937]/50 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-200 tracking-tight">{api.platform_name}</span>
                          <Badge className={isHealthy ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                            {isHealthy ? "OPERATIONAL" : "DEGRADED"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest">
                          <div>
                            <p className="text-slate-500 mb-1">Status Code</p>
                            <p className="font-mono text-slate-200 text-sm">{api.last_status_code || "---"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Latency</p>
                            <p className="font-mono text-slate-200 text-sm">{api.latency_ms ? `${api.latency_ms}ms` : "N/A"}</p>
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
