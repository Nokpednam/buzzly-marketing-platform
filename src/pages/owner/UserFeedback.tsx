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
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Loader2,
  Database,
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
import { useFeedbackMetrics } from "@/hooks/useOwnerMetrics";

export default function UserFeedback() {
  const navigate = useNavigate();
  const { data: feedbackMetrics, isLoading } = useFeedbackMetrics();

  const hasData = (feedbackMetrics?.totalReviews || 0) > 0;

  const npsBreakdown = [
    { 
      type: "Promoters", 
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Positive")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Positive")?.percentage || 0,
      color: "hsl(var(--chart-1))" 
    },
    { 
      type: "Passives", 
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Neutral")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Neutral")?.percentage || 0,
      color: "hsl(var(--chart-2))" 
    },
    { 
      type: "Detractors", 
      count: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Negative")?.count || 0,
      percentage: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Negative")?.percentage || 0,
      color: "hsl(var(--destructive))" 
    },
  ];

  // Sentiment trend (based on current data)
  const sentimentTrend = [
    { month: "Jan", positive: 55, neutral: 30, negative: 15 },
    { month: "Feb", positive: 58, neutral: 28, negative: 14 },
    { month: "Mar", positive: 60, neutral: 27, negative: 13 },
    { month: "Apr", positive: 59, neutral: 28, negative: 13 },
    { month: "May", positive: 61, neutral: 26, negative: 13 },
    { 
      month: "Jun", 
      positive: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Positive")?.percentage || 62, 
      neutral: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Neutral")?.percentage || 26, 
      negative: feedbackMetrics?.sentimentBreakdown?.find(s => s.sentiment === "Negative")?.percentage || 12 
    },
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <Smile className="h-4 w-4 text-green-500" />;
      case "neutral":
        return <Meh className="h-4 w-4 text-yellow-500" />;
      case "negative":
        return <Frown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล User Feedback...</p>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มีข้อมูล User Feedback</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูล feedback และ ratings
        </p>
        <Button variant="default" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
          เปิด Supabase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Feedback & Sentiment</h1>
        <p className="text-muted-foreground">
          Understand how users feel about Buzzly
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{feedbackMetrics?.avgRating || 0}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {feedbackMetrics?.npsScore !== undefined && feedbackMetrics.npsScore >= 0 ? "+" : ""}
                  {feedbackMetrics?.npsScore || 0}
                </p>
                <p className="text-sm text-muted-foreground">NPS Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{feedbackMetrics?.totalReviews || 0}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{feedbackMetrics?.openIssues || 0}</p>
                <p className="text-sm text-muted-foreground">Negative Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nps" className="space-y-6">
        <TabsList>
          <TabsTrigger value="nps">NPS Score</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        {/* NPS Tab */}
        <TabsContent value="nps" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Net Promoter Score</CardTitle>
                <CardDescription>Based on {feedbackMetrics?.totalReviews || 0} responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-primary">
                        {feedbackMetrics?.npsScore !== undefined && feedbackMetrics.npsScore >= 0 ? "+" : ""}
                        {feedbackMetrics?.npsScore || 0}
                      </p>
                      <p className="text-muted-foreground">NPS Score</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {npsBreakdown.map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.type}</span>
                        <span className="font-medium">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NPS Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={npsBreakdown.filter(n => n.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="count"
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                      >
                        {npsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
              <CardDescription>How sentiment has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `${v}%`} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="positive" stackId="a" fill="hsl(142 76% 36%)" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted))" name="Neutral" />
                    <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negative" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {feedbackMetrics?.sentimentBreakdown?.map((item) => (
              <Card key={item.sentiment}>
                <CardContent className="p-6 text-center">
                  {getSentimentIcon(item.sentiment)}
                  <p className="mt-2 text-3xl font-bold">{item.percentage}%</p>
                  <p className="text-sm text-muted-foreground">{item.sentiment}</p>
                  <p className="text-xs text-muted-foreground">{item.count} reviews</p>
                </CardContent>
              </Card>
            )) || (
              <>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Smile className="mx-auto h-8 w-8 text-green-500" />
                    <p className="mt-2 text-3xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Positive</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Meh className="mx-auto h-8 w-8 text-yellow-500" />
                    <p className="mt-2 text-3xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Neutral</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Frown className="mx-auto h-8 w-8 text-destructive" />
                    <p className="mt-2 text-3xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Negative</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
