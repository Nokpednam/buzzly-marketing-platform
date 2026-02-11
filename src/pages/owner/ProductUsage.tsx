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
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  Database,
  Plus,
  Trash2,
  Activity
} from "lucide-react";
import { useProductUsageMetrics, useUserSegments } from "@/hooks/useOwnerMetrics";
import { useFunnelData } from "@/hooks/useFunnelData";
import { usePersonas } from "@/hooks/usePersonas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductUsage() {
  const navigate = useNavigate();
  const { data: usageMetrics, isLoading: usageLoading } = useProductUsageMetrics();
  const { funnelStages, aarrrCategories, isLoading: funnelLoading } = useFunnelData();
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

  const isLoading = usageLoading || funnelLoading || segmentsLoading;
  const hasData = (usageMetrics?.totalUsers || 0) > 0 || aarrrCategories.length > 0;

  // Construct AARRR funnel from real data
  const aarrFunnelData = aarrrCategories.map((stage: any, index: number) => ({
    stage: stage.name,
    icon: [Users, UserCheck, Repeat, Share2, DollarSign][index] || Users,
    value: stage.value,
    percentage: stage.percentage,
    change: 0
  }));

  // User journey steps
  const userJourneySteps = funnelStages?.length > 0
    ? funnelStages.map((stage, index) => ({
      step: stage.name || "Step",
      users: stage.value || 0,
      dropoff: index > 0 && funnelStages[index - 1].value
        ? Math.round((1 - (stage.value || 0) / funnelStages[index - 1].value) * 100)
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
          { label: "Total Users", value: usageMetrics?.totalUsers?.toLocaleString() || 0, icon: Users, color: "text-blue-500" },
          { label: "Monthly Active", value: usageMetrics?.mau?.toLocaleString() || 0, icon: UserCheck, color: "text-indigo-500" },
          { label: "Daily Active", value: usageMetrics?.dau?.toLocaleString() || 0, icon: Activity, color: "text-cyan-500" },
          { label: "DAU/MAU Ratio", value: `${usageMetrics?.dauMauRatio || 0}%`, icon: Repeat, color: "text-violet-500" }
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <CardContent className="pt-6 relative z-10">
              <div className="text-left">
                <p className="text-4xl font-bold tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
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
              <Card key={item.stage} className="border-l-4 border-l-primary/50 overflow-hidden hover:bg-slate-50 transition-colors">
                <CardContent className="flex items-center gap-6 p-6">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10",
                    index === 0 ? "text-blue-500 bg-blue-500/10" :
                      index === 1 ? "text-cyan-500 bg-cyan-500/10" :
                        index === 2 ? "text-indigo-500 bg-indigo-500/10" :
                          index === 3 ? "text-violet-500 bg-violet-500/10" :
                            "text-fuchsia-500 bg-fuchsia-500/10"
                  )}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.stage}</h3>
                        <p className="text-2xl font-bold tracking-tight text-foreground">{item.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.change >= 0 ? "default" : "destructive"} className="ml-auto">
                          {item.change >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                          {Math.abs(item.change)}%
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">vs 30d avg</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out",
                          index === 0 ? "bg-blue-500" :
                            index === 1 ? "bg-cyan-500" :
                              index === 2 ? "bg-indigo-500" :
                                index === 3 ? "bg-violet-500" :
                                  "bg-fuchsia-500"
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium text-foreground">{item.percentage}%</span> conversion rate
                    </p>
                  </div>
                  {index < aarrFunnelData.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
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
    </div>
  );
}
