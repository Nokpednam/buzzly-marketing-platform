import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Smartphone,
  Loader2,
  LayoutGrid,
  UserCheck,
  Target,
  Activity,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { useAdPersonas, type AdAudienceMode, type PersonaData } from "@/hooks/useAdPersonas";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCustomerPersonas } from "@/hooks/useCustomerPersonas";
import { CreatePersonaDialog } from "@/components/persona/CreatePersonaDialog";
import { LocationMap } from "@/components/persona/LocationMap";

const GENDER_COLORS: Record<string, string> = {
  Male: "#3B82F6",
  Female: "#EC4899",
  Other: "#F59E0B",
  "ไม่ระบุ": "#94A3B8",
  male: "#3B82F6",
  female: "#EC4899",
  unknown: "#94A3B8",
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#3B82F6",
  desktop: "#10B981",
  tablet: "#F59E0B",
};

/**
 * /personas — Business Logic: Connect API → persona data flows in → display as graph.
 * Ad Audience tab: Shows aggregated audience data from connected ad platforms (ads.persona_data).
 * Gallery tab: Placeholder — build your own.
 */
export default function Prospects() {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { state: onboardingState } = useOnboardingGuard();

  const [activeTab, setActiveTab] = useState<"ad-audience" | "gallery">("ad-audience");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adAudienceMode, setAdAudienceMode] = useState<AdAudienceMode>("all");
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

  const { campaigns } = useCampaigns();
  const { createPersona, genders } = useCustomerPersonas(workspace.id);
  const { personaData: adPersonaData, isLoading: adPersonaLoading, adsWithPersona, totalImpressions } = useAdPersonas({
    mode: adAudienceMode,
    adId: selectedAdId,
    campaignId: selectedCampaignId,
  });

  const displayStats = useMemo(() => {
    let mainDevice = "N/A";
    let primaryInterest = "N/A";
    let topLocation = "N/A";

    if (adPersonaData) {
      const deviceEntries = Object.entries(adPersonaData.device_type);
      if (deviceEntries.length > 0) {
        const top = deviceEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
        mainDevice = top.charAt(0).toUpperCase() + top.slice(1);
      }
      if (adPersonaData.interests.length > 0) primaryInterest = adPersonaData.interests[0].name;
      if (adPersonaData.top_locations.length > 0) topLocation = adPersonaData.top_locations[0].name;
    }

    return {
      activeProfiles: adsWithPersona.length,
      topLocation,
      mainDevice,
      primaryInterest,
    };
  }, [adPersonaData, adsWithPersona.length]);

  if (workspaceLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Target className="h-4 w-4" /> Audience Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tight">Customer Personas</h1>
          <p className="text-muted-foreground">
            Connect your ad platforms to see audience data flow in and display as graphs.
          </p>
        </div>
      </div>

      {/* KPI Stats — from API persona data */}
      {adsWithPersona.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Ads with Data" value={displayStats.activeProfiles} icon={Users} color="text-blue-500" />
          <StatCard label="Top Location" value={displayStats.topLocation} icon={MapPin} color="text-emerald-500" />
          <StatCard label="Main Device" value={displayStats.mainDevice} icon={Smartphone} color="text-purple-500" />
          <StatCard label="Primary Interest" value={displayStats.primaryInterest} icon={UserCheck} color="text-orange-500" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ad-audience" | "gallery")} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="ad-audience" className="rounded-lg gap-2">
            <Activity className="h-4 w-4" /> Ad Audience
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-lg gap-2">
            <LayoutGrid className="h-4 w-4" /> Gallery
          </TabsTrigger>
        </TabsList>

        {/* ── AD AUDIENCE TAB: API → persona data → graph ── */}
        <TabsContent value="ad-audience" className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={adAudienceMode}
              onValueChange={(v) => {
                setAdAudienceMode(v as AdAudienceMode);
                setSelectedAdId(undefined);
                setSelectedCampaignId(undefined);
              }}
            >
              <SelectTrigger className="w-[180px] rounded-xl bg-muted/50 border-none">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ads</SelectItem>
                <SelectItem value="ad">Specific Ad</SelectItem>
                <SelectItem value="campaign">Specific Campaign</SelectItem>
              </SelectContent>
            </Select>

            {adAudienceMode === "ad" && (
              <Select value={selectedAdId} onValueChange={setSelectedAdId}>
                <SelectTrigger className="w-[260px] rounded-xl bg-muted/50 border-none">
                  <SelectValue placeholder="Select an ad…" />
                </SelectTrigger>
                <SelectContent>
                  {adsWithPersona.map((ad) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      <span className="font-medium">{ad.name}</span>
                      {ad.platform && (
                        <span className="ml-2 text-xs text-muted-foreground capitalize">{ad.platform}</span>
                      )}
                    </SelectItem>
                  ))}
                  {adsWithPersona.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No ads with audience data
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}

            {adAudienceMode === "campaign" && (
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger className="w-[260px] rounded-xl bg-muted/50 border-none">
                  <SelectValue placeholder="Select a campaign…" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {campaigns.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No campaigns found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {adPersonaLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !adPersonaData ? (
            <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold mb-1">No Audience Data</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {adAudienceMode === "ad" && !selectedAdId
                    ? "Select an ad above to view its audience breakdown."
                    : adAudienceMode === "campaign" && !selectedCampaignId
                      ? "Select a campaign above to view its audience breakdown."
                      : "Connect a platform via Settings → Platform Connections to import ad audience data."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <AdAudienceCharts data={adPersonaData} totalImpressions={totalImpressions} />
          )}
        </TabsContent>

        {/* ── GALLERY TAB: Placeholder — build your own ── */}
        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)} className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6">
              <Plus className="h-4 w-4" /> Create Persona
            </Button>
          </div>
          <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <LayoutGrid className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-bold mb-2">Gallery</h3>
              <p className="text-muted-foreground max-w-md">
                Build your own gallery here. This area is reserved for your custom implementation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreatePersonaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) =>
          createPersona.mutate(data, {
            onSuccess: () => setShowCreateDialog(false),
          })
        }
        teamId={workspace.id}
        genders={genders ?? []}
        isLoading={createPersona.isPending}
        isOwner
      />
    </div>
  );
}

