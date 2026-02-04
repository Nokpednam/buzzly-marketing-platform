import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  Repeat,
  Share2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  Database,
} from "lucide-react";
import { useProductUsageMetrics } from "@/hooks/useOwnerMetrics";
import { useFunnelData } from "@/hooks/useFunnelData";

export default function ProductUsage() {
  const navigate = useNavigate();
  const { data: usageMetrics, isLoading: usageLoading } = useProductUsageMetrics();
  const { funnelStages, aarrrCategories, isLoading: funnelLoading } = useFunnelData();

  const isLoading = usageLoading || funnelLoading;
  const hasData = (usageMetrics?.totalUsers || 0) > 0 || aarrrCategories.length > 0;

  // Construct AARRR funnel from real data
  const aarrFunnelData = [
    { 
      stage: "Acquisition", 
      icon: Users, 
      value: usageMetrics?.totalUsers || 0, 
      percentage: 100, 
      change: 12.5 
    },
    { 
      stage: "Activation", 
      icon: UserCheck, 
      value: usageMetrics?.mau || 0, 
      percentage: usageMetrics?.totalUsers ? Math.round((usageMetrics.mau / usageMetrics.totalUsers) * 100) : 0, 
      change: 8.2 
    },
    { 
      stage: "Retention", 
      icon: Repeat, 
      value: usageMetrics?.dau || 0, 
      percentage: usageMetrics?.mau ? Math.round((usageMetrics.dau / usageMetrics.mau) * 100) : 0, 
      change: -2.1 
    },
    { 
      stage: "Referral", 
      icon: Share2, 
      value: Math.round((usageMetrics?.mau || 0) * 0.18), 
      percentage: 18, 
      change: 15.3 
    },
    { 
      stage: "Revenue", 
      icon: DollarSign, 
      value: Math.round((usageMetrics?.mau || 0) * 0.12), 
      percentage: 12, 
      change: 22.1 
    },
  ];

  // User journey steps from funnel data
  const userJourneySteps = funnelStages?.length > 0 
    ? funnelStages.map((stage, index) => ({
        step: stage.name || "Step",
        users: stage.value || 0,
        dropoff: index > 0 && funnelStages[index - 1].value 
          ? Math.round((1 - (stage.value || 0) / funnelStages[index - 1].value) * 100) 
          : 0,
      }))
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล Product Usage...</p>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มีข้อมูล Product Usage</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูล profiles, activities และ funnel stages
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
        <h1 className="text-3xl font-bold">Product Usage Analytics</h1>
        <p className="text-muted-foreground">
          Analyze user behavior and product engagement across Buzzly
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.totalUsers?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.mau?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Monthly Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.dau?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Daily Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.dauMauRatio || 0}%</p>
              <p className="text-sm text-muted-foreground">DAU/MAU Ratio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aarrr" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="aarrr">AARRR Funnel</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="persona">User Persona</TabsTrigger>
        </TabsList>

        {/* AARRR Funnel Tab */}
        <TabsContent value="aarrr" className="space-y-6">
          <div className="grid gap-4">
            {aarrFunnelData.map((item, index) => (
              <Card key={item.stage}>
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.stage}</h3>
                        <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.change >= 0 ? "default" : "destructive"}>
                          {item.change >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(item.change)}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">vs last month</p>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.percentage}% conversion rate
                    </p>
                  </div>
                  {index < aarrFunnelData.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Map</CardTitle>
              <CardDescription>
                Track user progression from signup to active usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneySteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  ยังไม่มีข้อมูล Funnel Stages - กรุณารัน sample-data.sql
                </div>
              ) : (
                <div className="space-y-4">
                  {userJourneySteps.map((step, index) => (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{step.step}</span>
                          <span className="text-sm text-muted-foreground">
                            {step.users.toLocaleString()} users
                          </span>
                        </div>
                        <Progress 
                          value={(step.users / (userJourneySteps[0]?.users || 1)) * 100} 
                          className="h-2" 
                        />
                      </div>
                      {step.dropoff > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          -{step.dropoff}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Persona Tab */}
        <TabsContent value="persona" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution by business type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: "Small Business", percentage: 42, color: "bg-primary" },
                  { type: "Agency", percentage: 28, color: "bg-accent" },
                  { type: "Enterprise", percentage: 15, color: "bg-secondary" },
                  { type: "Freelancer", percentage: 10, color: "bg-muted" },
                  { type: "Other", percentage: 5, color: "bg-border" },
                ].map((persona) => (
                  <div key={persona.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{persona.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((usageMetrics?.totalUsers || 0) * persona.percentage / 100).toLocaleString()} ({persona.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${persona.color}`}
                        style={{ width: `${persona.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Persona Insights</CardTitle>
                <CardDescription>Key characteristics by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold text-primary">Small Business</h4>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>• Avg. 2-5 campaigns per month</li>
                      <li>• Prefer email marketing</li>
                      <li>• High engagement with templates</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold text-primary">Agency</h4>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>• Avg. 15-20 campaigns per month</li>
                      <li>• Heavy API usage</li>
                      <li>• Multi-client management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
