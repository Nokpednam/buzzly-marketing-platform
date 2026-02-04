import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CampaignPerformanceProps {
  dateRange?: string;
}

const baseData = [
  { value: 65 },
  { value: 78 },
  { value: 85 },
  { value: 72 },
  { value: 90 },
  { value: 88 },
  { value: 95 },
];

export function CampaignPerformance({ dateRange = "7d" }: CampaignPerformanceProps) {
  const data = useMemo(() => {
    const getLabelsAndMultiplier = () => {
      switch (dateRange) {
        case "today":
          return { labels: ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM"], multiplier: 0.15 };
        case "7d":
          return { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], multiplier: 0.3 };
        case "30d":
          return { labels: ["Week 1", "Week 2", "Week 3", "Week 4"], multiplier: 1 };
        case "90d":
          return { labels: ["Month 1", "Month 2", "Month 3"], multiplier: 2.5 };
        default:
          return { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], multiplier: 0.3 };
      }
    };

    const { labels, multiplier } = getLabelsAndMultiplier();
    return labels.map((name, index) => ({
      name,
      value: Math.round(baseData[index % baseData.length].value * multiplier),
    }));
  }, [dateRange]);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, "Performance"]}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
