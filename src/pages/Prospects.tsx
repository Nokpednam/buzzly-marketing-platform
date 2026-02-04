import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Plus,
  Smartphone,
  Clock,
  TrendingUp,
  Loader2,
  Database,
  LayoutGrid,
  BarChart3,
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
import { useCustomerPersonas } from "@/hooks/useCustomerPersonas";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PersonaCard } from "@/components/persona/PersonaCard";
import { CreatePersonaDialog } from "@/components/persona/CreatePersonaDialog";
import type { CustomerPersona } from "@/hooks/useCustomerPersonas";

// Section theme colors
const SECTION_COLORS = {
  age: "#3B82F6",
  income: "#8B5CF6",
  devices: "#EF4444",
  interests: "#10B981",
  profession: "#F97316",
};

// Gender colors
const GENDER_COLORS: Record<string, string> = {
  Male: "#3B82F6",
  Female: "#EC4899",
  Other: "#F59E0B",
  ไม่ระบุ: "#94A3B8",
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "charts">("cards");

  const stats = getPersonaStats();

  // Handle persona creation
  const handleCreatePersona = (data: Parameters<typeof createPersona.mutate>[0]) => {
    createPersona.mutate(data, {
      onSuccess: () => setShowCreateDialog(false),
    });
  };

  // Handle persona deletion
  const handleDeletePersona = (personaId: string) => {
    if (confirm("ต้องการลบ Persona นี้หรือไม่?")) {
      deletePersona.mutate(personaId);
    }
  };

  // Handle edit (placeholder - could open edit dialog)
  const handleEditPersona = (persona: CustomerPersona) => {
    // TODO: Open edit dialog
    console.log("Edit persona:", persona);
  };

  // Loading state
  if (workspaceLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูล Customer Persona...</p>
      </div>
    );
  }

  // No workspace state
  if (!hasTeam || !workspace.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มี Workspace</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          กรุณาสร้าง Workspace ก่อนเพื่อใช้งานฟีเจอร์ Customer Persona
        </p>
        <Button onClick={() => navigate("/settings")}>
          ไปตั้งค่า Workspace
        </Button>
      </div>
    );
  }

  const hasPersonas = personas && personas.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Persona</h1>
          <p className="text-muted-foreground">
            สร้างและจัดการกลุ่มลูกค้าของ {workspace.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasPersonas && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "cards" | "charts")}>
              <TabsList>
                <TabsTrigger value="cards">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="charts">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Charts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            สร้าง Persona
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!hasPersonas && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มี Customer Persona</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              เริ่มสร้าง Persona แรกของคุณเพื่อเก็บข้อมูลกลุ่มลูกค้าที่สนใจธุรกิจของคุณ
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              สร้าง Persona แรก
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Persona Cards View */}
      {hasPersonas && activeTab === "cards" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {personas?.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              genderName={genders?.find((g) => g.id === persona.gender_id)?.name_gender}
              onEdit={handleEditPersona}
              onDelete={handleDeletePersona}
            />
          ))}
        </div>
      )}

      {/* Charts View */}
      {hasPersonas && activeTab === "charts" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{personas?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Personas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.genderDistribution.length}</div>
                <p className="text-sm text-muted-foreground">Gender Types</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.salaryDistribution.length}</div>
                <p className="text-sm text-muted-foreground">Income Segments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.interestDistribution.length}</div>
                <p className="text-sm text-muted-foreground">Unique Interests</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gender Distribution */}
            {stats.genderDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.genderDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.genderDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={GENDER_COLORS[entry.name] || SECTION_COLORS.age}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Income Distribution */}
            {stats.salaryDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Income Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.salaryDistribution.map((item) => {
                      const total = stats.salaryDistribution.reduce((a, b) => a + b.value, 0);
                      const percentage = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Distribution */}
            {stats.deviceDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Preferred Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.deviceDistribution.map((item) => {
                      const total = stats.deviceDistribution.reduce((a, b) => a + b.value, 0);
                      const percentage = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{item.name}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interests Distribution */}
            {stats.interestDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Top Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.interestDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="value" fill={SECTION_COLORS.interests} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <CreatePersonaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePersona}
        teamId={workspace.id}
        genders={genders || []}
        isLoading={createPersona.isPending}
      />
    </div>
  );
}
