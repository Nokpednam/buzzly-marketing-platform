import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2 } from "lucide-react";
import { useAds, type AdWithPublishStatus } from "@/hooks/useAds";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PersonaSelector } from "@/components/persona/PersonaSelector";

const creativeTypes = [
  { id: "image", name: "Image" },
  { id: "video", name: "Video" },
  { id: "carousel", name: "Carousel" },
  { id: "text", name: "Text" },
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

interface AdFormData {
  name: string;
  ad_group_id: string;
  creative_type: string;
  headline: string;
  ad_copy: string;
  call_to_action: string;
  status: string;
  content: string;
  media_urls: string[];
  scheduled_at: string;
  platform_id: string;
}

interface AdFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adGroups: { id: string; name: string }[];
  /** Pre-fill the ad_group_id when opened from an Ad Group card */
  initialAdGroupId?: string;
  /** When provided, the dialog is in edit mode */
  adToEdit?: AdWithPublishStatus | null;
}

const defaultForm = (initialAdGroupId?: string): AdFormData => ({
  name: "",
  ad_group_id: initialAdGroupId ?? "__none__",
  creative_type: "image",
  headline: "",
  ad_copy: "",
  call_to_action: "Shop Now",
  status: "draft",
  content: "",
  media_urls: [],
  scheduled_at: "",
  platform_id: "",
});

export const AdFormDialog = ({
  open,
  onOpenChange,
  adGroups,
  initialAdGroupId,
  adToEdit,
}: AdFormDialogProps) => {
  const { createAdWithMirrorPost, updateAd, linkPersonas } = useAds();
  const { workspace } = useWorkspace();
  const isEditMode = !!adToEdit;

  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms", "select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platforms")
        .select("id, name, slug")
        .eq("is_active", true)
        .in("slug", ["facebook", "instagram", "tiktok", "shopee", "google"])
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string; slug: string | null }[];
    },
  });

  const [formData, setFormData] = useState<AdFormData>(defaultForm(initialAdGroupId));
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (adToEdit) {
      setFormData({
        name: adToEdit.name,
        ad_group_id: adToEdit.ad_group_id ?? "__none__",
        creative_type: adToEdit.creative_type ?? "image",
        headline: adToEdit.headline ?? "",
        ad_copy: adToEdit.ad_copy ?? "",
        call_to_action: adToEdit.call_to_action ?? "Shop Now",
        status: adToEdit.status ?? "draft",
        content: adToEdit.content ?? "",
        media_urls: adToEdit.media_urls ?? [],
        scheduled_at: adToEdit.scheduled_at
          ? new Date(adToEdit.scheduled_at).toISOString().slice(0, 16)
          : "",
        platform_id: "",
      });
      setSelectedPersonaIds(
        (adToEdit.ad_personas ?? [])
          .map((ap) => ap.persona_id)
          .filter(Boolean) as string[]
      );
    } else {
      setFormData(defaultForm(initialAdGroupId));
      setSelectedPersonaIds([]);
    }
    setNewMediaUrl("");
  }, [open, adToEdit, initialAdGroupId]);

  const handleAddMediaUrl = () => {
    const trimmed = newMediaUrl.trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, media_urls: [...prev.media_urls, trimmed] }));
    setNewMediaUrl("");
  };

  const handleRemoveMediaUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => ({
    ad_group_id: formData.ad_group_id === "__none__" ? null : formData.ad_group_id,
    creative_type: formData.creative_type,
    name: formData.name,
    status: formData.status,
    headline: formData.headline,
    ad_copy: formData.ad_copy,
    call_to_action: formData.call_to_action,
    content: formData.content || null,
    media_urls: formData.media_urls.length > 0 ? formData.media_urls : null,
    scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
    creative_url: "/placeholder.svg",
    platform_ad_id: null,
    preview_url: null,
    updated_at: new Date().toISOString(),
  });

  const handleSubmit = () => {
    if (!formData.name) return;

    if (isEditMode && adToEdit) {
      updateAd.mutate(
        { id: adToEdit.id, updates: buildPayload() },
        {
          onSuccess: () => {
            linkPersonas.mutate({ adId: adToEdit.id, personaIds: selectedPersonaIds });
            onOpenChange(false);
          },
        }
      );
    } else {
      createAdWithMirrorPost.mutate(
        { ...buildPayload(), platform_id: formData.platform_id || null },
        {
          onSuccess: (newAd) => {
            if (newAd) {
              linkPersonas.mutate({ adId: newAd.id, personaIds: selectedPersonaIds });
            }
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isPending = createAdWithMirrorPost.isPending || updateAd.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "แก้ไขโฆษณา" : "สร้างโฆษณาใหม่"}</DialogTitle>
          {!isEditMode && (
            <DialogDescription>สร้าง Ad ใหม่สำหรับแคมเปญของคุณ</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>ชื่อโฆษณา</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer Sale Ad"
            />
          </div>

          {/* Platform (create mode only — sets the calendar icon for this ad) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label>แพลตฟอร์ม</Label>
              <Select
                value={formData.platform_id}
                onValueChange={(v) => setFormData({ ...formData, platform_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแพลตฟอร์ม (ไม่บังคับ)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ไม่ระบุ</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Ad Group + Creative Type */}
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
                value={formData.creative_type}
                onValueChange={(v) => setFormData({ ...formData, creative_type: v })}
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

          {/* Headline */}
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Summer Sale 50% Off"
            />
          </div>

          {/* Ad Copy */}
          <div className="space-y-2">
            <Label>Ad Copy</Label>
            <Textarea
              value={formData.ad_copy}
              onChange={(e) => setFormData({ ...formData, ad_copy: e.target.value })}
              placeholder="เนื้อหาโฆษณา..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>เนื้อหาเพิ่มเติม</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="รายละเอียดเพิ่มเติมสำหรับโฆษณา..."
              rows={2}
            />
          </div>

          {/* Media URLs */}
          <div className="space-y-2">
            <Label>Media URLs</Label>
            <div className="flex gap-2">
              <Input
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMediaUrl();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddMediaUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.media_urls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.media_urls.map((url, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 max-w-[200px]">
                    <span className="truncate text-xs">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMediaUrl(i)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled At */}
          <div className="space-y-2">
            <Label>กำหนดเวลาเผยแพร่</Label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            />
          </div>

          {/* Persona targeting */}
          {workspace?.id && (
            <div className="space-y-2">
              <Label>กลุ่มเป้าหมาย (Personas)</Label>
              <PersonaSelector
                selectedIds={selectedPersonaIds}
                onChange={setSelectedPersonaIds}
                teamId={workspace.id}
              />
            </div>
          )}

          {/* CTA + Status */}
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
                  {isEditMode && <SelectItem value="archived">เก็บถาวร</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : isEditMode ? (
              "บันทึก"
            ) : (
              "สร้างโฆษณา"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
