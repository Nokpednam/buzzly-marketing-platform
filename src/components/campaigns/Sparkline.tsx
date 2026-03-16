import { useId, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface SparklineDataPoint {
  date: string;
  value: number;
}

interface SparklineProps {
  data: SparklineDataPoint[];
  className?: string;
  strokeColor?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  className,
  strokeColor = "hsl(var(--primary))",
  height = 48,
}) => {
  const id = useId().replace(/:/g, "");
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d) => ({ ...d, value: d.value }));
  }, [data]);

  if (chartData.length < 2) return null;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sparkline-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#sparkline-fill-${id})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
