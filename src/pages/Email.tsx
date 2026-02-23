import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Plus, Search, Send, Eye, MousePointer, Clock, Edit, Copy, Trash2, MoreHorizontal, Loader2, InboxIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdPosts, AdPostInsert } from "@/hooks/useAdPosts";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  sent: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-muted",
};

const CATEGORIES = ["Onboarding", "Product", "Newsletter", "Retention", "E-commerce", "Promotion", "Other"];

export default function Email() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<AdPostInsert>({
    name: "",
    subject: "",
    category: "",
    status: "draft",
    team_id: "", // Will be set by hook but needed for type
  });

  const {
    adPosts,
    isLoading,
    stats,
    createAdPost,
    deleteAdPost,
    duplicateAdPost,
  } = useAdPosts();

  const filtered = adPosts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const drafts = filtered.filter((c) => c.status === "draft");
  const sent = filtered.filter((c) => c.status === "sent");

  const handleCreate = async () => {
    if (!form.name) return;
    await createAdPost.mutateAsync({
      name: form.name,
      subject: form.subject,
      category: form.category,
      status: form.status,
      scheduled_at: form.scheduled_at
    });
    setCreateOpen(false);
    setForm({ name: "", subject: "", category: "", status: "draft", team_id: "" });
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing (Ad Posts)</h1>
          <p className="text-muted-foreground">Manage your ad posts and email campaigns.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Ad Post
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
                <p className="text-sm text-muted-foreground">Total Sent</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{formatCount(stats.totalSent)}</p>
                )}
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
                {isLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                )}
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
                {isLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                )}
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
                {isLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.scheduledCount}</p>
                )}
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Drafts & Templates</TabsTrigger>
          <TabsTrigger value="recent">Sent History</TabsTrigger>
        </TabsList>

        {/* Templates Tab — shows drafts */}
        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Drafts</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search drafts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border shadow-none">
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
                  <p className="text-muted-foreground mb-4">Create a new ad post to get started.</p>
                  <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Ad Post
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {drafts.map((post) => (
                    <Card key={post.id} className="border shadow-none">
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
                              <DropdownMenuItem onClick={() => duplicateAdPost.mutate(post)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteAdPost.mutate(post.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h4 className="mt-3 font-semibold">{post.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{post.subject || "No subject"}</p>
                        <div className="mt-3 flex items-center gap-2">
                          {post.category && (
                            <Badge variant="secondary">{post.category}</Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={statusStyles[post.status] || statusStyles.draft}
                          >
                            {post.status}
                          </Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Created {format(new Date(post.created_at), "MMM d, yyyy")}
                        </p>
                        <Button className="mt-4 w-full" variant="outline">
                          Edit Draft
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Campaigns Tab — shows sent */}
        <TabsContent value="recent">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sent History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : sent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Send className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sent posts yet</h3>
                  <p className="text-muted-foreground">Sent items will appear here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Clicked</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.subject || post.name}</TableCell>
                        <TableCell>
                          {post.category ? (
                            <Badge variant="secondary">{post.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {post.sent_at
                            ? format(new Date(post.sent_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>{post.recipient_count.toLocaleString()}</TableCell>
                        <TableCell>
                          {post.open_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {post.click_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusStyles[post.status] || statusStyles.draft}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => duplicateAdPost.mutate(post)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteAdPost.mutate(post.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Ad Post</DialogTitle>
            <DialogDescription>
              Create a new ad post or email campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="post-name">Name *</Label>
              <Input
                id="post-name"
                placeholder="e.g. Monthly Newsletter"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-subject">Subject</Label>
              <Input
                id="post-subject"
                placeholder="e.g. Big News Inside! 🚀"
                value={form.subject || ""}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-category">Category</Label>
              <Select
                value={form.category ?? ""}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="post-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-status">Status</Label>
              <Select
                value={form.status ?? "draft"}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as "draft" | "scheduled" | "sent" | "paused" }))}
              >
                <SelectTrigger id="post-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.name || createAdPost.isPending}
              className="gap-2"
            >
              {createAdPost.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
