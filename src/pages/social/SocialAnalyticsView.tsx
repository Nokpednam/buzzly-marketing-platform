import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Layers,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { AdInsightsSummary } from "@/components/social/analytics/AdInsightsSummary";
import { AdsList } from "@/components/social/analytics/AdsList";
import { AdGroupsList } from "@/components/social/analytics/AdGroupsList";
import { useSocialAnalyticsSummary } from "@/hooks/useSocialAnalyticsSummary";
import { useAdGroups } from "@/hooks/useAdGroups";

function PlatformBreakdownTable() {
  const { platformBreakdown, isLoading, error } = useSocialAnalyticsSummary();

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const formatCurrency = (n: number) =>
    "฿" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">ไม่สามารถโหลดข้อมูล Platform Breakdown</p>
        </div>
      </Card>
    );
  }

  if (platformBreakdown.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">ไม่มีข้อมูล Platform Breakdown</p>
          <p className="text-sm">เชื่อมต่อ platform เพื่อดูข้อมูลเปรียบเทียบ</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Platform Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Platform</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Clicks</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">CTR</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Spend</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Conversions</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Posts</th>
              </tr>
            </thead>
            <tbody>
              {platformBreakdown.map((row) => (
                <tr key={row.platform_id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary opacity-70" />
                      {row.platform_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.impressions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.clicks)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <Badge variant="secondary" className="font-mono">
                      {row.engagement_rate.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.spend)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.conversions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.post_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsOverviewBar() {
  const { overview, isLoading } = useSocialAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  const pills = [
    { label: `${overview.totalPostCount} Posts`, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
    {
      label: `ROAS ${overview.avgRoas.toFixed(2)}x`,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: `Avg CTR ${overview.avgCtr.toFixed(2)}%`,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <span key={pill.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pill.color}`}>
          <TrendingUp className="h-3 w-3" />
          {pill.label}
        </span>
      ))}
    </div>
  );
}

export default function SocialAnalyticsView() {
  const [adsTab, setAdsTab] = useState<"ad-groups" | "ads">("ad-groups");
  const { adGroups } = useAdGroups();

  return (
    <div className="space-y-6 p-1">
      {/* Filter bar row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <PlatformFilterBar />
        </div>
        <DateRangeSelector />
      </div>

      {/* Cross-platform summary pills */}
      <AnalyticsOverviewBar />

      {/* Ad insights: KPI cards + charts */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Ad Performance
        </h2>
        <AdInsightsSummary />
      </section>

      {/* Platform breakdown table */}
      <section>
        <PlatformBreakdownTable />
      </section>

      {/* Ads / Ad Groups detail tabs */}
      <section>
        <Tabs value={adsTab} onValueChange={(v) => setAdsTab(v as typeof adsTab)}>
          <TabsList>
            <TabsTrigger value="ad-groups">Ad Groups</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
          </TabsList>
          <TabsContent value="ad-groups" className="mt-4">
            <AdGroupsList />
          </TabsContent>
          <TabsContent value="ads" className="mt-4">
            <AdsList adGroups={adGroups.map((g) => ({ id: g.id, name: g.name }))} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
