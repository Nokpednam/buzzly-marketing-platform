import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Zap,
  Loader2,
  Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import {
  usePersonaInsights,
  type PersonaLinkedAd,
} from "@/hooks/usePersonaInsights";

interface PersonaInsightsTabProps {
  teamId: string;
}

export const PersonaInsightsTab = ({ teamId }: PersonaInsightsTabProps) => {
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const personaId = selectedPersonaIds[0];

  const { summary, dailyData, linkedAds, isLoading, hasLinkedAds } =
    usePersonaInsights(personaId);

  const handlePersonaChange = (ids: string[]) => {
    setSelectedPersonaIds(ids.length > 1 ? [ids[ids.length - 1]] : ids);
  };

  return (
    <div className="space-y-6">
      {/* Persona Picker */}
      <div className="max-w-sm">
        <p className="text-sm font-medium mb-2 text-muted-foreground">
          เลือก Persona เพื่อดู Insights
        </p>
        <PersonaSelector
          selectedIds={selectedPersonaIds}
          onChange={handlePersonaChange}
          teamId={teamId}
          placeholder="เลือก Persona..."
        />
      </div>

      {/* Empty / loading states */}
      {!personaId && <PersonaEmptyState />}

      {personaId && isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {personaId && !isLoading && !hasLinkedAds && (
        <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">ยังไม่มีโฆษณาที่ผูกกับ Persona นี้</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              ผูก Persona นี้กับ Ad ผ่านหน้า Ad Analytics เพื่อดู performance insights ที่นี่
            </p>
          </CardContent>
        </Card>
      )}

      {personaId && !isLoading && hasLinkedAds && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              label="Impressions"
              value={summary.impressions.toLocaleString()}
              icon={Eye}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <KpiCard
              label="Clicks"
              value={summary.clicks.toLocaleString()}
              icon={MousePointerClick}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
            <KpiCard
              label="CTR"
              value={`${summary.ctr.toFixed(2)}%`}
              icon={Zap}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <KpiCard
              label="Spend"
              value={`฿${summary.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              color="text-rose-500"
              bgColor="bg-rose-500/10"
            />
            <KpiCard
              label="Conversions"
              value={summary.conversions.toLocaleString()}
              icon={ShoppingCart}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <KpiCard
              label="ROAS"
              value={`${summary.roas.toFixed(2)}x`}
              icon={TrendingUp}
              color="text-cyan-500"
              bgColor="bg-cyan-500/10"
            />
          </div>

          {/* Daily Performance Chart */}
          {dailyData.length > 0 ? (
            <Card className="rounded-3xl border-none shadow-sm bg-muted/10">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Daily Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyData}
                      margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted))"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(d) => {
                          const date = new Date(d);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none" }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="impressions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        name="Impressions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="clicks"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                        name="Clicks"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-none shadow-sm bg-muted/10">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                ยังไม่มี insights data สำหรับ ads ที่ผูกกับ Persona นี้
              </CardContent>
            </Card>
          )}

          {/* Linked Ads Table */}
          <Card className="rounded-3xl border-none shadow-sm bg-muted/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Linked Ads ({linkedAds.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Ad Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Platform
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Impressions
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Clicks
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        CTR
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedAds.map((ad) => (
                      <LinkedAdRow key={ad.id} ad={ad} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const KpiCard = ({ label, value, icon: Icon, color, bgColor }: KpiCardProps) => (
  <Card className="border-none shadow-none rounded-2xl bg-muted/20">
    <CardContent className="p-4 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-black truncate">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  paused: "secondary",
  draft: "outline",
  archived: "outline",
};

const LinkedAdRow = ({ ad }: { ad: PersonaLinkedAd }) => (
  <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors">
    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{ad.name}</td>
    <td className="px-4 py-3">
      {ad.creative_type ? (
        <Badge variant="outline" className="capitalize text-xs">
          {ad.creative_type}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      {ad.status ? (
        <Badge
          variant={STATUS_VARIANT[ad.status.toLowerCase()] ?? "outline"}
          className="capitalize text-xs"
        >
          {ad.status}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </td>
    <td className="px-4 py-3 capitalize text-xs text-muted-foreground">
      {ad.platform ?? "—"}
    </td>
    <td className="px-4 py-3 text-right tabular-nums">
      {ad.impressions.toLocaleString()}
    </td>
    <td className="px-4 py-3 text-right tabular-nums">
      {ad.clicks.toLocaleString()}
    </td>
    <td className="px-4 py-3 text-right tabular-nums">
      {ad.ctr.toFixed(2)}%
    </td>
    <td className="px-4 py-3 text-right tabular-nums">
      ฿{ad.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </td>
  </tr>
);

const PersonaEmptyState = () => (
  <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-background p-5 rounded-full shadow-lg mb-5">
        <TrendingUp className="h-10 w-10 text-primary opacity-20" />
      </div>
      <h3 className="text-xl font-bold mb-2">Persona Performance Insights</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        เลือก Persona เพื่อดู KPIs, daily performance chart, และรายการ ads ที่ผูกกับ Persona นั้น
      </p>
    </CardContent>
  </Card>
);
