import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  Loader2,
  Database,
  LayoutGrid,
  BarChart3,
  UserCheck,
  Target,
  Search,
  Filter,
  ArrowUpRight,
  Activity,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useCustomerPersonas } from "@/hooks/useCustomerPersonas";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { PersonaCard } from "@/components/persona/PersonaCard";
import { CreatePersonaDialog } from "@/components/persona/CreatePersonaDialog";
import type { CustomerPersona } from "@/hooks/useCustomerPersonas";
import { useAdPersonas, type AdAudienceMode, type PersonaData } from "@/hooks/useAdPersonas";
import { useAds } from "@/hooks/useAds";
import { useCampaigns } from "@/hooks/useCampaigns";

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

export default function Prospects() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, hasTeam } = useWorkspace();
  const {
    personas,
    isLoading,
    genders,
    createPersona,
    deletePersona,
    getPersonaStats,
  } = useCustomerPersonas(workspace.id);
  const { state: onboardingState } = useOnboardingGuard();
  type CustomerPersona = NonNullable<typeof personas>[number];

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "charts" | "ad-audience">("charts");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPersona, setEditingPersona] = useState<CustomerPersona | null>(null);

  // Ad Audience filter state
  const [adAudienceMode, setAdAudienceMode] = useState<AdAudienceMode>("all");
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

  const stats = getPersonaStats();

  // Hooks for Ad Audience dropdowns + persona aggregation
  const { ads } = useAds();
  const { campaigns } = useCampaigns();
  const { personaData: adPersonaData, isLoading: adPersonaLoading, adsWithPersona } = useAdPersonas({
    mode: adAudienceMode,
    adId: selectedAdId,
    campaignId: selectedCampaignId,
  });

  if (workspaceLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Users className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Building your audience profiles...</p>
      </div>
    );
  }

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  const hasPersonas = personas && personas.length > 0;
  const filteredPersonas = personas?.filter(p =>
    p.persona_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adsWithPersonaList = adsWithPersona;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">

      {/* 1. MINIMALIST HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Target className="h-4 w-4" /> Audience Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tight">Customer Personas</h1>
          <p className="text-muted-foreground">Defining the ideal customers for <span className="text-foreground font-semibold">{workspace.name}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personas..."
              className="pl-9 w-[200px] bg-muted/50 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6">
            <Plus className="h-4 w-4" /> Create Persona
          </Button>
        </div>
      </div>

      {/* 2. KPI QUICK STATS (Visible if data exists) */}
      {hasPersonas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Profiles" value={personas.length} icon={Users} color="text-blue-500" />
          <StatCard label="Income Segments" value={stats.salaryDistribution.length} icon={TrendingUp} color="text-emerald-500" />
          <StatCard label="Main Device" value={stats.deviceDistribution[0]?.name || "N/A"} icon={Smartphone} color="text-purple-500" />
          <StatCard label="Primary Interest" value={stats.interestDistribution[0]?.name || "N/A"} icon={UserCheck} color="text-orange-500" />
        </div>
      )}

      {/* 3. MAIN CONTENT — always-visible Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="charts" className="rounded-lg gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="cards" className="rounded-lg gap-2">
              <LayoutGrid className="h-4 w-4" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="ad-audience" className="rounded-lg gap-2">
              <Activity className="h-4 w-4" /> Ad Audience
            </TabsTrigger>
          </TabsList>
          {activeTab !== "ad-audience" && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" disabled title="Coming soon">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          )}
        </div>

        {/* ── ANALYTICS TAB ── */}
        <TabsContent value="charts" className="animate-in fade-in duration-500">
          {!hasPersonas ? (
            <EmptyPersonaState onGetStarted={() => setShowCreateDialog(true)} />
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-sm bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Gender Split</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.genderDistribution}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.genderDistribution.map((entry, index) => (
                              <Cell key={index} fill={GENDER_COLORS[entry.name] || "#8b5cf6"} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {stats.genderDistribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GENDER_COLORS[item.name] }} />
                          <span className="text-xs font-bold">{item.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Market Interests</CardTitle>
                      <CardDescription>Top categories your personas are engaged with</CardDescription>
                    </div>
                    <BarChart3 className="h-5 w-5 text-muted-foreground opacity-50" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.interestDistribution} layout="vertical" margin={{ left: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DistributionProgress title="Income Segments" data={stats.salaryDistribution} color="bg-emerald-500" icon={TrendingUp} />
                  <DistributionProgress title="Device Preference" data={stats.deviceDistribution} color="bg-purple-500" icon={Smartphone} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── GALLERY TAB ── */}
        <TabsContent value="cards" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!hasPersonas ? (
            <EmptyPersonaState onGetStarted={() => setShowCreateDialog(true)} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPersonas?.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  genderName={genders?.find((g) => g.id === persona.gender_id)?.name_gender}
                  onEdit={(persona) => setEditingPersona(persona as CustomerPersona)}
                  onDelete={(id) => deletePersona.mutate(id)}
                />
              ))}
              <button
                onClick={() => setShowCreateDialog(true)}
                className="group border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-primary/5 hover:border-primary/50 transition-all min-h-[300px]"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="mt-4 font-bold text-muted-foreground group-hover:text-primary">Add New Persona</p>
              </button>
            </div>
          )}
        </TabsContent>

        {/* ── AD AUDIENCE TAB ── */}
        <TabsContent value="ad-audience" className="space-y-6 animate-in fade-in duration-500">
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={adAudienceMode} onValueChange={(v) => {
              setAdAudienceMode(v as AdAudienceMode);
              setSelectedAdId(undefined);
              setSelectedCampaignId(undefined);
            }}>
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
                  {adsWithPersonaList.map((ad) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      <span className="font-medium">{ad.name}</span>
                      {ad.platform && (
                        <span className="ml-2 text-xs text-muted-foreground capitalize">{ad.platform}</span>
                      )}
                    </SelectItem>
                  ))}
                  {adsWithPersonaList.length === 0 && (
                    <SelectItem value="__none" disabled>No ads with audience data</SelectItem>
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
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  {campaigns.length === 0 && (
                    <SelectItem value="__none" disabled>No campaigns found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Charts */}
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
            <AdAudienceCharts data={adPersonaData} />
          )}
        </TabsContent>
      </Tabs>

      <CreatePersonaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createPersona.mutate(data, { onSuccess: () => setShowCreateDialog(false) })}
        teamId={workspace.id}
        genders={genders || []}
        isLoading={createPersona.isPending}
      />
    </div>
  );
}

