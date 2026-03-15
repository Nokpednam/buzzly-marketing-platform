import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Zap,
  Loader2,
  Megaphone,
  GitCompare,
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
import { useCustomerPersonas } from "@/hooks/useCustomerPersonas";
import { useAudienceDiscovery } from "@/hooks/useAudienceDiscovery";
import type { DiscoveryCustomFields } from "@/lib/mock-api-data";
import type { PersonaData } from "@/hooks/useAdPersonas";

interface PersonaInsightsTabProps {
  teamId: string;
  workspaceId?: string | null;
}

// ── Match badge helpers ──────────────────────────────────────────────────────

function matchBadge(matched: boolean, label?: string) {
  return matched ? (
    <Badge variant="default" className="text-xs bg-emerald-500 hover:bg-emerald-500">
      {label ?? "Match"}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {label ?? "No match"}
    </Badge>
  );
}

function interestMatchBadge(savedInterests: string[], apiInterests: string[]) {
  const saved = new Set(savedInterests.map((s) => s.toLowerCase()));
  const matches = apiInterests.filter((i) => saved.has(i.toLowerCase())).length;
  const total = Math.min(savedInterests.length, 10);
  const label = `${matches}/${total} interests match`;
  return matchBadge(matches >= total * 0.5, label);
}

// ── Comparison Panel ─────────────────────────────────────────────────────────

interface ComparisonPanelProps {
  personaId: string;
  teamId: string;
  workspaceId?: string | null;
}

