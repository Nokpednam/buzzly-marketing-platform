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
  Trash2
} from "lucide-react";
import { useProductUsageMetrics, useUserSegments } from "@/hooks/useOwnerMetrics";
import { useFunnelData } from "@/hooks/useFunnelData";
import { usePersonas } from "@/hooks/usePersonas";
import { toast } from "sonner";

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

  // Construct AARRR funnel from real data (mapped from useFunnelData)
  // We utilize the calculated values from useFunnelData directly or map them here
  const aarrFunnelData = aarrrCategories.map((stage: any, index: number) => ({
    stage: stage.name,
    icon: [Users, UserCheck, Repeat, Share2, DollarSign][index] || Users, // Fallback icons based on index
    value: stage.value,
    percentage: stage.percentage,
    change: 0 // We don't have historical data for change yet
  }));

  // User journey steps from funnel data
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
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล Product Usage...</p>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มีข้อมูล Product Usage</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูล profiles, activities และ funnel stages
        </p>
        <Button variant="default" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
          เปิด Supabase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Usage Analytics</h1>
        <p className="text-muted-foreground">
          Analyze user behavior and product engagement across Buzzly
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.totalUsers?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.mau?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Monthly Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.dau?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Daily Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{usageMetrics?.dauMauRatio || 0}%</p>
              <p className="text-sm text-muted-foreground">DAU/MAU Ratio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aarrr" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="aarrr">AARRR Funnel</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="persona">User Persona</TabsTrigger>
        </TabsList>

        {/* AARRR Funnel Tab */}
        <TabsContent value="aarrr" className="space-y-6">
          <div className="grid gap-4">
            {aarrFunnelData.map((item, index) => (
              <Card key={item.stage}>
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.stage}</h3>
                        <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.change >= 0 ? "default" : "destructive"}>
                          {item.change >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(item.change)}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">vs last month</p>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.percentage}% conversion rate
                    </p>
                  </div>
                  {index < aarrFunnelData.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Map</CardTitle>
              <CardDescription>
                Track user progression from signup to active usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneySteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  ยังไม่มีข้อมูล Funnel Stages - กรุณารัน sample-data.sql
                </div>
              ) : (
                <div className="space-y-4">
                  {userJourneySteps.map((step, index) => (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{step.step}</span>
                          <span className="text-sm text-muted-foreground">
                            {step.users.toLocaleString()} users
                          </span>
                        </div>
                        <Progress
                          value={(step.users / (userJourneySteps[0]?.users || 1)) * 100}
                          className="h-2"
                        />
                      </div>
                      {step.dropoff > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          -{step.dropoff}%
                        </Badge>
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
            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution by business type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSegments?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ยังไม่มีข้อมูล User Segments
                  </div>
                ) : (
                  userSegments?.map((persona) => (
                    <div key={persona.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{persona.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {persona.count.toLocaleString()} ({persona.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${persona.color}`}
                          style={{ width: `${persona.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Persona Insights</CardTitle>
                  <CardDescription>Key characteristics by segment</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1">
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
                <div className="space-y-4">
                  {personas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No personas defined yet.
                    </div>
                  ) : (
                    personas.map((p) => (
                      <div key={p.id} className="rounded-lg border p-4 group relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePersona(p.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-semibold text-primary">{p.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{p.description}</p>

                        {(p.characteristics as any)?.list && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Characteristics:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                              {(p.characteristics as any).list.map((c: string, i: number) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(p.behaviors as any)?.list && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Behaviors:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                              {(p.behaviors as any).list.map((c: string, i: number) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
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
