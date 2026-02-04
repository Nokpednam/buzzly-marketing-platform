import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  RefreshCw,
  ChevronRight,
  Zap,
  DollarSign,
  Users,
  BarChart,
} from "lucide-react";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";

const insights = [
  {
    id: 1,
    type: "opportunity",
    title: "Increase TikTok Ad Spend",
    description:
      "Ads ใน TikTok มี CPC ต่ำกว่า Facebook 30% แต่ Conversion ต่ำกว่า ควรปรับ Content ให้กระชับขึ้น",
    impact: "High",
    platform: "TikTok",
    metrics: { current: "2.1%", potential: "3.5%" },
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: 2,
    type: "warning",
    title: "Facebook CPC Rising",
    description:
      "CPC บน Facebook เพิ่มขึ้น 15% ในสัปดาห์นี้ แนะนำให้ทดสอบ Audience ใหม่หรือปรับ Creative",
    impact: "Medium",
    platform: "Meta",
    metrics: { current: "$0.85", previous: "$0.74" },
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: 3,
    type: "recommendation",
    title: "Best Performing Time Slot",
    description:
      "Email campaigns ส่งระหว่าง 10:00-12:00 มี Open Rate สูงกว่าค่าเฉลี่ย 25% ควรจัดส่งในช่วงเวลานี้",
    impact: "Medium",
    platform: "Email",
    metrics: { openRate: "42%", avgRate: "33%" },
    icon: Lightbulb,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    id: 4,
    type: "opportunity",
    title: "Shopee Campaign Optimization",
    description:
      "สินค้าหมวด Electronics มี ROAS 5.2x สูงกว่าหมวดอื่น ควรเพิ่มงบประมาณในหมวดนี้",
    impact: "High",
    platform: "Shopee",
    metrics: { roas: "5.2x", target: "4.0x" },
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const quickActions = [
  {
    title: "Auto-optimize Campaigns",
    description: "Let AI adjust budgets and targeting automatically",
    icon: Zap,
  },
  {
    title: "Generate Content Ideas",
    description: "Get AI-powered content suggestions",
    icon: Lightbulb,
  },
  {
    title: "Predict Next Month",
    description: "Forecast performance based on trends",
    icon: BarChart,
  },
  {
    title: "Find New Audiences",
    description: "Discover untapped customer segments",
    icon: Users,
  },
];

const impactColors = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-info/10 text-info border-info/20",
};

function AIInsightsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground">
            คำแนะนำอัจฉริยะจาก AI เพื่อเพิ่มประสิทธิภาพแคมเปญ
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      {/* AI Summary */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">AI Performance Summary</h3>
              <p className="mt-1 text-muted-foreground">
                จากการวิเคราะห์ข้อมูล 30 วันล่าสุด พบว่าแคมเปญของคุณมีประสิทธิภาพดีขึ้น 18% 
                โดยมีโอกาสในการเพิ่ม ROI อีก 25% หากปรับตามคำแนะนำด้านล่าง
              </p>
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                    <p className="font-semibold">$2,450/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Improvement</p>
                    <p className="font-semibold">+25%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-info" />
                  <div>
                    <p className="text-sm text-muted-foreground">New Audience</p>
                    <p className="font-semibold">+15K reach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-medium">{action.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${insight.bgColor}`}>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="outline" className={impactColors[insight.impact as keyof typeof impactColors]}>
                          {insight.impact} Impact
                        </Badge>
                        <Badge variant="secondary">{insight.platform}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <span key={key} className="text-muted-foreground">
                              <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                              <span className="font-medium text-foreground">{value}</span>
                            </span>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Apply Recommendation
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIInsights() {
  return (
    <PlanRestrictedPage
      requiredFeature="aiInsights"
      featureDescription="คำแนะนำอัจฉริยะจาก AI เพื่อเพิ่มประสิทธิภาพแคมเปญของคุณ"
    >
      <AIInsightsContent />
    </PlanRestrictedPage>
  );
}
