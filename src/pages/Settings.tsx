import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useProfileCustomer } from "@/hooks/useProfileCustomer";
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
    birthday: "",
    genderId: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Use the shared hook for profile data
  const { data: serverProfile, isLoading: isServerLoading, invalidate } = useProfileCustomer();

  // Sync server data to local form state when it loads
  useEffect(() => {
    if (serverProfile) {
      setProfileData({
        firstName: serverProfile.first_name || "",
        lastName: serverProfile.last_name || "",
        // Form needs email, but profile_customers doesn't store it, 
        // fallback to auth.email if we had it, or keep existing to not wipe it while typing
        email: profileData.email,
        phoneNumber: serverProfile.phone_number || "",
        birthday: serverProfile.birthday_at ? serverProfile.birthday_at.split('T')[0] : "",
        genderId: serverProfile.gender || "",
      });
      setAvatarUrl(serverProfile.avatar_url || null);
    }
  }, [serverProfile]);

  // Fetch user email separately since it's in auth/customer, not profile_customers
  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileData(p => ({ ...p, email: user.email || "" }));
      }
    };
    fetchEmail();
  }, []);

  const isLoadingProfile = isServerLoading;

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

      // Upsert profile_customers (creates row if not exist, updates if exist)
      const { error: profileError } = await supabase
        .from('profile_customers')
        .upsert({
          user_id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone_number: profileData.phoneNumber,
          birthday_at: profileData.birthday ? new Date(profileData.birthday).toISOString().split('T')[0] : null,
          gender: profileData.genderId || null,
        } as any, {
          onConflict: 'user_id',
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast({
          title: "Error",
          description: "Failed to update profile: " + profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Update customer table for full_name and phone.
      // Use .update() to avoid accidentally overwriting plan_type or other
      // billing-managed columns (the trigger creates the row on sign-up).
      const { error: customerError } = await supabase
        .from('customer')
        .update({
          full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          phone_number: profileData.phoneNumber,
        })
        .eq('id', user.id);

      if (customerError) {
        console.error('Customer update error:', customerError);
        toast({
          title: "Warning",
          description: "Profile saved, but failed to sync display name: " + customerError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      invalidate(); // Re-fetch to sync with sidebar
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

  // Handle avatar upload
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ไฟล์ใหญ่เกิน 2MB", variant: "destructive" });
      return;
    }
    try {
      setIsUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Save URL to profile_customers
      await supabase
        .from('profile_customers')
        .upsert({ user_id: user.id, avatar_url: publicUrl } as any, { onConflict: 'user_id' });

      setAvatarUrl(publicUrl + '?t=' + Date.now()); // bust cache
      toast({ title: "อัปโหลดรูปสำเร็จ!" });
      invalidate(); // Re-fetch to sync with sidebar
    } catch (err: any) {
      toast({ title: "อัปโหลดไม่สำเร็จ", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  // Handle avatar remove
  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove all avatar files for this user
      const { data: files } = await supabase.storage.from('avatars').list(user.id);
      if (files && files.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove(files.map(f => `${user.id}/${f.name}`));
      }

      // Clear avatar_url in DB
      await supabase
        .from('profile_customers')
        .upsert({ user_id: user.id, avatar_url: null } as any, { onConflict: 'user_id' });

      setAvatarUrl(null);
      toast({ title: "ลบรูปสำเร็จ!" });
      invalidate(); // Re-fetch to sync with sidebar
    } catch (err: any) {
      toast({ title: "ลบรูปไม่สำเร็จ", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "workspace");

  const navigateToPaymentMethods = () => setActiveTab("payment-methods");

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-black tracking-tight uppercase italic">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Configure your workspace, security, and global preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-12">
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
                      id={`tab-${item.id}`}
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
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-24 w-24 rounded-full object-cover shadow-xl group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:opacity-80 transition-opacity uppercase">
                        {(profileData.firstName?.charAt(0) || "") + (profileData.lastName?.charAt(0) || "") || profileData.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full text-white cursor-pointer">
                      <Camera className="h-6 w-6" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} disabled={isUploadingAvatar} />
                    </label>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-bold">{profileData.firstName || profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : "Unnamed User"}</h4>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    <div className="pt-2 flex gap-2">
                      <label className="cursor-pointer">
                        <Button size="sm" variant="outline" className="rounded-lg h-8" disabled={isUploadingAvatar} asChild>
                          <span>{isUploadingAvatar ? "Uploading..." : "Upload New"}</span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} disabled={isUploadingAvatar} />
                      </label>
                      {avatarUrl && (
                        <Button size="sm" variant="ghost" className="rounded-lg h-8 text-destructive" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>Remove</Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <SettingInput
                    label="First Name"
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e: any) => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                  />
                  <SettingInput
                    label="Last Name"
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e: any) => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                  />
                  <SettingInput
                    label="Email Address"
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                  />
                  <SettingInput
                    label="Phone Number"
                    id="phone"
                    value={profileData.phoneNumber}
                    onChange={(e: any) => setProfileData(p => ({ ...p, phoneNumber: e.target.value }))}
                  />

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Birthday</Label>
                    <Input
                      type="date"
                      value={profileData.birthday}
                      onChange={(e) => setProfileData(p => ({ ...p, birthday: e.target.value }))}
                      className="h-12 rounded-xl bg-background border-none shadow-none ring-1 ring-border focus-visible:ring-primary focus-visible:ring-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Gender</Label>
                    <Select value={profileData.genderId} onValueChange={(v) => setProfileData(p => ({ ...p, genderId: v }))}>
                      <SelectTrigger className="h-12 rounded-xl bg-background border-none shadow-none ring-1 ring-border">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="lgbtq+">LGBTQ+</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoadingProfile || isSavingProfile}
                    className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </Button>
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
            <BillingTab onNavigateToPaymentMethods={navigateToPaymentMethods} />
          </TabsContent>
          <TabsContent value="loyalty" className="mt-0 focus-visible:ring-0">
            <LoyaltyTab />
          </TabsContent>

          {/* Payment Methods Section */}
          <TabsContent value="payment-methods" className="mt-0 focus-visible:ring-0">
            <PaymentMethodsSection />
          </TabsContent>
        </div>
      </Tabs >
    </div >
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
  const { paymentMethods, isLoading, setDefault, removeMethod, addMethod } = useUserPaymentMethods();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const getCardIcon = (brand: string | null) => {
    if (!brand) return "💳";
    const b = brand.toLowerCase();
    if (b.includes("visa")) return "💳";
    if (b.includes("master")) return "💳";
    if (b.includes("amex")) return "💳";
    return "🏦";
  };

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc || !newCard.name) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลบัตรให้ครบทุกช่อง",
        variant: "destructive",
      });
      return;
    }

    // Parse expiry MM/YY
    const [expMonthStr, expYearStr] = newCard.expiry.split('/');
    if (!expMonthStr || !expYearStr || expMonthStr.length !== 2 || expYearStr.length !== 2) {
      toast({
        title: "รูปแบบวันหมดอายุไม่ถูกต้อง",
        description: "กรุณาระบุในรูปแบบ MM/YY (เช่น 12/26)",
        variant: "destructive",
      });
      return;
    }

    const expMonth = parseInt(expMonthStr, 10);
    const expYear = 2000 + parseInt(expYearStr, 10); // Assume 20xx

    // Determine brand based on number (simple check)
    let brand = "unknown";
    if (newCard.number.startsWith("4")) brand = "visa";
    if (newCard.number.startsWith("5")) brand = "mastercard";

    try {
      await addMethod.mutateAsync({
        brand,
        last4: newCard.number.slice(-4),
        expMonth,
        expYear,
        name: newCard.name
      });

      toast({
        title: "เพิ่มบัตรสำเร็จ",
        description: "บัตรเครดิตของคุณถูกเพิ่มเรียบร้อยแล้ว",
      });

      setIsAddDialogOpen(false);
      setNewCard({ number: "", expiry: "", cvc: "", name: "" });
    } catch (error) {
      // Error handled in hook, but we catch here to stop flow if needed
    }
  };

  return (
    <>
      <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Payment Methods
              </CardTitle>
              <CardDescription>
                วิธีชำระเงินที่บันทึกไว้สำหรับการต่ออายุและอัปเกรดแผน
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-xl shadow-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              เพิ่มบัตรใหม่
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed bg-background/50">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-lg">ยังไม่มีวิธีชำระเงิน</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">
                เพิ่มบัตรเครดิตหรือเดบิตเพื่อความสะดวกในการชำระค่าบริการและต่ออายุอัตโนมัติ
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="rounded-xl">
                เพิ่มวิธีการชำระเงิน
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border bg-background transition-all hover:shadow-sm",
                    method.is_default && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-2xl">
                      {getCardIcon(method.card_brand)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-base">
                          {method.card_brand
                            ? `${method.card_brand} •••• ${method.card_last_four}`
                            : method.bank_name
                              ? `${method.bank_name} •••• ${method.account_last_four}`
                              : method.payment_method?.name ?? "Payment Method"}
                        </p>
                        {method.is_default && (
                          <Badge className="bg-primary/10 text-primary text-[10px] h-5 px-2 rounded-full border-primary/20 shadow-none">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Default
                          </Badge>
                        )}
                      </div>
                      {method.card_exp_month && method.card_exp_year && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Expires {String(method.card_exp_month).padStart(2, "0")}/{method.card_exp_year}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-9 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                        onClick={() => setDefault.mutate(method.id)}
                        disabled={setDefault.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs mt-4">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              ข้อมูลการชำระเงินของคุณถูกจัดเก็บอย่างปลอดภัยด้วยมาตรฐาน PCI DSS สากล
              เราไม่เก็บข้อมูลบัตรเครดิตฉบับเต็มไว้ในระบบของเรา
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มบัตรเครดิต/เดบิต</DialogTitle>
            <DialogDescription>
              เพิ่มบัตรใหม่สำหรับชำระค่าบริการ บัตรนี้จะถูกบันทึกไว้อย่างปลอดภัย
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อบนบัตร</Label>
              <Input
                id="name"
                placeholder="JOHN DOE"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">หมายเลขบัตร</Label>
              <div className="relative">
                <Input
                  id="number"
                  placeholder="0000 0000 0000 0000"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="pl-10"
                />
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">วันหมดอายุ</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  maxLength={4}
                  value={newCard.cvc}
                  onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={addMethod.isPending}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddCard} disabled={addMethod.isPending}>
              {addMethod.isPending ? "กำลังบันทึก..." : "บันทึกบัตร"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}