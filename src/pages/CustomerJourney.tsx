import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  MousePointer,
  UserPlus,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  Database,
} from "lucide-react";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { useFunnelData } from "@/hooks/useFunnelData";

const stageConfig = [
  { id: "awareness", name: "Awareness", icon: Eye, description: "Customer discovers your brand" },
  { id: "consideration", name: "Consideration", icon: MousePointer, description: "Customer shows interest" },
  { id: "acquisition", name: "Acquisition", icon: UserPlus, description: "Customer signs up or subscribes" },
  { id: "intent", name: "Intent", icon: ShoppingCart, description: "Customer adds to cart" },
  { id: "conversion", name: "Conversion", icon: CreditCard, description: "Customer completes purchase" },
];

function CustomerJourneyContent() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const { funnelStages, isLoading } = useFunnelData();

  // Build journey stages from funnel data or show empty
  const journeyStages = useMemo(() => {
    if (!funnelStages || funnelStages.length === 0) return [];
    
    // Map funnel stages to journey config
    return stageConfig.map((config, index) => {
      const funnelStage = funnelStages[index];
      const value = funnelStage?.value || 0;
      const previousValue = index > 0 ? (funnelStages[index - 1]?.value || value) : value;
      const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
      
      return {
        ...config,
        value,
        change: Math.round(change * 10) / 10,
        metrics: funnelStage?.metrics || {},
      };
    });
  }, [funnelStages]);

  const hasData = journeyStages.length > 0 && journeyStages.some(s => s.value > 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล Customer Journey...</p>
      </div>
    );
  }

  // Empty state - no data
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มีข้อมูล Customer Journey</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูลตัวอย่าง
          หรือเชื่อมต่อ Platform เพื่อรับข้อมูลจริง
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/api-keys")}>
            ไปหน้า API Keys
          </Button>
          <Button variant="default" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
            เปิด Supabase
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Journey</h1>
          <p className="text-muted-foreground">
            Track your customers from awareness to conversion
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journey Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Journey Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {journeyStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[140px]">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <stage.icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-center">{stage.name}</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {stage.description}
                  </p>
                  <p className="text-lg font-bold mt-2">{stage.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stage.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stage.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stage.change >= 0 ? "+" : ""}
                      {stage.change}%
                    </span>
                  </div>
                </div>
                {index < journeyStages.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-4 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journeyStages.map((stage) => (
          <Card key={stage.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stage.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold">{stage.name}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                </div>
              </div>
              <Badge
                variant={stage.change >= 0 ? "default" : "destructive"}
                className={`mt-2 w-fit ${
                  stage.change >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : ""
                }`}
              >
                {stage.change >= 0 ? "+" : ""}
                {stage.change}%
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Users</span>
                  <span className="font-semibold">{stage.value.toLocaleString()}</span>
                </div>
                {Object.entries(stage.metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{key}</span>
                    <span className="font-semibold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CustomerJourney() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics">
      <CustomerJourneyContent />
    </PlanRestrictedPage>
  );
}
