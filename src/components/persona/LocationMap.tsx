import { useMemo, useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const THAILAND_TOPOLOGY_URL = "/thailand-provinces.topojson";

/** Map API location names to TopoJSON NAME_1 (province names) */
const LOCATION_TO_PROVINCE: Record<string, string> = {
  Bangkok: "Bangkok Metropolis",
  "Chiang Mai": "Chiang Mai",
  Phuket: "Phuket",
  Pattaya: "Chon Buri",
  "Khon Kaen": "Khon Kaen",
  Nonthaburi: "Nonthaburi",
  "Samut Prakan": "Samut Prakan",
  "Hat Yai": "Songkhla",
  "Chiang Rai": "Chiang Rai",
  "Udon Thani": "Udon Thani",
  "Nakhon Ratchasima": "Nakhon Ratchasima",
  "Hua Hin": "Prachuap Khiri Khan",
  Krabi: "Krabi",
  "Chon Buri": "Chon Buri",
  Rayong: "Rayong",
  "Pathum Thani": "Pathum Thani",
};

/** Base color (no data) → accent color (high pct). Higher pct = darker/saturated = more users. */
const COLOR_BASE = "#e2e8f0"; // light gray — no data
const COLOR_MIN = "#86efac"; // light emerald — low density
const COLOR_MAX = "#047857"; // dark emerald — max concentration

function pctToColor(pct: number): string {
  if (pct <= 0) return COLOR_BASE;
  const r = (hex: string) => parseInt(hex.slice(1, 3), 16);
  const g = (hex: string) => parseInt(hex.slice(3, 5), 16);
  const b = (hex: string) => parseInt(hex.slice(5, 7), 16);
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

  const t = Math.min(1, Math.max(0, pct / 100));
  const rr = lerp(r(COLOR_MIN), r(COLOR_MAX), t);
  const gg = lerp(g(COLOR_MIN), g(COLOR_MAX), t);
  const bb = lerp(b(COLOR_MIN), b(COLOR_MAX), t);
  return `rgb(${rr},${gg},${bb})`;
}

interface LocationMapProps {
  locations: { name: string; pct: number }[];
  totalImpressions?: number;
}

interface TooltipState {
  name: string;
  pct: number;
  count: number;
  x: number;
  y: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function LocationMap({ locations, totalImpressions = 0 }: LocationMapProps) {
  const [topology, setTopology] = useState<{ type: "Topology"; objects: Record<string, unknown> } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    fetch(THAILAND_TOPOLOGY_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.type === "Topology" && data?.objects) setTopology(data);
        else setLoadError("Invalid map data");
      })
      .catch((err) => setLoadError(err?.message ?? "Failed to load map"));
  }, []);

  const provinceToPct = useMemo(() => {
    const map: Record<string, number> = {};
    for (const loc of locations) {
      const province = LOCATION_TO_PROVINCE[loc.name] ?? loc.name;
      const existing = map[province] ?? 0;
      map[province] = Math.max(existing, loc.pct * 100);
    }
    return map;
  }, [locations]);

  const maxPct = useMemo(() => {
    const vals = Object.values(provinceToPct);
    return vals.length > 0 ? Math.max(...vals, 1) : 1;
  }, [provinceToPct]);

  if (loadError) {
    return (
      <div className="h-[280px] w-full rounded-xl flex items-center justify-center bg-muted/20 text-muted-foreground text-sm">
        Map unavailable: {loadError}
      </div>
    );
  }

  if (!topology) {
    return (
      <div className="h-[280px] w-full rounded-xl flex items-center justify-center border border-dashed border-muted-foreground/30 bg-muted/30">
        <span className="text-sm text-muted-foreground animate-pulse">Loading map...</span>
      </div>
    );
  }

  const getCount = (pct: number) => Math.round((pct / 100) * totalImpressions);

  const handleMouseEnter = (name: string, pct: number) => (e: React.MouseEvent) => {
    setTooltip({ name, pct, count: getCount(pct), x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (name: string, pct: number) => (e: React.MouseEvent) => {
    setTooltip((prev) => (prev ? { name, pct, count: getCount(pct), x: e.clientX, y: e.clientY } : null));
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="h-[280px] w-full rounded-xl overflow-hidden border border-border/60 bg-muted/5 relative shadow-inner">
      {totalImpressions > 0 && (
        <div className="absolute right-3 top-3 z-10 rounded-lg border bg-background/95 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          Total: {formatCount(totalImpressions)}
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [100.5, 13.7],
          scale: 5500,
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[100.5, 13.7]} zoom={1}>
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = (geo.properties?.NAME_1 as string) ?? "";
                const pct = provinceToPct[name] ?? 0;
                const normalized = maxPct > 0 ? (pct / maxPct) * 100 : 0;
                const fill = pct > 0 ? pctToColor(normalized) : COLOR_BASE;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: pct > 0 ? pctToColor(Math.min(100, normalized + 15)) : "#86efac",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={handleMouseEnter(name, pct)}
                    onMouseMove={handleMouseMove(name, pct)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 8,
          }}
        >
          <span className="font-medium">{tooltip.name}</span>
          {tooltip.pct > 0 && (
            <span className="ml-2 text-muted-foreground">
              {Math.round(tooltip.pct)}%
              {totalImpressions > 0 && tooltip.count > 0 && (
                <> ({formatCount(tooltip.count)} users)</>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
