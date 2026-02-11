import { useState, useMemo } from "react";
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
  ArrowRight,
  TrendingUp,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Info,
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_AARRR_DATA = [
  { id: "acquisition", name: "Acquisition", letter: "A", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500", description: "New sign-ups", value: 12500, prevValue: 10200 },
  { id: "activation", name: "Activation", letter: "A", icon: Zap, color: "text-green-500", bg: "bg-green-500/10", fill: "bg-green-500", description: "Completed onboarding", value: 8200, prevValue: 7900 },
  { id: "retention", name: "Retention", letter: "R", icon: RefreshCw, color: "text-yellow-500", bg: "bg-yellow-500/10", fill: "bg-yellow-500", description: "Active for 30+ days", value: 4100, prevValue: 4500 },
  { id: "referral", name: "Referral", letter: "R", icon: Share2, color: "text-purple-500", bg: "bg-purple-500/10", fill: "bg-purple-500", description: "Invited a friend", value: 1200, prevValue: 900 },
  { id: "revenue", name: "Revenue", letter: "R", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/10", fill: "bg-orange-500", description: "Paid subscribers", value: 850, prevValue: 720 },
];

export default function InteractiveAARRR() {
  const [sortBy, setSortBy] = useState("flow"); // flow, value, name, conversion
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 1. Calculate base metrics (Calculated once to derive conversion rates)
  const processedStages = useMemo(() => {
    return MOCK_AARRR_DATA.map((stage, index) => {
      const nextStage = MOCK_AARRR_DATA[index + 1];
      const conversionRate = nextStage ? (nextStage.value / stage.value) * 100 : 0;
      const growth = ((stage.value - stage.prevValue) / stage.prevValue) * 100;
      
      return {
        ...stage,
        conversionRate,
        growth,
        percentageOfTotal: Math.round((stage.value / MOCK_AARRR_DATA[0].value) * 100)
      };
    });
  }, []);

  // 2. Handle Sorting for the Cards section
  const sortedStages = useMemo(() => {
    let result = [...processedStages];
    
    if (sortBy === "flow") return result; // Default AARRR order

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "value") comparison = a.value - b.value;
      if (sortBy === "name") comparison = a.name.localeCompare(b.name);
      if (sortBy === "conversion") comparison = a.conversionRate - b.conversionRate;
      
      return sortOrder === "desc" ? comparison * -1 : comparison;
    });

    return result;
  }, [processedStages, sortBy, sortOrder]);

  const maxValue = processedStages[0].value;

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
        {/* LEFT: STATIC FLOW (The Funnel) */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                User Journey <Info className="h-4 w-4 text-muted-foreground" />
              </h2>
              <Badge variant="outline">{processedStages[0].value.toLocaleString()} Total Entrants</Badge>
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

        {/* RIGHT: INTERACTIVE CARDS (Sortable) */}
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