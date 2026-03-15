import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Image,
  Video,
  FileText,
  Play,
  Pause,
  CheckCircle2,
  PauseCircle,
  FileEdit,
  Archive,
  HelpCircle,
  Eye,
  Calendar,
  Link2,
  Loader2,
  Send,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAds, type AdWithPublishStatus as Ad } from "@/hooks/useAds";
import { AdFormDialog } from "@/components/social/analytics/AdFormDialog";

const PUBLISH_PLATFORMS = [
  { id: "facebook",  label: "Facebook Ads",  emoji: "📘" },
  { id: "instagram", label: "Instagram Ads", emoji: "📸" },
  { id: "tiktok",   label: "TikTok Ads",    emoji: "🎵" },
  { id: "shopee",   label: "Shopee Ads",    emoji: "🛍️" },
  { id: "linkedin", label: "LinkedIn Ads",  emoji: "💼" },
];

const creativeTypes = [
  { id: "image",    name: "Image",    icon: Image },
  { id: "video",    name: "Video",    icon: Video },
  { id: "carousel", name: "Carousel", icon: FileText },
  { id: "text",     name: "Text",     icon: FileText },
];

interface AdsListProps {
  adGroups: { id: string; name: string }[];
  filterAdGroupId?: string;
}

export function AdsList({ adGroups, filterAdGroupId }: AdsListProps) {
  const { ads, isLoading, updateAd, deleteAd, publishAd } = useAds();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishPlatform, setPublishPlatform] = useState("facebook");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const handleDelete = (id: string) => {
    deleteAd.mutate(id);
  };

  const handleToggleStatus = (id: string, currentStatus: string | null) => {
    updateAd.mutate({
      id,
      updates: {
        status: currentStatus === "active" ? "paused" : "active",
        updated_at: new Date().toISOString(),
      },
    });
  };

  const openEditDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setEditDialogOpen(true);
  };

  const openDetailDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setDetailDialogOpen(true);
  };

  const openPublishDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setPublishPlatform(ad.platform || "facebook");
    setPublishDialogOpen(true);
  };

  const handlePublish = () => {
    if (!selectedAd) return;
    publishAd.mutate({ adId: selectedAd.id, platform: publishPlatform });
    setPublishDialogOpen(false);
  };

  const getExternalStatusBadge = (ad: Ad) => {
    if (!ad.external_status) return null;
    if (ad.external_status === "pending")
      return <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3 w-3" />Publishing…</span>;
    if (ad.external_status === "published")
      return <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3 w-3" />{ad.platform}</span>;
    if (ad.external_status === "failed")
      return <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />Failed</span>;
    return null;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active":
        return { icon: CheckCircle2, label: "กำลังทำงาน", className: "text-success" };
      case "paused":
        return { icon: PauseCircle, label: "หยุดชั่วคราว", className: "text-warning" };
      case "draft":
        return { icon: FileEdit, label: "แบบร่าง", className: "text-muted-foreground" };
      case "archived":
        return { icon: Archive, label: "เก็บถาวร", className: "text-muted-foreground" };
      default:
        return { icon: HelpCircle, label: status || "Unknown", className: "text-muted-foreground" };
    }
  };

  const getCreativeType = (type: string | null) => {
    return creativeTypes.find((t) => t.id === type) ?? { name: "Image", icon: Image };
  };

  const getAdGroupName = (groupId: string | null) => {
    if (!groupId) return "-";
    return adGroups.find((g) => g.id === groupId)?.name || groupId;
  };

  const visibleAds = filterAdGroupId
    ? ads.filter((ad) => ad.ad_group_id === filterAdGroupId)
    : ads;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{visibleAds.length} โฆษณา</p>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างโฆษณา
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โฆษณา</TableHead>
                <TableHead>กลุ่มโฆษณา</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : visibleAds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {filterAdGroupId ? "ไม่พบโฆษณาใน Ad Group นี้" : "ยังไม่มีโฆษณา"}
                  </TableCell>
                </TableRow>
              ) : (
                visibleAds.map((ad) => {
                  const creativeType = getCreativeType(ad.creative_type);
                  const CreativeIcon = creativeType.icon;
                  const statusInfo = getStatusIcon(ad.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <CreativeIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{ad.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {ad.ad_copy}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getAdGroupName(ad.ad_group_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <CreativeIcon className="h-3 w-3" />
                          {creativeType.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2 text-sm font-normal max-w-[150px] truncate justify-start"
                          onClick={() => openDetailDialog(ad)}
                        >
                          <Eye className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">{ad.headline || "-"}</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2"
                          onClick={() => openDetailDialog(ad)}
                        >
                          <Badge variant="secondary" className="text-xs cursor-pointer">
                            {ad.call_to_action}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center">
                              <StatusIcon className={`h-5 w-5 ${statusInfo.className}`} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{statusInfo.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {getExternalStatusBadge(ad) ?? (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {ad.preview_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(ad.preview_url!, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(ad)}>
                                <Eye className="h-4 w-4 mr-2" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(ad)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                แก้ไข
                              </DropdownMenuItem>
                              {ad.external_status !== "published" && (
                                <DropdownMenuItem onClick={() => openPublishDialog(ad)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  เผยแพร่บน Platform
                                </DropdownMenuItem>
                              )}
                              {(ad.status === "active" || ad.status === "paused") && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(ad.id, ad.status)}>
                                  {ad.status === "active" ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" />
                                      หยุดชั่วคราว
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      เปิดใช้งาน
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(ad.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Dialog — delegates to shared AdFormDialog */}
        <AdFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          adGroups={adGroups}
        />

        {/* Edit Dialog — delegates to shared AdFormDialog */}
        <AdFormDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedAd(null);
          }}
          adGroups={adGroups}
          adToEdit={selectedAd}
        />

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAd && (
                  <>
                    {(() => {
                      const ct = getCreativeType(selectedAd.creative_type);
                      const CtIcon = ct.icon;
                      return <CtIcon className="h-5 w-5 text-muted-foreground" />;
                    })()}
                    {selectedAd.name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>รายละเอียดโฆษณาทั้งหมด</DialogDescription>
            </DialogHeader>

            {selectedAd && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusInfo = getStatusIcon(selectedAd.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon className={`h-5 w-5 ${statusInfo.className}`} />
                        <span className="text-sm font-medium">{statusInfo.label}</span>
                      </>
                    );
                  })()}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Headline</Label>
                    <p className="text-sm font-medium mt-1">{selectedAd.headline || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ad Copy</Label>
                    <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">
                      {selectedAd.ad_copy || "-"}
                    </p>
                  </div>
                  {selectedAd.content && (
                    <div>
                      <Label className="text-xs text-muted-foreground">เนื้อหา</Label>
                      <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">
                        {selectedAd.content}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Call to Action</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedAd.call_to_action}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">กลุ่มโฆษณา</Label>
                    <p className="text-sm mt-1">{getAdGroupName(selectedAd.ad_group_id)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ประเภท Creative</Label>
                    <p className="text-sm mt-1">{getCreativeType(selectedAd.creative_type).name}</p>
                  </div>
                  {selectedAd.scheduled_at && (
                    <div>
                      <Label className="text-xs text-muted-foreground">กำหนดเผยแพร่</Label>
                      <p className="text-sm mt-1">{formatDate(selectedAd.scheduled_at)}</p>
                    </div>
                  )}
                  {selectedAd.media_urls && selectedAd.media_urls.length > 0 && (
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Media URLs</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAd.media_urls.map((url, i) => (
                          <Badge key={i} variant="outline" className="text-xs max-w-[200px] truncate">
                            {url}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedAd.platform_ad_id && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Platform Ad ID</Label>
                    <p className="text-sm mt-1 font-mono text-muted-foreground">
                      {selectedAd.platform_ad_id}
                    </p>
                  </div>
                )}

                {selectedAd.preview_url && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Preview URL</Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-1 text-sm"
                      onClick={() => window.open(selectedAd.preview_url!, "_blank")}
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      เปิดดูตัวอย่าง
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>สร้างเมื่อ: {formatDate(selectedAd.created_at ?? "")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>อัปเดต: {formatDate(selectedAd.updated_at ?? "")}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                ปิด
              </Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  if (selectedAd) openEditDialog(selectedAd);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                แก้ไข
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                เผยแพร่โฆษณา
              </DialogTitle>
              <DialogDescription>
                เลือก Platform ที่ต้องการเผยแพร่ &ldquo;{selectedAd?.name}&rdquo;
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {PUBLISH_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPublishPlatform(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    publishPlatform === p.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  {p.label}
                  {publishPlatform === p.id && (
                    <CheckCircle2 className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handlePublish} disabled={publishAd.isPending}>
                {publishAd.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                เผยแพร่
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