const ComparisonPanel = ({ personaId, teamId, workspaceId }: ComparisonPanelProps) => {
  const { personas, genders } = useCustomerPersonas(teamId);
  const persona = personas?.find((p) => p.id === personaId) ?? null;

  const discoveryData = persona?.custom_fields as DiscoveryCustomFields | null;
  const hasDiscoveryData = !!discoveryData?.discovery_source?.platforms;
  const sourcePlatforms = discoveryData?.discovery_source?.platforms ?? [];

  const { audienceData: liveData, isLoading: liveLoading } = useAudienceDiscovery(
    hasDiscoveryData ? sourcePlatforms : [],
    workspaceId,
  );

  if (!persona) return null;

  if (!hasDiscoveryData) {
    return (
      <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <GitCompare className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-bold mb-1">No Discovery Data</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This persona was created manually — no API comparison available.
            Use the Discovery tab to create a persona from live audience data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const savedGenderName =
    genders?.find((g) => g.id === persona.gender_id)?.name_gender?.toLowerCase() ?? null;

  const apiDominantGender = liveData
    ? Object.entries(liveData.gender)
        .filter(([k]) => k !== "unknown")
        .sort(([, a], [, b]) => b - a)[0]?.[0]
        ?.toLowerCase() ?? null
    : null;

  const savedAgeDominant = (() => {
    const min = persona.age_min ?? 18;
    const max = persona.age_max ?? 65;
    return { min, max };
  })();

  const apiAgeDominant = liveData
    ? (() => {
        const entries = Object.entries(liveData.age_distribution);
        if (entries.length === 0) return null;
        const [range] = entries.sort(([, a], [, b]) => b - a)[0];
        const parts = range.includes("+")
          ? [parseInt(range.replace("+", ""), 10), Infinity]
          : range.split("-").map((s) => parseInt(s, 10));
        return { min: parts[0], max: parts[1] };
      })()
    : null;

  const ageMatches = apiAgeDominant
    ? apiAgeDominant.min >= savedAgeDominant.min &&
      (savedAgeDominant.max === null || apiAgeDominant.min <= savedAgeDominant.max)
    : false;

  const genderMatches =
    savedGenderName !== null &&
    apiDominantGender !== null &&
    savedGenderName === apiDominantGender;

  const savedInterests = (persona.interests ?? []) as string[];
  const apiTopInterests = liveData
    ? [...liveData.interests]
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 10)
        .map((i) => i.name)
    : [];

  const savedDevices = (persona.preferred_devices ?? []) as string[];
  const apiTopDevice = liveData
    ? Object.entries(liveData.device_type).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
    : null;
  const deviceMatches =
    apiTopDevice !== null && savedDevices.map((d) => d.toLowerCase()).includes(apiTopDevice.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Source platforms:</span>
        {sourcePlatforms.map((p) => (
          <Badge key={p} variant="outline" className="capitalize text-xs">
            {p}
          </Badge>
        ))}
        {discoveryData.discovery_source.timestamp && (
          <span className="ml-auto opacity-60">
            Discovered{" "}
            {new Date(discoveryData.discovery_source.timestamp).toLocaleDateString()}
          </span>
        )}
      </div>

      {liveLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* LEFT — Saved Target */}
          <Card className="rounded-2xl border-none bg-muted/20 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Saved Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ComparisonRow label="Age Range">
                <span className="font-semibold">
                  {persona.age_min ?? "?"} – {persona.age_max ?? "55+"}
                </span>
                {matchBadge(ageMatches)}
              </ComparisonRow>

              <ComparisonRow label="Gender">
                <span className="font-semibold capitalize">{savedGenderName ?? "Not set"}</span>
                {matchBadge(genderMatches)}
              </ComparisonRow>

              <ComparisonRow label="Top Interests">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {savedInterests.slice(0, 5).map((i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {i}
                    </Badge>
                  ))}
                  {savedInterests.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{savedInterests.length - 5}
                    </Badge>
                  )}
                </div>
                {interestMatchBadge(savedInterests, apiTopInterests)}
              </ComparisonRow>

              <ComparisonRow label="Devices">
                <div className="flex flex-wrap gap-1">
                  {savedDevices.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs capitalize">
                      {d}
                    </Badge>
                  ))}
                  {savedDevices.length === 0 && (
                    <span className="text-muted-foreground text-xs">Not set</span>
                  )}
                </div>
                {matchBadge(deviceMatches)}
              </ComparisonRow>
            </CardContent>
          </Card>

          {/* RIGHT — Actual API Data */}
          <Card className="rounded-2xl border-none bg-primary/5 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/70">
                Actual API Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!liveData ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No live data available.
                </p>
              ) : (
                <>
                  <ComparisonRow label="Age Range">
                    <span className="font-semibold">
                      {apiAgeDominant
                        ? `${apiAgeDominant.min} – ${isFinite(apiAgeDominant.max) ? apiAgeDominant.max : "55+"}`
                        : "N/A"}
                    </span>
                    {matchBadge(ageMatches)}
                  </ComparisonRow>

                  <ComparisonRow label="Gender">
                    <span className="font-semibold capitalize">
                      {apiDominantGender ?? "N/A"}
                    </span>
                    {matchBadge(genderMatches)}
                  </ComparisonRow>

                  <ComparisonRow label="Top Interests">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {apiTopInterests.slice(0, 5).map((i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {i}
                        </Badge>
                      ))}
                    </div>
                    {interestMatchBadge(savedInterests, apiTopInterests)}
                  </ComparisonRow>

                  <ComparisonRow label="Top Device">
                    <span className="font-semibold capitalize">{apiTopDevice ?? "N/A"}</span>
                    {matchBadge(deviceMatches)}
                  </ComparisonRow>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const ComparisonRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <div className="flex items-center gap-2 flex-wrap">{children}</div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

export const PersonaInsightsTab = ({ teamId, workspaceId }: PersonaInsightsTabProps) => {
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const personaId = selectedPersonaIds[0];

  const { summary, dailyData, linkedAds, isLoading, hasLinkedAds } =
    usePersonaInsights(personaId);

  const handlePersonaChange = (ids: string[]) => {
    setSelectedPersonaIds(ids.length > 1 ? [ids[ids.length - 1]] : ids);
    setComparisonMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Persona Picker + Comparison toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="max-w-sm flex-1">
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

        {personaId && (
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            className="gap-2 rounded-xl shrink-0"
            onClick={() => setComparisonMode((v) => !v)}
          >
            <GitCompare className="h-4 w-4" />
            Compare with Live Data
          </Button>
        )}
      </div>

      {/* Comparison Mode */}
      {personaId && comparisonMode && (
        <ComparisonPanel personaId={personaId} teamId={teamId} workspaceId={workspaceId} />
      )}

      {/* Standard Insights Mode */}
      {!comparisonMode && (
        <>
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
