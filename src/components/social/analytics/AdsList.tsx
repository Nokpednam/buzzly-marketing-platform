import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Image,
  Video,
  FileText,
  CheckCircle2,
  PauseCircle,
  FileEdit,
  Archive,
  HelpCircle,
  Eye,
  Calendar,
  Link2,
  Loader2,
  AlertCircle,
  Clock,
  Megaphone,
} from "lucide-react";
import { useAds, type AdWithPublishStatus as Ad } from "@/hooks/useAds";
import { useAdInsights } from "@/hooks/useAdInsights";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { useWorkspace } from "@/hooks/useWorkspace";

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

interface AdMetrics {
  clicks: number;
  conversions: number;
  impressions: number;
  spend: number;
}

const EMPTY_METRICS: AdMetrics = {
  clicks: 0,
  conversions: 0,
  impressions: 0,
  spend: 0,
};

const toMetricNumber = (...values: Array<number | string | null | undefined>): number => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export function AdsList({ adGroups, filterAdGroupId }: AdsListProps) {
  const { ads, isLoading, error } = useAds();
  const { dateRange, activePlatforms } = useSocialFilters();
  const { workspace } = useWorkspace();
  const {
    insights,
    isLoading: isInsightsLoading,
    error: insightsError,
  } = useAdInsights(dateRange, activePlatforms, workspace?.id, filterAdGroupId);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const openDetailDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setDetailDialogOpen(true);
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

  const adMetrics = useMemo(() => {
    const metricsByAdId = new Map<string, AdMetrics>();

    for (const insight of insights as Array<{
      ads_id?: string | null;
      clicks?: number | null;
      conversions?: number | null;
      impressions?: number | null;
      spend?: number | string | null;
      total_cost?: number | string | null;
    }>) {
      if (!insight.ads_id) {
        continue;
      }

      const current = metricsByAdId.get(insight.ads_id) ?? { ...EMPTY_METRICS };
      current.impressions += insight.impressions ?? 0;
      current.clicks += insight.clicks ?? 0;
      current.conversions += insight.conversions ?? 0;
      current.spend += toMetricNumber(insight.spend, insight.total_cost);
      metricsByAdId.set(insight.ads_id, current);
    }

    return metricsByAdId;
  }, [insights]);

  const visibleAds = filterAdGroupId
    ? ads.filter((ad) => ad.ad_group_id === filterAdGroupId)
    : ads;

  const selectedAdMetrics = selectedAd ? adMetrics.get(selectedAd.id) ?? EMPTY_METRICS : EMPTY_METRICS;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) =>
    "฿" + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatNumber = (value: number) => value.toLocaleString();

  if (error || insightsError) {
    return (
      <div className="rounded-lg border p-6 text-sm text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>ไม่สามารถโหลด Paid Ads analytics ได้</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{visibleAds.length} Paid Ads</p>
          <p className="text-xs text-muted-foreground">Read-only ad inventory with performance metrics</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Ad Group</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-[120px] text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isInsightsLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : visibleAds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  {filterAdGroupId ? "ไม่พบโฆษณาใน Ad Group นี้" : "ยังไม่มีโฆษณา"}
                </TableCell>
              </TableRow>
            ) : (
              visibleAds.map((ad) => {
                const creativeType = getCreativeType(ad.creative_type);
                const CreativeIcon = creativeType.icon;
                const statusInfo = getStatusIcon(ad.status);
                const StatusIcon = statusInfo.icon;
                const metrics = adMetrics.get(ad.id) ?? EMPTY_METRICS;

                return (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <CreativeIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{ad.name}</p>
                          <p className="max-w-[220px] line-clamp-1 text-xs text-muted-foreground">
                            {ad.headline || ad.ad_copy || "-"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                        <Megaphone className="h-3 w-3" />
                        Paid Ad
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{getAdGroupName(ad.ad_group_id)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm capitalize">{ad.platform ?? "-"}</p>
                        {getExternalStatusBadge(ad)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(metrics.impressions)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(metrics.clicks)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(metrics.spend)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <StatusIcon className={`${statusInfo.className} h-3.5 w-3.5`} />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetailDialog(ad)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Ad Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setSelectedAd(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-500" />
              Ad Details
            </DialogTitle>
            <DialogDescription>Read-only creative and performance breakdown for this paid ad</DialogDescription>
          </DialogHeader>

          {selectedAd && (
            <div className="space-y-5 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                  <Megaphone className="h-3 w-3" />
                  Paid Ad
                </Badge>
                <Badge variant="outline">{getCreativeType(selectedAd.creative_type).name}</Badge>
                {getExternalStatusBadge(selectedAd)}
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="mt-1 text-lg font-semibold">{formatNumber(selectedAdMetrics.impressions)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Clicks</p>
                  <p className="mt-1 text-lg font-semibold">{formatNumber(selectedAdMetrics.clicks)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Spend</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(selectedAdMetrics.spend)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Conversions</p>
                  <p className="mt-1 text-lg font-semibold">{formatNumber(selectedAdMetrics.conversions)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Ad Name</Label>
                    <p className="mt-1 text-sm font-medium">{selectedAd.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Headline</Label>
                    <p className="mt-1 text-sm">{selectedAd.headline || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ad Copy</Label>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {selectedAd.ad_copy || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Call to Action</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedAd.call_to_action || "-"}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Ad Group</Label>
                    <p className="mt-1 text-sm">{getAdGroupName(selectedAd.ad_group_id)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Platform</Label>
                    <p className="mt-1 text-sm capitalize">{selectedAd.platform ?? "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="mt-1 text-sm">{getStatusIcon(selectedAd.status).label}</p>
                  </div>
                  {selectedAd.content && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Audience / Notes</Label>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {selectedAd.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAd.media_urls && selectedAd.media_urls.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Media URLs</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAd.media_urls.map((url, index) => (
                        <Badge key={index} variant="outline" className="max-w-[240px] truncate text-xs">
                          {url}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(selectedAd.platform_ad_id || selectedAd.preview_url) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {selectedAd.platform_ad_id && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Platform Ad ID</Label>
                        <p className="mt-1 font-mono text-sm text-muted-foreground">{selectedAd.platform_ad_id}</p>
                      </div>
                    )}
                    {selectedAd.preview_url && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Preview URL</Label>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-sm"
                          onClick={() => window.open(selectedAd.preview_url!, "_blank")}
                        >
                          <Link2 className="mr-1 h-3 w-3" />
                          เปิดดูตัวอย่าง
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
