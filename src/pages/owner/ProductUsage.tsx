import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  UserCheck,
  Repeat,
  Share2,
  DollarSign,
  ArrowRight,
  Loader2,
  Database,
  Plus,
  Trash2,
  Activity
} from "lucide-react";
import { useProductUsageMetrics, useUserSegments, useAARRRMetrics } from "@/hooks/useOwnerMetrics";
// usePersonas (legacy) is intentionally used here — this page manages internal
// Buzzly user-segment personas (AARRR analytics), not customer marketing personas.
// For marketing personas use useCustomerPersonas instead.
import { usePersonas } from "@/hooks/usePersonas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductUsage() {
  const navigate = useNavigate();
  const { data: usageMetrics, isLoading: usageLoading } = useProductUsageMetrics();
  const { data: aarrrStages = [], isLoading: aarrrLoading } = useAARRRMetrics();
  const { data: userSegments, isLoading: segmentsLoading } = useUserSegments();
  const { personas, createPersona, deletePersona } = usePersonas();

  // Form State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    characteristics: "",
    behaviors: ""
  });

  const isLoading = usageLoading || aarrrLoading || segmentsLoading;
  const hasData = (usageMetrics?.totalUsers || 0) > 0
    || (usageMetrics?.activeSubscriptions || 0) > 0
    || aarrrStages.length > 0;

  // AARRR funnel from real data (customer → subscriptions → payment_transactions)
  const aarrFunnelData = aarrrStages.map((stage, index) => ({
    stage: stage.name,
    description: stage.description,
    icon: [Users, UserCheck, Repeat, DollarSign, Share2][index] || Users,
    value: stage.value,
    percentage: stage.percentage,
    change: 0
  }));

  // User Journey derived from AARRR funnel steps (same data, different view)
  const userJourneySteps = aarrFunnelData.length > 0
    ? aarrFunnelData.map((stage, index) => ({
      step: stage.stage,
      users: stage.value,
      dropoff: index > 0 && aarrFunnelData[index - 1].value > 0
        ? Math.max(0, Math.round((1 - stage.value / aarrFunnelData[index - 1].value) * 100))
        : 0,
    }))
    : [];

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPersona.mutateAsync({
        name: formData.name,
        description: formData.description,
        characteristics: { list: formData.characteristics.split('\n').filter(Boolean) },
        behaviors: { list: formData.behaviors.split('\n').filter(Boolean) }
      });
      toast.success("Persona added successfully");
      setOpen(false);
      setFormData({ name: "", description: "", characteristics: "", behaviors: "" });
    } catch (error) {
      toast.error("Failed to add persona");
    }
  };

  const handleDeletePersona = async (id: string) => {
    if (confirm("Are you sure you want to delete this persona?")) {
      try {
        await deletePersona.mutateAsync(id);
        toast.success("Persona deleted");
      } catch (error) {
        toast.error("Failed to delete persona");
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground mt-4 font-mono text-sm tracking-wider animate-pulse">Initializing Analytics Core...</p>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Database className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">No Usage Data Detected</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The analytics engine requires initial data seeding. Please execute <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">sample-data.sql</code> in the Supabase SQL Editor.
        </p>
        <Button variant="default" size="lg" onClick={() => window.open("https://supabase.com/dashboard", "_blank")} className="shadow-lg shadow-primary/25">
          Open Database Console
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Product Usage
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Real-time user behavior analytics and engagement tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            <Activity className="w-3 h-3 mr-2 animate-pulse" />
            Live Data
          </Badge>
        </div>

      </div>

      {/* Quick Stats - Tech Panels */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Users", value: usageMetrics?.totalUsers?.toLocaleString() || "0", icon: Users, gradient: "from-blue-600 to-blue-700", text: "text-blue-100" },
          { label: "Active Subscriptions", value: usageMetrics?.activeSubscriptions?.toLocaleString() || "0", icon: UserCheck, gradient: "from-violet-600 to-purple-700", text: "text-purple-100" },
          { label: "Daily Active", value: usageMetrics?.dau?.toLocaleString() || "0", icon: Activity, gradient: "from-cyan-500 to-blue-600", text: "text-cyan-100" },
          { label: "DAU/MAU Ratio", value: `${usageMetrics?.dauMauRatio || 0}%`, icon: Repeat, gradient: "from-fuchsia-600 to-pink-700", text: "text-pink-100" }
        ].map((stat, i) => (
          <Card key={i} className={`bg-gradient-to-br ${stat.gradient} border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <stat.icon className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className={`text-sm font-medium ${stat.text}`}>
                {stat.label}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tight text-white shadow-sm">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="aarrr" className="space-y-8">
        <TabsList className="w-full max-w-2xl grid grid-cols-3 bg-muted/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="aarrr" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">AARRR Funnel</TabsTrigger>
          <TabsTrigger value="journey" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">User Journey</TabsTrigger>
          <TabsTrigger value="persona" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">User Persona</TabsTrigger>
        </TabsList>

        {/* AARRR Funnel Tab */}
        <TabsContent value="aarrr" className="space-y-6">
          <div className="grid gap-4">
            {aarrFunnelData.map((item, index) => (
              <Card key={item.stage} className={`border-l-4 overflow-hidden hover:bg-slate-50 transition-all duration-300 ${index === 0 ? "border-l-blue-500 shadow-blue-500/5 hover:shadow-blue-500/10" :
                index === 1 ? "border-l-cyan-500 shadow-cyan-500/5 hover:shadow-cyan-500/10" :
                  index === 2 ? "border-l-indigo-500 shadow-indigo-500/5 hover:shadow-indigo-500/10" :
                    index === 3 ? "border-l-violet-500 shadow-violet-500/5 hover:shadow-violet-500/10" :
                      "border-l-fuchsia-500 shadow-fuchsia-500/5 hover:shadow-fuchsia-500/10"
                } shadow-md`}>
                <CardContent className="flex items-center gap-6 p-6">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner",
                    index === 0 ? "text-blue-600 bg-blue-100" :
                      index === 1 ? "text-cyan-600 bg-cyan-100" :
                        index === 2 ? "text-indigo-600 bg-indigo-100" :
                          index === 3 ? "text-violet-600 bg-violet-100" :
                            "text-fuchsia-600 bg-fuchsia-100"
                  )}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{item.stage}</h3>
                        <p className="text-xs text-slate-500 mb-1">{item.description}</p>
                        <p className="text-3xl font-black tracking-tight text-slate-900">{item.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50 font-mono text-sm px-2">
                          {item.percentage}%
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">of total</p>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                          index === 0 ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                            index === 1 ? "bg-gradient-to-r from-cyan-400 to-cyan-600" :
                              index === 2 ? "bg-gradient-to-r from-indigo-400 to-indigo-600" :
                                index === 3 ? "bg-gradient-to-r from-violet-400 to-violet-600" :
                                  "bg-gradient-to-r from-fuchsia-400 to-fuchsia-600"
                        )}
                        style={{ width: `${Math.max(item.percentage, 2)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      <span className={cn("font-bold text-lg mr-1",
                        index === 0 ? "text-blue-600" :
                          index === 1 ? "text-cyan-600" :
                            index === 2 ? "text-indigo-600" :
                              index === 3 ? "text-violet-600" :
                                "text-fuchsia-600"
                      )}>{item.percentage}%</span> conversion rate from Acquisition
                    </p>
                  </div>
                  {index < aarrFunnelData.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-slate-300" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>User Journey Map</CardTitle>
              <CardDescription>
                Track user progression from signup to active usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneySteps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Awaiting data stream...
                </div>
              ) : (
                <div className="space-y-6">
                  {userJourneySteps.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 ring-2 ring-background">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm uppercase tracking-wide">{step.step}</span>
                            <span className="text-sm font-mono text-muted-foreground">
                              {step.users.toLocaleString()} users
                            </span>
                          </div>
                          <Progress
                            value={(step.users / (userJourneySteps[0]?.users || 1)) * 100}
                            className="h-2.5"
                          />
                        </div>
                        {step.dropoff > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            -{step.dropoff}% Loss
                          </Badge>
                        )}
                      </div>
                      {index < userJourneySteps.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-border/50 -z-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Persona Tab */}
        <TabsContent value="persona" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution by business type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userSegments?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No segmentation data available.
                  </div>
                ) : (
                  userSegments?.map((persona) => (
                    <div key={persona.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{persona.type}</span>
                        <span className="text-muted-foreground font-mono">
                          {persona.count.toLocaleString()} ({persona.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${persona.type === "Small Business" ? "bg-blue-500" :
                            persona.type === "Agency" ? "bg-indigo-500" :
                              persona.type === "Enterprise" ? "bg-purple-500" :
                                "bg-slate-500"
                            }`}
                          style={{ width: `${persona.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Persona Insights</CardTitle>
                  <CardDescription>Key characteristics by segment</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="h-4 w-4" /> Add Persona
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Persona</DialogTitle>
                      <DialogDescription>Define a new user persona based on your insights.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePersona} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Persona Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Growth Marketer"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="characteristics">Key Characteristics (one per line)</Label>
                        <Textarea
                          id="characteristics"
                          placeholder="- Tech savvy&#10;- Budget conscious"
                          value={formData.characteristics}
                          onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="behaviors">Key Behaviors (one per line)</Label>
                        <Textarea
                          id="behaviors"
                          placeholder="- Monthly purchases&#10;- High engagement"
                          value={formData.behaviors}
                          onChange={(e) => setFormData({ ...formData, behaviors: e.target.value })}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createPersona.isPending}>
                          {createPersona.isPending ? "Adding..." : "Add Persona"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {personas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No personas defined yet.
                    </div>
                  ) : (
                    personas.map((p) => (
                      <div key={p.id} className="rounded-xl border border-border/50 p-4 group relative hover:bg-slate-50 transition-colors">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePersona(p.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-primary flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {p.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 ml-4">{p.description}</p>

                        {(p.characteristics as any)?.list && (
                          <div className="mt-2 ml-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Characteristics</p>
                            <div className="flex flex-wrap gap-1">
                              {(p.characteristics as any).list.map((c: string, i: number) => (
                                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded textxs font-medium bg-secondary text-secondary-foreground text-[10px]">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
}
