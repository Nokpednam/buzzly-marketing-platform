import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Link2Off, Search, Megaphone, Leaf } from "lucide-react";
import { useAdGroups } from "@/hooks/useAdGroups";
import { useLinkableItems, type LinkablePost, type LinkableAd } from "@/hooks/useLinkableItems";
import { useQueryClient } from "@tanstack/react-query";
import { logError } from "@/services/errorLogger";

interface LinkItemsDialogProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatPostLabel(post: LinkablePost): string {
  if (post.content?.trim()) return post.content.trim();
  if (post.name?.trim()) return post.name.trim();
  const preview = post.content ? post.content.slice(0, 60) : "(ไม่มีชื่อโพสต์)";
  return preview.length < (post.content?.length ?? 0) ? `${preview}…` : preview;
}

export function LinkItemsDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: LinkItemsDialogProps) {
  const queryClient = useQueryClient();
  const { linkItemsToGroup, unlinkItemFromGroup } = useAdGroups();
  const { unlinkedPosts, unlinkedAds, linkedPosts, linkedAds, isLoading } =
    useLinkableItems(groupId);

  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [adSearch, setAdSearch] = useState("");

  const togglePost = (id: string) =>
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAd = (id: string) =>
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const filteredPosts = unlinkedPosts.filter((p) =>
    (p.name ?? p.content ?? "").toLowerCase().includes(postSearch.toLowerCase())
  );

  const filteredAds = unlinkedAds.filter((a) =>
    a.name.toLowerCase().includes(adSearch.toLowerCase()) ||
    (a.headline ?? "").toLowerCase().includes(adSearch.toLowerCase())
  );

  const handleLinkPosts = () => {
    if (selectedPostIds.length === 0) return;
    linkItemsToGroup.mutate(
      { groupId, postIds: selectedPostIds },
      {
        onSuccess: () => {
          setSelectedPostIds([]);
          queryClient.invalidateQueries({ queryKey: ["linkable_posts_unlinked"] });
          queryClient.invalidateQueries({ queryKey: ["linkable_posts_linked", groupId] });
        },
        onError: (err) => logError("LinkItemsDialog.handleLinkPosts", err),
      }
    );
  };

  const handleLinkAds = () => {
    if (selectedAdIds.length === 0) return;
    linkItemsToGroup.mutate(
      { groupId, adIds: selectedAdIds },
      {
        onSuccess: () => {
          setSelectedAdIds([]);
          queryClient.invalidateQueries({ queryKey: ["linkable_ads_unlinked"] });
          queryClient.invalidateQueries({ queryKey: ["linkable_ads_linked", groupId] });
        },
        onError: (err) => logError("LinkItemsDialog.handleLinkAds", err),
      }
    );
  };

  const handleUnlinkPost = (itemId: string) => {
    unlinkItemFromGroup.mutate(
      { table: "social_posts", itemId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["linkable_posts_unlinked"] });
          queryClient.invalidateQueries({ queryKey: ["linkable_posts_linked", groupId] });
        },
        onError: (err) => logError("LinkItemsDialog.handleUnlinkPost", err),
      }
    );
  };

  const handleUnlinkAd = (itemId: string) => {
    unlinkItemFromGroup.mutate(
      { table: "ads", itemId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["linkable_ads_unlinked"] });
          queryClient.invalidateQueries({ queryKey: ["linkable_ads_linked", groupId] });
        },
        onError: (err) => logError("LinkItemsDialog.handleUnlinkAd", err),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            เชื่อมโยงโพสต์/โฆษณา
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{groupName}</p>
        </DialogHeader>

        <Tabs defaultValue="posts" className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="posts" className="gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" />
              Organic Posts
              {linkedPosts.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {linkedPosts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5">
              <Megaphone className="h-3.5 w-3.5 text-blue-500" />
              Paid Ads
              {linkedAds.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {linkedAds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Posts tab ── */}
          <TabsContent value="posts" className="flex-1 flex flex-col gap-3 min-h-0 mt-3">
            {linkedPosts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  เชื่อมโยงแล้ว ({linkedPosts.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {linkedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm bg-muted/40"
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Leaf className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{formatPostLabel(post)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleUnlinkPost(post.id)}
                        disabled={unlinkItemFromGroup.isPending}
                        title="ยกเลิกการเชื่อมโยง"
                      >
                        <Link2Off className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="ค้นหาจากชื่อโพสต์ (Post Title)..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : filteredPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {postSearch ? "ไม่พบโพสต์ที่ค้นหา" : "ไม่มี Organic Post ที่ยังไม่ได้เชื่อมโยง"}
                </p>
              ) : (
                filteredPosts.map((post) => (
                  <label
                    key={post.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedPostIds.includes(post.id)}
                      onCheckedChange={() => togglePost(post.id)}
                    />
                    <Leaf className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="flex-1 truncate">{formatPostLabel(post)}</span>
                    {post.status && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {post.status}
                      </Badge>
                    )}
                  </label>
                ))
              )}
            </div>

            <div className="shrink-0 flex justify-end pt-2 border-t">
              <Button
                onClick={handleLinkPosts}
                disabled={selectedPostIds.length === 0 || linkItemsToGroup.isPending}
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                เชื่อมโยง {selectedPostIds.length > 0 ? `(${selectedPostIds.length})` : ""}
              </Button>
            </div>
          </TabsContent>

          {/* ── Ads tab ── */}
          <TabsContent value="ads" className="flex-1 flex flex-col gap-3 min-h-0 mt-3">
            {linkedAds.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  เชื่อมโยงแล้ว ({linkedAds.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {linkedAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm bg-muted/40"
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Megaphone className="h-3 w-3 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ad.name}</p>
                          {ad.headline && (
                            <p className="text-xs text-muted-foreground truncate">{ad.headline}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleUnlinkAd(ad.id)}
                        disabled={unlinkItemFromGroup.isPending}
                        title="ยกเลิกการเชื่อมโยง"
                      >
                        <Link2Off className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="ค้นหาจากชื่อโฆษณา (Ad Name)..."
                value={adSearch}
                onChange={(e) => setAdSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : filteredAds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {adSearch ? "ไม่พบโฆษณาที่ค้นหา" : "ไม่มี Paid Ad ที่ยังไม่ได้เชื่อมโยง"}
                </p>
              ) : (
                filteredAds.map((ad) => (
                  <label
                    key={ad.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedAdIds.includes(ad.id)}
                      onCheckedChange={() => toggleAd(ad.id)}
                    />
                    <Megaphone className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ad.name}</p>
                      {ad.headline && (
                        <p className="text-xs text-muted-foreground truncate">{ad.headline}</p>
                      )}
                    </div>
                    {ad.status && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {ad.status}
                      </Badge>
                    )}
                  </label>
                ))
              )}
            </div>

            <div className="shrink-0 flex justify-end pt-2 border-t">
              <Button
                onClick={handleLinkAds}
                disabled={selectedAdIds.length === 0 || linkItemsToGroup.isPending}
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                เชื่อมโยง {selectedAdIds.length > 0 ? `(${selectedAdIds.length})` : ""}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
