import { useState } from "react";
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
} from "lucide-react";

// Import your custom sub-components
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { PlatformConnectionsTab } from "@/components/settings/PlatformConnectionsTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { LoyaltyTab } from "@/components/settings/LoyaltyTab";

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
      { id: "budget", label: "Budgeting", icon: DollarSign },
      { id: "loyalty", label: "Loyalty Points", icon: Crown },
    ],
  },
];

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    marketing: false,
  });

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
                  onCheckedChange={(v) => setNotifications(p => ({...p, email: v}))}
                />
                <NotificationSwitch 
                  title="Push Notifications" 
                  desc="Instant updates in your browser for budget alerts." 
                  checked={notifications.push} 
                  onCheckedChange={(v) => setNotifications(p => ({...p, push: v}))}
                />
                <NotificationSwitch 
                  title="Weekly Performance Digest" 
                  desc="A deep-dive analysis into your growth metrics." 
                  checked={notifications.weekly} 
                  onCheckedChange={(v) => setNotifications(p => ({...p, weekly: v}))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Section */}
          <TabsContent value="budget" className="mt-0 focus-visible:ring-0">
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Marketing Treasury</CardTitle>
                <CardDescription>Set guardrails for your cross-platform ad spend.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-10">
                <div className="grid gap-6 md:grid-cols-2">
                   <SettingInput label="Monthly Cap (THB)" id="monthlyBudget" type="number" defaultValue="500000" />
                   <SettingInput label="Alert Trigger (%)" id="alertThreshold" type="number" defaultValue="80" />
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Active Allocation
                  </h4>
                  <div className="grid gap-6">
                    {[
                      { name: "Meta Ads", value: 40, color: "bg-blue-500" },
                      { name: "Google Ads", value: 30, color: "bg-emerald-500" },
                      { name: "TikTok Shop", value: 20, color: "bg-black" },
                      { name: "LINE OA", value: 10, color: "bg-green-500" },
                    ].map((channel) => (
                      <div key={channel.name} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase">
                          <span>{channel.name}</span>
                          <Badge variant="secondary" className="rounded-md px-1.5 py-0">{channel.value}%</Badge>
                        </div>
                        <div className="h-2 rounded-full bg-background shadow-inner">
                          <div className={cn("h-full rounded-full transition-all duration-1000", channel.color)} style={{ width: `${channel.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary">Commit Budget</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* External Components */}
          <TabsContent value="billing" className="mt-0 focus-visible:ring-0">
            <BillingTab />
          </TabsContent>
          <TabsContent value="loyalty" className="mt-0 focus-visible:ring-0">
            <LoyaltyTab />
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