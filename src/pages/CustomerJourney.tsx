import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Loader2,
  Database,
  Activity,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { useCustomerJourneyData } from "@/hooks/useCustomerJourneyData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const stageConfig = [
  { id: "awareness", name: "Awareness", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500", desc: "Ad impressions & Reach" },
  { id: "consideration", name: "Consideration", icon: MousePointer, color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "bg-emerald-500", desc: "Clicks & Site visits" },
  { id: "acquisition", name: "Acquisition", icon: UserPlus, color: "text-violet-500", bg: "bg-violet-500/10", fill: "bg-violet-500", desc: "Sign-ups & Leads" },
  { id: "intent", name: "Intent", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10", fill: "bg-amber-500", desc: "Cart additions" },
  { id: "conversion", name: "Conversion", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500", desc: "Successful checkouts" },
];

function CustomerJourneyContent() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  // Fetch only ACTIVE ad accounts for the platform filter
  const { data: adAccounts = [] } = useQuery({
    queryKey: ["ad-accounts-active-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, account_name, platform_id, is_active")
        .eq("is_active", true)
        .order("account_name");
      if (error) throw error;
      return data || [];
    },
  });

  const platformIdFilter = selectedPlatform === "all" ? undefined : selectedPlatform;
  const { journeyStages: rawStages, isLoading } = useCustomerJourneyData(
    selectedPeriod,
    platformIdFilter
  );

  const journeyStages = useMemo(() => {
    return rawStages.map((stage, index) => {
      const config = stageConfig[index];
      return config
        ? { ...config, value: stage.value, retentionRate: stage.retentionRate, metrics: stage.metrics, isEstimated: stage.isEstimated }
        : { ...stageConfig[0], ...stage };
    });
  }, [rawStages]);

  const hasData = journeyStages.length > 0 && journeyStages.some(s => s.value > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Mapping customer paths...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border-2 border-dashed rounded-[3rem] bg-muted/10 mx-4">
        <div className="bg-background p-6 rounded-full shadow-xl mb-6">
          <Activity className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">No Journey Data</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          Synchronize your platform data or use the sample script to visualize the customer lifecycle.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/api-keys")} className="rounded-xl">API Settings</Button>
          <Button onClick={() => window.open("https://supabase.com/dashboard", "_blank")} className="rounded-xl px-8">Open Supabase</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 p-4 md:p-8">

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Activity className="h-4 w-4" /> Pipeline Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter">CUSTOMER JOURNEY</h1>
          <p className="text-muted-foreground italic">Visualizing the transition from first-touch to loyal customer.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Platform Filter */}
          {adAccounts.length > 0 && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[180px] bg-background rounded-xl border-none shadow-sm ring-1 ring-border h-11">
                <LayoutGrid className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Platforms</SelectItem>
                {adAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.platform_id ?? acc.id}>
                    {acc.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Period Filter */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px] bg-background rounded-xl border-none shadow-sm ring-1 ring-border h-11">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. JOURNEY FLOW TRACK */}
      <div className="relative overflow-x-auto no-scrollbar pb-12">
        <div className="flex items-start min-w-[1100px] px-4">
          {journeyStages.map((stage, index) => {
            const isLast = index === journeyStages.length - 1;
            const nextStage = journeyStages[index + 1];

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Node */}
                <div className="flex flex-col items-center w-48 group">
                  <div className={cn(
                    "h-20 w-20 rounded-[2rem] flex items-center justify-center mb-4 transition-all duration-500 shadow-lg group-hover:scale-110 group-hover:-translate-y-2",
                    stage.bg, stage.color, "shadow-black/5 ring-1 ring-current/10"
                  )}>
                    <stage.icon className="h-9 w-9" />
                  </div>

                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center justify-center gap-1">
                    {stage.name}
                    {stage.isEstimated && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 font-medium">
                        Estimated
                      </Badge>
                    )}
                  </h3>
                  <p className="text-[10px] text-muted-foreground text-center mt-1 px-4 leading-tight opacity-70">
                    {stage.desc}
                  </p>

                  <div className="mt-4 text-center">
                    <p className="text-2xl font-black tracking-tighter">{stage.value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Users</p>
                  </div>
                </div>

                {/* Connection Bridge */}
                {!isLast && nextStage && (
                  <div className="flex flex-col items-center justify-center px-4 pt-10">
                    <div className="w-24 h-[2px] bg-gradient-to-r from-muted via-primary/20 to-muted relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border px-2 py-0.5 rounded-full shadow-sm">
                        <span className="text-[10px] font-black text-primary">{nextStage.retentionRate.toFixed(1)}%</span>
                      </div>
                      <ArrowRight className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="mt-6 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Retention</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. STAGE DETAIL GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {journeyStages.map((stage) => (
          <Card key={stage.id} className="group border-none shadow-none bg-muted/30 rounded-3xl transition-all hover:bg-muted/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-2 shadow-sm bg-background", stage.color)}>
                <stage.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2 flex-wrap">
                {stage.name}
                {stage.isEstimated && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 font-medium text-amber-600 border-amber-300">
                    Estimated
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-[10px] leading-tight line-clamp-2">{stage.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4 border-t border-background">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume</span>
                  <span className="text-sm font-black">{stage.value.toLocaleString()}</span>
                </div>

                {Object.entries(stage.metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-2 border-t border-background/50 pt-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase truncate pr-2">{key}</span>
                    <span className="text-xs font-bold">{String(value)}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-6 rounded-xl group-hover:bg-background transition-colors text-[10px] font-bold uppercase tracking-widest"
                onClick={() => toast.info("รายละเอียดเพิ่มเติม — พร้อมใช้งานเร็วๆ นี้")}
              >
                Full Details <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
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