// ── Ad Audience Charts ──────────────────────────────────────────────────────
function AdAudienceCharts({ data }: { data: PersonaData }) {
  const ageData = Object.entries(data.age_distribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }));

  const genderData = Object.entries(data.gender).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  const locationData = data.top_locations.map(l => ({
    name: l.name,
    value: Math.round(l.pct * 100),
  }));

  const interestData = data.interests.map(i => ({
    name: i.name,
    value: Math.round(i.pct * 100),
  }));

  const deviceData = Object.entries(data.device_type).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Row 1: Age + Gender */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Age Distribution</CardTitle>
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
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
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Gender Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={GENDER_COLORS[entry.name] || "#8b5cf6"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {genderData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: GENDER_COLORS[item.name] || "#8b5cf6" }} />
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
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Interests</CardTitle>
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
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
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Device Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {deviceData.map((entry, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[entry.name.toLowerCase()] || "#94A3B8"} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: DEVICE_COLORS[item.name.toLowerCase()] || "#94A3B8" }} />
                  <span className="text-xs font-bold">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Locations */}
      <Card className="rounded-3xl border-none shadow-sm bg-muted/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Locations</CardTitle>
          <CardDescription>Geographic reach of your ad audience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} width={140} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                  formatter={(v: number) => [`${v}%`, "Share"]}
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 10, 10, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function EmptyPersonaState({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <Card className="border-2 border-dashed bg-muted/20 rounded-3xl">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-background p-6 rounded-full shadow-xl mb-6">
          <Users className="h-12 w-12 text-primary opacity-20" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Personas Defined</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Create detailed customer profiles to help your team understand who you are building for.
        </p>
        <Button size="lg" onClick={onGetStarted} className="rounded-full px-8">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
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

function DistributionProgress({ title, data, color, icon: Icon }: any) {
  const total = data.reduce((a: number, b: any) => a + b.value, 0);
  return (
    <Card className="rounded-3xl border-none bg-muted/20 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item: any) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                <span>{item.name}</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className={`h-2 bg-background ${color}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
