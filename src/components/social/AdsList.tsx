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
} from "lucide-react";
import { useAds, Ad } from "@/hooks/useAds";

const creativeTypes = [
  { id: "ct-1", name: "Image", icon: Image },
  { id: "ct-2", name: "Video", icon: Video },
  { id: "ct-3", name: "Carousel", icon: FileText },
];

const callToActions = [
  "Shop Now",
  "Learn More",
  "Sign Up",
  "Contact Us",
  "Get Quote",
  "Download",
  "Book Now",
];

interface AdsListProps {
  adGroups: { id: string; name: string }[];
}

export function AdsList({ adGroups }: AdsListProps) {
  const { ads, isLoading, createAd, updateAd, deleteAd } = useAds();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    ad_group_id: "__none__",
    creative_type_id: "ct-1",
    headline: "",
    ad_copy: "",
    call_to_action: "Shop Now",
    status: "draft",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      ad_group_id: "__none__",
      creative_type_id: "ct-1",
      headline: "",
      ad_copy: "",
      call_to_action: "Shop Now",
      status: "draft",
    });
  };

  const handleAdd = () => {
    createAd.mutate({
      ad_group_id: formData.ad_group_id === "__none__" ? null : formData.ad_group_id,
      creative_type_id: formData.creative_type_id,
      name: formData.name,
      status: formData.status,
      creative_url: "/placeholder.svg",
      platform_ad_id: null,
      ad_copy: formData.ad_copy,
      preview_url: null,
      headline: formData.headline,
      call_to_action: formData.call_to_action,
    });
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedAd) return;
    updateAd.mutate({
      id: selectedAd.id,
      updates: {
        name: formData.name,
        ad_group_id: formData.ad_group_id === "__none__" ? null : formData.ad_group_id,
        creative_type_id: formData.creative_type_id,
        headline: formData.headline,
        ad_copy: formData.ad_copy,
        call_to_action: formData.call_to_action,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }
    });
    setEditDialogOpen(false);
    setSelectedAd(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteAd.mutate(id);
  };

  const handleToggleStatus = (id: string, currentStatus: string | null) => {
    updateAd.mutate({
      id,
      updates: {
        status: currentStatus === "active" ? "paused" : "active",
        updated_at: new Date().toISOString(),
      }
    });
  };

  const openEditDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setFormData({
      name: ad.name,
      ad_group_id: ad.ad_group_id || "__none__",
      creative_type_id: ad.creative_type_id || "ct-1",
      headline: ad.headline || "",
      ad_copy: ad.ad_copy || "",
      call_to_action: ad.call_to_action || "Shop Now",
      status: ad.status || "draft",
    });
    setEditDialogOpen(true);
  };

  const openDetailDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setDetailDialogOpen(true);
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

  const getCreativeType = (typeId: string | null) => {
    return creativeTypes.find((t) => t.id === typeId) || { name: "Unknown", icon: FileText };
  };

  const getAdGroupName = (groupId: string | null) => {
    if (!groupId) return "-";
    return adGroups.find((g) => g.id === groupId)?.name || groupId;
  };

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
          <p className="text-sm text-muted-foreground">{ads.length} โฆษณา</p>
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
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีโฆษณา
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => {
                  const creativeType = getCreativeType(ad.creative_type_id);
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

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>สร้างโฆษณาใหม่</DialogTitle>
              <DialogDescription>สร้าง Ad ใหม่สำหรับแคมเปญของคุณ</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อโฆษณา</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Sale Ad"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>กลุ่มโฆษณา</Label>
                  <Select
                    value={formData.ad_group_id}
                    onValueChange={(v) => setFormData({ ...formData, ad_group_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกกลุ่ม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                      {adGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ประเภท Creative</Label>
                  <Select
                    value={formData.creative_type_id}
                    onValueChange={(v) => setFormData({ ...formData, creative_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creativeTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Summer Sale 50% Off"
                />
              </div>
              <div className="space-y-2">
                <Label>Ad Copy</Label>
                <Textarea
                  value={formData.ad_copy}
                  onChange={(e) => setFormData({ ...formData, ad_copy: e.target.value })}
                  placeholder="เนื้อหาโฆษณา..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call to Action</Label>
                  <Select
                    value={formData.call_to_action}
                    onValueChange={(v) => setFormData({ ...formData, call_to_action: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {callToActions.map((cta) => (
                        <SelectItem key={cta} value={cta}>
                          {cta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="active">เปิดใช้งาน</SelectItem>
                      <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAdd} disabled={!formData.name}>
                สร้างโฆษณา
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>แก้ไขโฆษณา</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อโฆษณา</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>กลุ่มโฆษณา</Label>
                  <Select
                    value={formData.ad_group_id}
                    onValueChange={(v) => setFormData({ ...formData, ad_group_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกกลุ่ม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                      {adGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ประเภท Creative</Label>
                  <Select
                    value={formData.creative_type_id}
                    onValueChange={(v) => setFormData({ ...formData, creative_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creativeTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ad Copy</Label>
                <Textarea
                  value={formData.ad_copy}
                  onChange={(e) => setFormData({ ...formData, ad_copy: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call to Action</Label>
                  <Select
                    value={formData.call_to_action}
                    onValueChange={(v) => setFormData({ ...formData, call_to_action: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {callToActions.map((cta) => (
                        <SelectItem key={cta} value={cta}>
                          {cta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="active">เปิดใช้งาน</SelectItem>
                      <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                      <SelectItem value="archived">เก็บถาวร</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleEdit}>บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAd && (
                  <>
                    {(() => {
                      const creativeType = getCreativeType(selectedAd.creative_type_id);
                      const CreativeIcon = creativeType.icon;
                      return <CreativeIcon className="h-5 w-5 text-muted-foreground" />;
                    })()}
                    {selectedAd.name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>รายละเอียดโฆษณาทั้งหมด</DialogDescription>
            </DialogHeader>

            {selectedAd && (
              <div className="space-y-4 py-4">
                {/* Status Badge */}
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

                {/* Content Section */}
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

                  <div>
                    <Label className="text-xs text-muted-foreground">Call to Action</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedAd.call_to_action}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Meta Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">กลุ่มโฆษณา</Label>
                    <p className="text-sm mt-1">{getAdGroupName(selectedAd.ad_group_id)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ประเภท Creative</Label>
                    <p className="text-sm mt-1">{getCreativeType(selectedAd.creative_type_id).name}</p>
                  </div>
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

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>สร้างเมื่อ: {formatDate(selectedAd.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>อัปเดต: {formatDate(selectedAd.updated_at)}</span>
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
      </div>
    </TooltipProvider>
  );
}
