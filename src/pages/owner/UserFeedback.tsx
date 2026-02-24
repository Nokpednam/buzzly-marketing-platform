import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Loader2,
  Database,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useFeedbackMetrics, useFeedbackList } from "@/hooks/useOwnerMetrics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, Building2 } from "lucide-react";

export default function UserFeedback() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: feedbackMetrics, isLoading: isLoadingMetrics } = useFeedbackMetrics();
  const { data: feedbackData, isLoading: isLoadingList, isPlaceholderData } = useFeedbackList(page, limit);

  const feedbackList = feedbackData?.data || [];
  const totalCount = feedbackData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const isLoading = isLoadingMetrics || (isLoadingList && !isPlaceholderData);
  const hasData = (feedbackMetrics?.totalReviews || 0) > 0;

  const npsBreakdown = [
    {
      type: "Promoters",
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Positive")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Positive")?.percentage || 0,
      color: "#10b981" // emerald-500
    },
    {
      type: "Passives",
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Neutral")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Neutral")?.percentage || 0,
      color: "#f59e0b" // amber-500
    },
    {
      type: "Detractors",
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Negative")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Negative")?.percentage || 0,
      color: "#ef4444" // red-500
    },
  ];

  // Output real sentiment trend from DB
  const sentimentTrend = feedbackMetrics?.sentimentTrend || [];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <Smile className="h-6 w-6 text-emerald-400" />;
      case "neutral":
        return <Meh className="h-6 w-6 text-amber-400" />;
      case "negative":
        return <Frown className="h-6 w-6 text-rose-400" />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground mt-4 font-mono text-sm tracking-wider animate-pulse">Loading Feedback Data...</p>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Database className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">No Feedback Data Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The feedback table appears to be empty. Please ensure data is inserted into the `feedback` table independently.
        </p>
        <Button variant="default" size="lg" onClick={() => window.location.reload()} className="shadow-lg shadow-primary/25">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            User Feedback
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Understand how users feel about Buzzly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            <Activity className="w-3 h-3 mr-2 animate-pulse" />
            Live Insights
          </Badge>
        </div>
      </div>

      {/* Summary Cards with V3 Design */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            label: "Avg Rating",
            value: feedbackMetrics?.avgRating?.toFixed(1) || "0.0",
            sub: "Stars",
            icon: Star,
            gradient: "from-amber-500 to-orange-600",
            text: "text-amber-50"
          },
          {
            label: "NPS Score",
            value: (feedbackMetrics?.npsScore && feedbackMetrics.npsScore > 0 ? "+" : "") + (feedbackMetrics?.npsScore || 0),
            sub: "Net Promoter Score",
            icon: ThumbsUp,
            gradient: "from-emerald-600 to-teal-700",
            text: "text-emerald-50"
          },
          {
            label: "Total Reviews",
            value: feedbackMetrics?.totalReviews || 0,
            sub: "Responses",
            icon: MessageSquare,
            gradient: "from-blue-600 to-cyan-600",
            text: "text-blue-50"
          },
          {
            label: "Negative Reviews",
            value: feedbackMetrics?.openIssues || 0,
            sub: "Requires Attention",
            icon: AlertTriangle,
            gradient: "from-rose-500 to-red-600",
            text: "text-rose-50"
          }
        ].map((stat, i) => (
          <Card key={i} className={`bg-gradient-to-br ${stat.gradient} border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <stat.icon className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className={`text-sm font-medium ${stat.text} opacity-90`}>
                {stat.label}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md shadow-inner ring-1 ring-white/20">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-semibold tracking-tight text-white drop-shadow-sm tabular-nums">
                {stat.value}
              </div>
              <p className={`text-xs mt-1 ${stat.text} opacity-80 font-medium tracking-wide`}>{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="nps" className="space-y-8">
        <TabsList className="w-full max-w-md grid grid-cols-3 bg-muted/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="nps" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">NPS Score</TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Sentiment</TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Comments</TabsTrigger>
        </TabsList>

        {/* NPS Tab */}
        <TabsContent value="nps" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel overflow-hidden border-border/50 shadow-sm relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
              <CardHeader>
                <CardTitle>Net Promoter Score</CardTitle>
                <CardDescription>Based on {feedbackMetrics?.totalReviews || 0} responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="text-center">
                      <p className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-primary/50 tracking-tighter drop-shadow-sm tabular-nums pb-2 px-2">
                        {feedbackMetrics?.npsScore !== undefined && feedbackMetrics.npsScore >= 0 ? "+" : ""}
                        {feedbackMetrics?.npsScore || 0}
                      </p>
                      <p className="text-muted-foreground font-medium mt-2">NPS Score</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-5">
                  {npsBreakdown.map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.type}</span>
                        <span className="font-mono text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle>NPS Distribution</CardTitle>
                <CardDescription>Breakdown by customer segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] relative mt-2">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">
                      {feedbackMetrics?.npsScore !== undefined && feedbackMetrics.npsScore >= 0 ? "+" : ""}
                      {feedbackMetrics?.npsScore || 0}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">NPS</p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={npsBreakdown.filter(n => n.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={115}
                        paddingAngle={4}
                        cornerRadius={6}
                        stroke="none"
                        dataKey="count"
                      >
                        {npsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          const percentage = Math.round((value / (feedbackMetrics?.totalReviews || 1)) * 100);
                          return [`${value} responses (${percentage}%)`, name];
                        }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          padding: "12px 16px",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 bg-muted/30 py-3 rounded-xl border border-border/50 mx-4">
                  {npsBreakdown.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-foreground">{item.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded-md border border-border/50">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <Card className="glass-panel border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
              <CardDescription>How sentiment has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentTrend} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                    <XAxis
                      dataKey="month"
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="neutral" stackId="a" fill="#f59e0b" name="Neutral" />
                    <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {feedbackMetrics?.sentimentBreakdown?.map((item) => (
              <Card key={item.sentiment} className="glass-panel border-border/50 hover:bg-muted/30 transition-colors duration-300">
                <CardContent className="p-8 text-center flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl bg-secondary/50 ring-1 ring-border/50 mb-2`}>
                    {getSentimentIcon(item.sentiment)}
                  </div>
                  <div>
                    <p className="text-4xl font-bold tracking-tight text-foreground">{item.percentage}%</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{item.sentiment}</p>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.sentiment === "Positive" ? "#10b981" : item.sentiment === "Neutral" ? "#f59e0b" : "#ef4444"
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.count} reviews</p>
                </CardContent>
              </Card>
            )) || (
                <>
                  {/* Empty placeholders if breakdown is missing but total count > 0 (fallback) */}
                </>
              )}
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <div className="grid gap-4">
            {feedbackList?.map((item) => (
              <Card key={item.id} className="glass-panel border-border/50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* User Info */}
                    <div className="flex items-start gap-4 min-w-[200px]">
                      <Avatar className="h-12 w-12 border-2 border-white/10 shadow-sm">
                        <AvatarImage src={item.customer.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {item.customer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{item.customer.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < item.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 space-y-3">
                      <div className="bg-secondary/30 p-4 rounded-xl rounded-tl-none border border-border/50 text-sm leading-relaxed text-foreground/90">
                        {item.comment}
                      </div>

                      {/* Workspace Info Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                          <Building2 className="w-3.5 h-3.5 text-primary/70" />
                          <span className="font-medium text-primary/80">{item.workspace.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full border border-border/50">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{item.workspace.businessType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No comments found.</p>
                </div>
              )}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, totalCount)}</span> to{" "}
                <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{" "}
                <span className="font-medium">{totalCount}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoadingList}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5 && page > 3) {
                      p = page - 2 + i;
                      if (p > totalPages) p = i + 1 + (totalPages - 5);
                    }

                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "ghost"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoadingList}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
