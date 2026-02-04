import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Plus, Search, Send, Eye, MousePointer, Clock, Edit, Copy, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = [
  {
    id: 1,
    name: "Welcome Series - Day 1",
    subject: "Welcome to Buzzly! 🎉",
    category: "Onboarding",
    openRate: 68,
    clickRate: 24,
    lastUsed: "2 days ago",
    status: "active",
  },
  {
    id: 2,
    name: "Product Launch Announcement",
    subject: "Introducing our newest feature...",
    category: "Product",
    openRate: 52,
    clickRate: 18,
    lastUsed: "1 week ago",
    status: "active",
  },
  {
    id: 3,
    name: "Monthly Newsletter",
    subject: "Your November digest is here",
    category: "Newsletter",
    openRate: 45,
    clickRate: 12,
    lastUsed: "3 days ago",
    status: "active",
  },
  {
    id: 4,
    name: "Re-engagement Campaign",
    subject: "We miss you! Here's 20% off",
    category: "Retention",
    openRate: 38,
    clickRate: 15,
    lastUsed: "2 weeks ago",
    status: "draft",
  },
  {
    id: 5,
    name: "Cart Abandonment",
    subject: "You left something behind...",
    category: "E-commerce",
    openRate: 55,
    clickRate: 28,
    lastUsed: "5 days ago",
    status: "active",
  },
];

const recentEmails = [
  {
    id: 1,
    subject: "Black Friday Early Access",
    recipients: 12500,
    sent: "Nov 25, 2025",
    delivered: 12380,
    opened: 6820,
    clicked: 2150,
    status: "completed",
  },
  {
    id: 2,
    subject: "Weekly Product Updates",
    recipients: 8200,
    sent: "Nov 24, 2025",
    delivered: 8150,
    opened: 3680,
    clicked: 920,
    status: "completed",
  },
  {
    id: 3,
    subject: "Customer Satisfaction Survey",
    recipients: 5000,
    sent: "Nov 23, 2025",
    delivered: 4950,
    opened: 1980,
    clicked: 680,
    status: "completed",
  },
];

export default function Email() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-muted-foreground">Create and manage email campaigns with AI-powered optimization</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Email
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">124.5K</p>
                <p className="text-xs text-success">+8% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
                <p className="text-2xl font-bold">42.8%</p>
                <p className="text-xs text-success">+3.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <MousePointer className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Click Rate</p>
                <p className="text-2xl font-bold">18.5%</p>
                <p className="text-xs text-success">+1.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Email Templates</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="border shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h4 className="mt-3 font-semibold">{template.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{template.subject}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            template.status === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {template.openRate}%
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {template.clickRate}%
                        </span>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell>{email.sent}</TableCell>
                      <TableCell>{email.recipients.toLocaleString()}</TableCell>
                      <TableCell>
                        {email.delivered.toLocaleString()}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({((email.delivered / email.recipients) * 100).toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        {email.opened.toLocaleString()}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({((email.opened / email.delivered) * 100).toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        {email.clicked.toLocaleString()}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({((email.clicked / email.opened) * 100).toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {email.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Email Automation</h3>
              <p className="mt-2 text-center text-muted-foreground max-w-md">
                Set up automated email sequences to nurture leads and engage customers automatically.
              </p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Automation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
