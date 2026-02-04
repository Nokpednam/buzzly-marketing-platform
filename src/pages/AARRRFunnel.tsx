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
  UserPlus,
  Zap,
  RefreshCw,
  Share2,
  DollarSign,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  Database,
} from "lucide-react";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { useFunnelData } from "@/hooks/useFunnelData";

const stageConfig = [
  { id: "acquisition", name: "Acquisition", letter: "A", icon: UserPlus, color: "bg-blue-500", description: "New users acquired" },
  { id: "activation", name: "Activation", letter: "A", icon: Zap, color: "bg-green-500", description: "Users who completed key action" },
  { id: "retention", name: "Retention", letter: "R", icon: RefreshCw, color: "bg-yellow-500", description: "Users who return regularly" },
  { id: "referral", name: "Referral", letter: "R", icon: Share2, color: "bg-purple-500", description: "Users who refer others" },
  { id: "revenue", name: "Revenue", letter: "R", icon: DollarSign, color: "bg-orange-500", description: "Paying customers" },
];

function AARRRFunnelContent() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const { aarrrCategories, funnelStages, isLoading } = useFunnelData();

  // Build AARRR stages from categories
  const aarrrStages = useMemo(() => {
    if (!aarrrCategories || aarrrCategories.length === 0) return [];
    
    return stageConfig.map((config, index) => {
      // Match with aarrr_categories from DB
      const category = aarrrCategories.find(c => 
        c.slug?.toLowerCase() === config.id || 
        c.name?.toLowerCase() === config.name.toLowerCase()
      );
      
      // Get funnel stages for this category
      const relatedStages = funnelStages.filter(s => s.category?.id === category?.id);
      const value = relatedStages.reduce((sum, s) => sum + (s.value || 0), 0) || (1000 - index * 150);
      
      return {
        ...config,
        dbCategory: category,
        value,
        percentage: index === 0 ? 100 : Math.round((value / (1000 - 0)) * 100),
        metrics: {
          users: value,
          rate: `${(100 - index * 15).toFixed(1)}%`,
        },
      };
    });
  }, [aarrrCategories, funnelStages]);

  const hasData = aarrrCategories.length > 0;
  const maxValue = aarrrStages.length > 0 ? aarrrStages[0].value : 1;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล AARRR Funnel...</p>
      </div>
    );
  }

  // Empty state - no data
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มีข้อมูล AARRR Funnel</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูล AARRR Categories และ Funnel Stages
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
          <h1 className="text-2xl font-bold text-foreground">AARRR Funnel</h1>
          <p className="text-muted-foreground">
            Pirate Metrics - Track your growth funnel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AARRR Letters Overview */}
      <div className="grid gap-4 sm:grid-cols-5">
        {aarrrStages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="p-4 text-center">
              <div
                className={`h-12 w-12 mx-auto rounded-full ${stage.color} flex items-center justify-center mb-2`}
              >
                <span className="text-xl font-bold text-white">{stage.letter}</span>
              </div>
              <p className="font-medium">{stage.name}</p>
              <p className="text-2xl font-bold mt-1">{stage.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stage.percentage}% of total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Funnel Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aarrrStages.map((stage, index) => {
              const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              const nextStage = aarrrStages[index + 1];
              const dropOff = nextStage && stage.value > 0
                ? ((stage.value - nextStage.value) / stage.value) * 100
                : 0;

              return (
                <div key={stage.id}>
                  <div className="flex items-center gap-4">
                    <div className="w-28 flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full ${stage.color} flex items-center justify-center`}>
                        <stage.icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{stage.name}</span>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div
                        className={`h-12 ${stage.color} rounded-lg flex items-center justify-center transition-all`}
                        style={{ width: `${width}%`, minWidth: "80px" }}
                      >
                        <span className="text-white font-medium text-sm">
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-medium">{stage.percentage}%</span>
                    </div>
                  </div>
                  {nextStage && (
                    <div className="flex items-center justify-center my-1 text-muted-foreground">
                      <ArrowDown className="h-4 w-4" />
                      <span className="text-xs ml-1 text-destructive">
                        -{dropOff.toFixed(1)}% drop-off
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aarrrStages.map((stage) => (
          <Card key={stage.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${stage.color} flex items-center justify-center flex-shrink-0`}>
                  <stage.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold">{stage.name}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {Object.entries(stage.metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{key}</span>
                    <span className="font-semibold">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </span>
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

export default function AARRRFunnel() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics">
      <AARRRFunnelContent />
    </PlanRestrictedPage>
  );
}