// ── Ad Audience Charts ──────────────────────────────────────────────────────
function AdAudienceCharts({ data, totalImpressions = 0 }: { data: PersonaData; totalImpressions?: number }) {
  const ageData = Object.entries(data.age_distribution ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }));

  const genderData = Object.entries(data.gender ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  const interestData = (data.interests ?? []).map((i) => ({
    name: i.name,
    value: Math.round(i.pct * 100),
  }));

  const deviceData = Object.entries(data.device_type ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Row 1: Age + Gender */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Age Distribution
            </CardTitle>
            <CardDescription>Audience breakdown by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
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

        <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-sm bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Gender Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={GENDER_COLORS[entry.name] ?? "#8b5cf6"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {genderData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: GENDER_COLORS[item.name] ?? "#8b5cf6" }}
                  />
                  <span className="text-xs font-bold">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Interests + Device */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Top Interests
            </CardTitle>
            <CardDescription>Interest categories weighted by ad impressions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interestData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} width={140} />
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

        <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-sm bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Device Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {deviceData.map((entry, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[entry.name.toLowerCase()] ?? "#94A3B8"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DEVICE_COLORS[item.name.toLowerCase()] ?? "#94A3B8" }}
                  />
                  <span className="text-xs font-bold">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Locations — choropleth map (darker = more users) */}
      <Card className="rounded-3xl border-none shadow-sm bg-muted/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Top Locations
          </CardTitle>
          <CardDescription>Geographic reach — darker color means more users</CardDescription>
        </CardHeader>
        <CardContent>
          <LocationMap locations={data.top_locations ?? []} totalImpressions={totalImpressions} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="border-none bg-muted/20 shadow-none rounded-2xl">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-background ${color} shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
