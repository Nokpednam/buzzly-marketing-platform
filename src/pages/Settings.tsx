import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  Building,
  CreditCard,
  Bell,
  DollarSign,
  Building2,
  Link2,
  Crown,
  Camera,
  Globe,
  ShieldCheck,
  ChevronRight,
  Wallet,
  Star,
  Trash2,
  CheckCircle2,
} from "lucide-react";

// Import your custom sub-components
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { PlatformConnectionsTab } from "@/components/settings/PlatformConnectionsTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { LoyaltyTab } from "@/components/settings/LoyaltyTab";
import { useUserPaymentMethods } from "@/hooks/useUserPaymentMethods";
import { useBudgets } from "@/hooks/useBudgets";
import { Plus, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const settingsGroups = [
  {
    label: "Organization",
    items: [
      { id: "workspace", label: "Workspace", icon: Building2 },
      { id: "company", label: "Company", icon: Building },
      { id: "platforms", label: "Platforms", icon: Link2 },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "profile", label: "My Profile", icon: User },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "billing", label: "Billing & Plan", icon: CreditCard },
      { id: "payment-methods", label: "Payment Methods", icon: Wallet },
      { id: "budget", label: "Budgeting", icon: DollarSign },
      { id: "loyalty", label: "Loyalty Points", icon: Crown },
    ],
  },
];

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    marketing: false,
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    timezone: "Asia/Bangkok",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive",
          });
          return;
        }

        // Fetch from profile_customers and customer tables
        const { data: profileCustomer, error: profileError } = await supabase
          .from('profile_customers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: customer, error: customerError } = await supabase
          .from('customer')
          .select('email, phone_number')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        if (customerError && customerError.code !== 'PGRST116') {
          console.error('Customer fetch error:', customerError);
        }

        setProfileData({
          firstName: profileCustomer?.first_name || "",
          lastName: profileCustomer?.last_name || "",
          email: customer?.email || user.email || "",
          phoneNumber: customer?.phone_number || profileCustomer?.phone_number || "",
          timezone: (profileCustomer as any)?.timezone || "Asia/Bangkok",
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      // Update profile_customers
      const { error: profileError } = await supabase
        .from('profile_customers')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone_number: profileData.phoneNumber,
        } as any)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      // Update customer table for phone
      const { error: customerError } = await supabase
        .from('customer')
        .update({
          phone_number: profileData.phoneNumber,
        })
        .eq('id', user.id);

      if (customerError) {
        console.error('Customer update error:', customerError);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-black tracking-tight uppercase italic">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Configure your workspace, security, and global preferences.
        </p>
      </div>

      <Tabs defaultValue="workspace" className="flex flex-col lg:flex-row gap-12">
        {/* 2. VERTICAL TABS SIDEBAR */}
        <div className="w-full lg:w-64 shrink-0">
          <TabsList className="flex flex-col h-auto bg-transparent gap-6 p-0 items-start">
            {settingsGroups.map((group) => (
              <div key={group.label} className="w-full space-y-2">
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                        "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </TabsTrigger>
                  ))}
                </div>
              </div>
            ))}
          </TabsList>
        </div>

        {/* 3. CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {/* Workspace & Platforms (Subcomponents) */}
          <TabsContent value="workspace" className="mt-0 focus-visible:ring-0">
            <WorkspaceSettings />
          </TabsContent>

          <TabsContent value="platforms" className="mt-0 focus-visible:ring-0">
            <PlatformConnectionsTab />
          </TabsContent>

          {/* Profile Section */}
          <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Personal Identity</CardTitle>
                <CardDescription>Update your avatar and global account credentials.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-background p-6 rounded-2xl border shadow-sm">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:opacity-80 transition-opacity">
                      TF
                    </div>
                    <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full text-white">
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-bold">Thomas Fletcher</h4>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    <div className="pt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-lg h-8">Upload New</Button>
                      <Button size="sm" variant="ghost" className="rounded-lg h-8 text-destructive">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <SettingInput label="First Name" id="firstName" defaultValue="Thomas" />
                  <SettingInput label="Last Name" id="lastName" defaultValue="Fletcher" />
                  <SettingInput label="Email Address" id="email" type="email" defaultValue="thomas@company.com" />
                  <SettingInput label="Phone Number" id="phone" defaultValue="+66 89 123 4567" />

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Timezone</Label>
                    <Select defaultValue="asia-bangkok">
                      <SelectTrigger className="h-12 rounded-xl bg-background border-none shadow-none ring-1 ring-border">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="asia-bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Section */}
          <TabsContent value="company" className="mt-0 focus-visible:ring-0">
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Organization Profile</CardTitle>
                <CardDescription>Global information for Buzzly Ltd.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <SettingInput label="Company Name" id="companyName" defaultValue="Buzzly Ltd." />
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Industry</Label>
                    <Select defaultValue="ecommerce">
                      <SelectTrigger className="h-12 rounded-xl bg-background border-none ring-1 ring-border shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS / Tech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary">Update Company</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Section */}
          <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Channels & Frequency</CardTitle>
                <CardDescription>Control how and when you receive critical alerts.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-2">
                <NotificationSwitch
                  title="Email Reports"
                  desc="Daily campaign summaries delivered to your inbox."
                  checked={notifications.email}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, email: v }))}
                />
                <NotificationSwitch
                  title="Push Notifications"
                  desc="Instant updates in your browser for budget alerts."
                  checked={notifications.push}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, push: v }))}
                />
                <NotificationSwitch
                  title="Weekly Performance Digest"
                  desc="A deep-dive analysis into your growth metrics."
                  checked={notifications.weekly}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, weekly: v }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Section */}
          <TabsContent value="budget" className="mt-0 focus-visible:ring-0">
            <BudgetSection />
          </TabsContent>

          {/* External Components */}
          <TabsContent value="billing" className="mt-0 focus-visible:ring-0">
            <BillingTab />
          </TabsContent>
          <TabsContent value="loyalty" className="mt-0 focus-visible:ring-0">
            <LoyaltyTab />
          </TabsContent>

          {/* Payment Methods Section */}
          <TabsContent value="payment-methods" className="mt-0 focus-visible:ring-0">
            <PaymentMethodsSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SettingInput({ label, id, ...props }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-bold uppercase text-muted-foreground ml-1">
        {label}
      </Label>
      <Input
        id={id}
        className="h-12 rounded-xl bg-background border-none shadow-none ring-1 ring-border focus-visible:ring-primary focus-visible:ring-2"
        {...props}
      />
    </div>
  );
}

