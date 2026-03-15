import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Users, UserPlus, Mail, Phone, Building2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAudienceDiscovery, type PerformanceSummary } from "@/hooks/useAudienceDiscovery";
import type { PersonaData } from "@/hooks/useAdPersonas";
import type { MockLeadRecord } from "@/lib/mock-api-data";
import { getLeadField } from "@/lib/mock-api-data";

interface AudienceExplorerProps {
  workspaceId: string | null;
  onSaveAsPersona: (
    audienceData: PersonaData,
    platforms: string[],
    summary: PerformanceSummary,
  ) => void;
  onImportLead: (lead: MockLeadRecord) => void;
}

const PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "bg-blue-500" },
  { id: "instagram", label: "Instagram", color: "bg-pink-500" },
  { id: "tiktok", label: "TikTok", color: "bg-slate-800" },
  { id: "google", label: "Google", color: "bg-emerald-500" },
  { id: "shopee", label: "Shopee", color: "bg-orange-500" },
];

const GENDER_COLORS: Record<string, string> = {
  Male: "#3B82F6",
  Female: "#EC4899",
  Other: "#F59E0B",
  male: "#3B82F6",
  female: "#EC4899",
  unknown: "#94A3B8",
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#3B82F6",
  desktop: "#10B981",
  tablet: "#F59E0B",
};

export const AudienceExplorer = ({ workspaceId, onSaveAsPersona, onImportLead }: AudienceExplorerProps) => {
  const [activePlatforms, setActivePlatforms] = useState<string[]>(["facebook", "instagram"]);

  const { audienceData, performanceSummary, leads, isLoading, error } = useAudienceDiscovery(
    activePlatforms,
    workspaceId,
  );

  const togglePlatform = (platformId: string) => {
    setActivePlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId],
    );
  };

  const handleSave = () => {
    if (!audienceData || !performanceSummary) return;
    onSaveAsPersona(audienceData, activePlatforms, performanceSummary);
  };

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <Card className="rounded-3xl border-none bg-muted/20 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Platform Selection
          </CardTitle>
          <CardDescription>
            Toggle platforms to aggregate their audience data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const isActive = activePlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {activePlatforms.length === 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Select at least one platform to view audience data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {activePlatforms.length > 0 && isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-2 border-destructive/20 bg-destructive/5 rounded-3xl">
          <CardContent className="py-8 text-center text-sm text-destructive">
            Failed to load audience data. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Empty state — no platforms selected */}
      {activePlatforms.length === 0 && (
        <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">No Platforms Selected</h3>
            <p className="text-sm text-muted-foreground">
              Enable one or more platforms above to discover audience insights.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No data for selected platforms */}
      {activePlatforms.length > 0 && !isLoading && !audienceData && (
        <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">No Audience Data</h3>
            <p className="text-sm text-muted-foreground">
              No ad data found for the selected platforms.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts + KPIs */}
      {audienceData && performanceSummary && !isLoading && (
        <>
          {/* Performance KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-none shadow-none rounded-2xl bg-primary/5">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Total Impressions
                </p>
                <p className="text-2xl font-black">
                  {performanceSummary.totalImpressions.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-none rounded-2xl bg-amber-500/5">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Avg CTR
                </p>
                <p className="text-2xl font-black">
                  {performanceSummary.avgCtr.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-none rounded-2xl bg-emerald-500/5">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Avg ROAS
                </p>
                <p className="text-2xl font-black">
                  {performanceSummary.avgRoas.toFixed(2)}x
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-none rounded-2xl bg-violet-500/5">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Leads Captured
                </p>
                <p className="text-2xl font-black">
                  {performanceSummary.totalLeads}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 1: Age Distribution + Gender Split */}
          <div className="grid gap-6 lg:grid-cols-3">
            <AgeChart data={audienceData} />
            <GenderChart data={audienceData} />
          </div>

          {/* Row 2: Top Interests + Device Breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            <InterestsChart data={audienceData} />
            <DeviceChart data={audienceData} />
          </div>

          {/* Save as Persona CTA */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!audienceData}
              className="rounded-xl gap-2 px-6 shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Save as Persona
            </Button>
          </div>

          {/* Import from Leads Panel */}
          {leads.length > 0 && (
            <ImportLeadsPanel leads={leads} onImportLead={onImportLead} />
          )}
        </>
      )}
    </div>
  );
};

// ── ImportLeadsPanel ──────────────────────────────────────────────────────────

const ImportLeadsPanel = ({
  leads,
  onImportLead,
}: {
  leads: MockLeadRecord[];
  onImportLead: (lead: MockLeadRecord) => void;
}) => (
  <Card className="rounded-3xl border-none shadow-sm bg-violet-500/5">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Facebook Leads
          </CardTitle>
          <CardDescription>
            Contacts captured via Lead Ads — import any as a persona
          </CardDescription>
        </div>
        <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-none">
          {leads.length} leads
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {leads.map((lead) => {
          const name = getLeadField(lead, "full_name");
          const email = getLeadField(lead, "email");
          const phone = getLeadField(lead, "phone_number");
          const company = getLeadField(lead, "company_name");
          return (
            <div
              key={lead.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background p-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-sm truncate">{name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  {email && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      {email}
                    </span>
                  )}
                  {phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      {phone}
                    </span>
                  )}
                  {company && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {company}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                onClick={() => onImportLead(lead)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Import
              </Button>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// ── Chart sub-components ──────────────────────────────────────────────────────

const AgeChart = ({ data }: { data: PersonaData }) => {
  const ageData = Object.entries(data.age_distribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }));

  return (
    <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Age Distribution
        </CardTitle>
        <CardDescription>Audience breakdown by age group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "12px", border: "none" }}
                formatter={(v: number) => [`${v}%`, "Share"]}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const GenderChart = ({ data }: { data: PersonaData }) => {
  const genderData = Object.entries(data.gender).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  return (
    <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-sm bg-muted/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Gender Split
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genderData} innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                {genderData.map((entry, i) => (
                  <Cell key={i} fill={GENDER_COLORS[entry.name] || "#8b5cf6"} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {genderData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: GENDER_COLORS[item.name] || "#8b5cf6" }}
              />
              <span className="text-xs font-bold">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InterestsChart = ({ data }: { data: PersonaData }) => {
  const interestData = [...data.interests]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8)
    .map((i) => ({ name: i.name, value: Math.round(i.pct * 100) }));

  return (
    <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Top Interests
        </CardTitle>
        <CardDescription>Interest categories weighted by impressions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interestData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 500 }}
                width={140}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "12px", border: "none" }}
                formatter={(v: number) => [`${v}%`, "Affinity"]}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 10, 10, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const DeviceChart = ({ data }: { data: PersonaData }) => {
  const deviceData = Object.entries(data.device_type).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  return (
    <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-sm bg-muted/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Device Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deviceData} innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                {deviceData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={DEVICE_COLORS[entry.name.toLowerCase()] || "#94A3B8"}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {deviceData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: DEVICE_COLORS[item.name.toLowerCase()] || "#94A3B8" }}
              />
              <span className="text-xs font-bold">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Exported for use in PersonaInsightsTab comparison mode
export { GENDER_COLORS, DEVICE_COLORS };
