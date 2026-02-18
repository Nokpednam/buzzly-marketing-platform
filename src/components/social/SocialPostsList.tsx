import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Calendar,
  Image,
  AlertCircle,
} from "lucide-react";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";

import { usePlatformConnections } from "@/hooks/usePlatformConnections";

const postTypes = ["image", "video", "carousel", "story", "reel"];

interface SocialPostsListProps {
  selectedPosts: string[];
  onSelectPost: (id: string) => void;
  dateRange: string;
  activePlatforms: string[];
}

export function SocialPostsList({ selectedPosts, onSelectPost, dateRange, activePlatforms }: SocialPostsListProps) {
  const { posts, isLoading, createPost, updatePost, deletePost } = useSocialPosts(dateRange);
  const { platforms } = usePlatformConnections();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const [formData, setFormData] = useState({
    platform_id: "",
    post_type: "image",
    content: "",
    status: "draft",
    hashtags: "",
  });

  const resetForm = () => {
    setFormData({
      platform_id: "",
      post_type: "image",
      content: "",
      status: "draft",
      hashtags: "",
    });
  };

  const handleAdd = () => {
    createPost.mutate({
      platform_id: formData.platform_id || null,
      post_type: formData.post_type,
      content: formData.content,
      status: formData.status,
      hashtags: formData.hashtags.split(",").map(h => h.trim()).filter(Boolean),
    });
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedPost) return;
    updatePost.mutate({
      id: selectedPost.id,
      updates: {
        platform_id: formData.platform_id || null,
        post_type: formData.post_type,
        content: formData.content,
        status: formData.status,
        hashtags: formData.hashtags.split(",").map(h => h.trim()).filter(Boolean),
      },
    });
    setEditDialogOpen(false);
    setSelectedPost(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id);
  };

  const openEditDialog = (post: SocialPost) => {
    setSelectedPost(post);
    setFormData({
      platform_id: post.platform_id || "",
      post_type: post.post_type || "image",
      content: post.content || "",
      status: post.status || "draft",
      hashtags: post.hashtags?.join(", ") || "",
    });
    setEditDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "published":
        return <Badge className="bg-success text-success-foreground">เผยแพร่แล้ว</Badge>;
      case "scheduled":
        return <Badge className="bg-info text-info-foreground">กำหนดเวลา</Badge>;
      case "draft":
        return <Badge variant="secondary">แบบร่าง</Badge>;
      case "archived":
        return <Badge variant="outline">เก็บถาวร</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformInfo = (platformId: string | null) => {
    return platforms.find(p => p.id === platformId) || { name: "Unknown", emoji: "📱", id: platformId || "" };
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return "-";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton className="h-40 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างโพสต์
          </Button>
        </div>
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">ยังไม่มีโพสต์</p>
            <p className="text-sm">สร้างโพสต์แรกของคุณเพื่อเริ่มต้น</p>
          </div>
        </Card>

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>สร้างโพสต์ใหม่</DialogTitle>
              <DialogDescription>สร้างโพสต์ social media ใหม่</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.platform_id}
                    onValueChange={(v) => setFormData({ ...formData, platform_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ประเภท</Label>
                  <Select
                    value={formData.post_type}
                    onValueChange={(v) => setFormData({ ...formData, post_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="เขียนเนื้อหาโพสต์..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Hashtags (คั่นด้วยเครื่องหมาย ,)</Label>
                <Input
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  placeholder="Sale, NewCollection, Fashion"
                />
              </div>
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">แบบร่าง</SelectItem>
                    <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                    <SelectItem value="published">เผยแพร่</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAdd} disabled={!formData.content || createPost.isPending}>
                {createPost.isPending ? "กำลังสร้าง..." : "สร้างโพสต์"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {posts.length} โพสต์ | เลือกแล้ว {selectedPosts.length} รายการ
        </p>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างโพสต์
        </Button>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts
          .filter(post => activePlatforms.includes(post.platform_id || ''))
          .map((post) => {
            const platform = getPlatformInfo(post.platform_id);
            return (
              <Card key={post.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={post.media_urls?.[0] || "/placeholder.svg"}
                    alt={post.content?.slice(0, 30) || "Post"}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => onSelectPost(post.id)}
                      disabled={!selectedPosts.includes(post.id) && selectedPosts.length >= 5}
                      className="bg-background"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {getStatusBadge(post.status)}
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-background/80 gap-1">
                      <span>{platform.emoji}</span>
                      {platform.name}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        <Image className="h-3 w-3 mr-1" />
                        {post.post_type}
                      </Badge>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(post)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm line-clamp-2 mb-3">{post.content}</p>

                  {post.status === "published" && (
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Eye className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{formatNumber(post.impressions)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Heart className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{formatNumber(post.likes)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <MessageCircle className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{formatNumber(post.comments)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <TrendingUp className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{post.engagement_rate ? Number(post.engagement_rate).toFixed(1) : "-"}%</p>
                      </div>
                    </div>
                  )}

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.hashtags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-primary">#{tag}</span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>สร้างโพสต์ใหม่</DialogTitle>
            <DialogDescription>สร้างโพสต์ social media ใหม่</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform_id}
                  onValueChange={(v) => setFormData({ ...formData, platform_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(v) => setFormData({ ...formData, post_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>เนื้อหา</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="เขียนเนื้อหาโพสต์..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Hashtags (คั่นด้วยเครื่องหมาย ,)</Label>
              <Input
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                placeholder="Sale, NewCollection, Fashion"
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                  <SelectItem value="published">เผยแพร่</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={!formData.content || createPost.isPending}>
              {createPost.isPending ? "กำลังสร้าง..." : "สร้างโพสต์"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขโพสต์</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform_id}
                  onValueChange={(v) => setFormData({ ...formData, platform_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(v) => setFormData({ ...formData, post_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>เนื้อหา</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <Input
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                  <SelectItem value="published">เผยแพร่</SelectItem>
                  <SelectItem value="archived">เก็บถาวร</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={updatePost.isPending}>
              {updatePost.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