function NotificationSwitch({ title, desc, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-all group">
      <div className="space-y-1">
        <p className="font-bold text-sm group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function BudgetSection() {
  const { budgets, isLoading, totalBudget, totalSpent, totalRemaining, alertBudgets, deleteBudget } = useBudgets();

  const getSpendPercent = (budget: any) =>
    budget.amount > 0 ? Math.min((budget.spent_amount / budget.amount) * 100, 100) : 0;

  const isAlert = (budget: any) =>
    budget.amount > 0 && (budget.spent_amount / budget.amount) * 100 >= budget.alert_threshold_percent;

  return (
    <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
      <CardHeader className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Marketing Treasury
            </CardTitle>
            <CardDescription>ติดตามงบประมาณแคมเปญจากฐานข้อมูลจริง</CardDescription>
          </div>
          {alertBudgets.length > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
              <AlertTriangle className="h-3 w-3" /> {alertBudgets.length} Alert{alertBudgets.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Budget", value: `฿${totalBudget.toLocaleString()}`, color: "text-foreground" },
            { label: "Total Spent", value: `฿${totalSpent.toLocaleString()}`, color: "text-amber-600" },
            { label: "Remaining", value: `฿${totalRemaining.toLocaleString()}`, color: "text-emerald-600" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-background border text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-black tracking-tight mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-border/50" />

        {/* Budget List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed">
            <DollarSign className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-muted-foreground">ยังไม่มีงบประมาณ</p>
            <p className="text-sm text-muted-foreground mt-1">เพิ่มงบประมาณผ่าน Supabase หรือ API เพื่อติดตามการใช้จ่าย</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => {
              const pct = getSpendPercent(budget);
              const alert = isAlert(budget);
              return (
                <div
                  key={budget.id}
                  className={cn(
                    "p-5 rounded-2xl border bg-background transition-all",
                    alert && "border-destructive/30 bg-destructive/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{budget.name}</p>
                      {budget.campaign_name && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{budget.campaign_name}</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{budget.budget_type}</Badge>
                      {alert && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] h-4 px-1.5 gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" /> Alert
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ฿{budget.spent_amount.toLocaleString()} / ฿{budget.amount.toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                        onClick={() => deleteBudget.mutate(budget.id)}
                        disabled={deleteBudget.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={cn("h-2", alert && "[&>div]:bg-destructive")}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% used</span>
                    <span className="text-[10px] text-muted-foreground">Alert at {budget.alert_threshold_percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentMethodsSection() {
  const { paymentMethods, isLoading, setDefault, removeMethod } = useUserPaymentMethods();

  const getCardIcon = (brand: string | null) => {
    if (!brand) return "💳";
    const b = brand.toLowerCase();
    if (b.includes("visa")) return "💳";
    if (b.includes("master")) return "💳";
    if (b.includes("amex")) return "💳";
    return "🏦";
  };

  return (
    <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
      <CardHeader className="p-8">
        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Payment Methods
        </CardTitle>
        <CardDescription>
          วิธีชำระเงินที่บันทึกไว้สำหรับการต่ออายุและอัปเกรดแผน
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed">
            <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-muted-foreground">ยังไม่มีวิธีชำระเงิน</p>
            <p className="text-sm text-muted-foreground mt-1">
              วิธีชำระเงินจะปรากฏที่นี่หลังจากคุณชำระเงินครั้งแรก
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border bg-background transition-all",
                  method.is_default && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getCardIcon(method.card_brand)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">
                        {method.card_brand
                          ? `${method.card_brand} •••• ${method.card_last_four}`
                          : method.bank_name
                            ? `${method.bank_name} •••• ${method.account_last_four}`
                            : method.payment_method?.name ?? "Payment Method"}
                      </p>
                      {method.is_default && (
                        <Badge className="bg-primary/10 text-primary text-[10px] h-4 px-1.5">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Default
                        </Badge>
                      )}
                    </div>
                    {method.card_exp_month && method.card_exp_year && (
                      <p className="text-xs text-muted-foreground">
                        Expires {String(method.card_exp_month).padStart(2, "0")}/{method.card_exp_year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 text-xs"
                      onClick={() => setDefault.mutate(method.id)}
                      disabled={setDefault.isPending}
                    >
                      <Star className="h-3 w-3 mr-1" /> Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                    onClick={() => removeMethod.mutate(method.id)}
                    disabled={removeMethod.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          วิธีชำระเงินจะถูกเพิ่มโดยอัตโนมัติเมื่อคุณชำระเงินผ่านหน้า Billing
        </p>
      </CardContent>
    </Card>
  );
}