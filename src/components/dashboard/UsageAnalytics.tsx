import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { CreditCard, Users, List, Send, Eye, Reply, Loader2 } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

interface UsageAnalyticsProps {
  dateRange?: string;
}

export function UsageAnalytics({ dateRange = "7d" }: UsageAnalyticsProps) {
  const { data: metrics, isLoading } = useDashboardMetrics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate derived metrics
  const impressions = metrics?.totalImpressions || 0;
  const clicks = metrics?.totalClicks || 0;
  const conversions = metrics?.totalConversions || 0;
  const spend = metrics?.totalSpend || 0;
  
  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard 
              title="Impressions" 
              value={formatNumber(impressions)} 
              icon={Eye} 
              variant="primary" 
            />
            <StatsCard 
              title="Clicks" 
              value={formatNumber(clicks)} 
              icon={Users} 
              variant="info" 
            />
            <StatsCard 
              title="Conversions" 
              value={formatNumber(conversions)} 
              icon={CreditCard} 
              variant="success" 
            />
            <StatsCard 
              title="Spend" 
              value={`$${spend.toFixed(2)}`} 
              icon={Send} 
              variant="warning" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard
              title="CTR"
              value={`${(metrics?.avgCtr || 0).toFixed(2)}%`}
              icon={Eye}
              variant="success"
            />
            <StatsCard 
              title="CPC" 
              value={`$${(metrics?.avgCpc || 0).toFixed(2)}`} 
              icon={List} 
              variant="info" 
            />
            <StatsCard
              title="CPM"
              value={`$${(metrics?.avgCpm || 0).toFixed(2)}`}
              icon={Reply}
              variant="primary"
            />
            <StatsCard
              title="ROAS"
              value={`${(metrics?.avgRoas || 0).toFixed(1)}x`}
              icon={CreditCard}
              variant="warning"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
