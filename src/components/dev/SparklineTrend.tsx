import { useMemo } from "react";

interface SparklineTrendProps {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function SparklineTrend({
  data,
  color = "currentColor",
  width = 80,
  height = 30,
  className = "",
}: SparklineTrendProps) {
  // Generate random data if none provided to simulate "Last 1h Trend"
  const trendData = useMemo(() => {
    if (data && data.length > 0) return data;
    // Mock 20 points
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 40) + 30);
  }, [data]);

  const points = useMemo(() => {
    if (trendData.length < 2) return "";
    
    const min = Math.min(...trendData);
    const max = Math.max(...trendData);
    const range = max - min || 1;
    
    const xStep = width / (trendData.length - 1);
    
    return trendData
      .map((val, i) => {
        const x = i * xStep;
        // Invert Y because SVG coordinates start from top-left
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [trendData, width, height]);

  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]"
        />
      </svg>
    </div>
  );
}
