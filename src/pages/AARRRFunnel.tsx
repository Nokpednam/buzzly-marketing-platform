import { useState, useMemo } from "react";
// --- เพิ่ม Import ตัวเช็คสิทธิ์ ---
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight,
  TrendingUp,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Info,
  Loader2,
} from "lucide-react";

import { useFunnelData } from "@/hooks/useFunnelData";

// Visual mapping for AARRR categories from DB
const categoryVisuals: Record<string, any> = {
  Acquisition: { letter: "A", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500", description: "New sign-ups", prevValue: 10200 },
  Activation: { letter: "A", icon: Zap, color: "text-green-500", bg: "bg-green-500/10", fill: "bg-green-500", description: "Completed onboarding", prevValue: 7900 },
  Retention: { letter: "R", icon: RefreshCw, color: "text-yellow-500", bg: "bg-yellow-500/10", fill: "bg-yellow-500", description: "Active for 30+ days", prevValue: 4500 },
  Referral: { letter: "R", icon: Share2, color: "text-purple-500", bg: "bg-purple-500/10", fill: "bg-purple-500", description: "Invited a friend", prevValue: 900 },
  Revenue: { letter: "R", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/10", fill: "bg-orange-500", description: "Paid subscribers", prevValue: 720 },
};

// 1. แยกเนื้อหาหลักออกมาเป็น Component ย่อย
function AARRRDashboardContent() {
  const [sortBy, setSortBy] = useState("flow");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { aarrrCategories, isLoading } = useFunnelData();

  const realAarrrData = useMemo(() => {
    return aarrrCategories.map(cat => {
      const visuals = categoryVisuals[cat.name] || {
        letter: cat.name.charAt(0).toUpperCase(),
        icon: Info,
        color: "text-slate-500", bg: "bg-slate-500/10", fill: "bg-slate-500",
        description: cat.description || "",
        prevValue: cat.value > 0 ? Math.floor(cat.value * 0.9) : 0
      };

      return {
        id: cat.slug || cat.name.toLowerCase(),
        name: cat.name,
        value: cat.value || 0,
        ...visuals
      };
    });
  }, [aarrrCategories]);

  const processedStages = useMemo(() => {
    if (realAarrrData.length === 0) return [];
    return realAarrrData.map((stage, index) => {
      const nextStage = realAarrrData[index + 1];
      const conversionRate = nextStage ? (nextStage.value / stage.value) * 100 : 0;
      const growth = ((stage.value - stage.prevValue) / stage.prevValue) * 100;

      return {
        ...stage,
        conversionRate,
        growth,
        percentageOfTotal: realAarrrData[0]?.value > 0 ? Math.round((stage.value / realAarrrData[0].value) * 100) : 0
      };
    });
  }, [realAarrrData]);

  const sortedStages = useMemo(() => {
    let result = [...processedStages];
    if (sortBy === "flow") return result;

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "value") comparison = a.value - b.value;
      if (sortBy === "name") comparison = a.name.localeCompare(b.name);
      if (sortBy === "conversion") comparison = a.conversionRate - b.conversionRate;
      return sortOrder === "desc" ? comparison * -1 : comparison;
    });
    return result;
  }, [processedStages, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading funnel data...</p>
      </div>
    );
  }

  const maxValue = processedStages.length > 0 ? processedStages[0].value : 0;
  const totalEntrants = processedStages.length > 0 ? processedStages[0].value : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-background text-foreground">
      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Pirate Metrics</h1>
          <p className="text-muted-foreground italic">"AARRR" you tracking your growth?</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
            <Button
              variant={sortOrder === "asc" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSortOrder("asc")}
            >
              <SortAsc className="h-4 w-4" />
            </Button>
            <Button
              variant={sortOrder === "desc" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSortOrder("desc")}
            >
              <SortDesc className="h-4 w-4" />
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2 opacity-50" />
              <SelectValue placeholder="Sort cards by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flow">Stage Flow (Default)</SelectItem>
              <SelectItem value="value">User Volume</SelectItem>
              <SelectItem value="conversion">Conversion Rate</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: STATIC FLOW */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                User Journey <Info className="h-4 w-4 text-muted-foreground" />
              </h2>
              <Badge variant="outline">{totalEntrants.toLocaleString()} Total Entrants</Badge>
            </div>

            <div className="space-y-1">
              {processedStages.map((stage, index) => {
                const width = (stage.value / maxValue) * 100;
                const nextStage = processedStages[index + 1];

                return (
                  <div key={stage.id}>
                    <div className="group relative flex items-center h-14">
                      <div className="w-24 shrink-0 text-xs font-bold text-muted-foreground uppercase">
                        {stage.name}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`h-10 rounded-r-full ${stage.fill} shadow-lg transition-all duration-700 relative flex items-center px-4`}
                          style={{ width: `${Math.max(width, 10)}%` }}
                        >
                          <span className="text-white font-bold text-sm drop-shadow-md">
                            {stage.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {nextStage && (
                      <div className="ml-24 h-6 border-l-2 border-dashed border-muted-foreground/30 flex items-center">
                        <div className="px-3 py-0.5 bg-muted rounded-full text-[10px] font-bold ml-4">
                          {stage.conversionRate.toFixed(1)}% CONVERSION
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE CARDS */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold">Deep Dive</h2>
          {sortedStages.map((stage) => (
            <Card key={stage.id} className="group hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: `var(--${stage.id})` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${stage.bg} ${stage.color}`}>
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center text-xs font-bold ${stage.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stage.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : null}
                      {stage.growth.toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">vs last month</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-tight">{stage.name}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{stage.percentageOfTotal}% of total</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black">{stage.value.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground truncate">{stage.description}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold">
                    View Details <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                  {stage.conversionRate > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {stage.conversionRate.toFixed(1)}% CV
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. ส่วนที่ Export พร้อมการเช็ค Subscription
export default function InteractiveAARRR() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics">
      <AARRRDashboardContent />
    </PlanRestrictedPage>
  );
}