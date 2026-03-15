import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlatformPublishSelector } from "@/components/social/planner/PlatformPublishSelector";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface SocialPostFormData {
  platform_ids: string[];
  content_kind: "organic" | "paid";
  post_type: string;
  headline: string;
  content: string;
  media_url: string;
  budget: number | null;
  status: string;
  hashtags: string;
  scheduled_at?: string;
  media_urls?: string[] | null;
  persona_ids?: string[];
}

export interface PostComposerProps {
  mode: "create" | "edit" | "preview";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<SocialPostFormData>;
  onSubmit: (data: SocialPostFormData) => void;
  isPending: boolean;
  onRequestEdit?: () => void;
}

const POST_TYPES = ["image", "video", "carousel", "story", "reel"];

const DEFAULT_FORM: SocialPostFormData = {
  platform_ids: [],
  content_kind: "organic",
  post_type: "image",
  headline: "",
  content: "",
  media_url: "",
  budget: null,
  status: "draft",
  hashtags: "",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "แบบร่าง",
  scheduled: "กำหนดเวลา",
  published: "เผยแพร่",
  archived: "เก็บถาวร",
};

export function PostComposer({
  mode,
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
  onRequestEdit,
}: PostComposerProps) {
  const { workspace } = useWorkspace();
  const [formData, setFormData] = useState<SocialPostFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (open) {
      setFormData({
        ...DEFAULT_FORM,
        ...initialData,
        media_url: initialData?.media_urls?.[0] ?? initialData?.media_url ?? "",
      });
    }
  }, [open, initialData]);

  const isCreate = mode === "create";
  const isPreview = mode === "preview";

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const update = (patch: Partial<SocialPostFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const isValid =
    formData.content.trim().length > 0 &&
    formData.platform_ids.length > 0 &&
    (formData.content_kind === "organic" || (formData.budget ?? 0) > 0);

  const hashtagList = formData.hashtags
    ? formData.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const titleMap = { create: "สร้างโพสต์ใหม่", edit: "แก้ไขโพสต์", preview: "รายละเอียดโพสต์" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          {isCreate && (
            <DialogDescription>สร้างโพสต์ social media ใหม่</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className={isPreview ? "pointer-events-none opacity-60" : undefined}>
              <PlatformPublishSelector
                selectedIds={formData.platform_ids}
                onChange={(ids) => update({ platform_ids: ids })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ประเภทโพสต์</Label>
            <RadioGroup
              value={formData.content_kind}
              onValueChange={(value: "organic" | "paid") => update({ content_kind: value })}
              disabled={isPreview || !isCreate}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="content-kind-organic"
                className="flex cursor-pointer items-center gap-2 rounded-lg border p-3"
              >
                <RadioGroupItem id="content-kind-organic" value="organic" />
                Organic Post
              </Label>
              <Label
                htmlFor="content-kind-paid"
                className="flex cursor-pointer items-center gap-2 rounded-lg border p-3"
              >
                <RadioGroupItem id="content-kind-paid" value="paid" />
                Paid Ad
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Creative Format</Label>
            <Select
              value={formData.post_type}
              onValueChange={(v) => update({ post_type: v })}
              disabled={isPreview}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={formData.headline}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="ชื่อโพสต์หรือพาดหัวโฆษณา"
              disabled={isPreview}
            />
          </div>

          {formData.content_kind === "paid" && (
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget ?? ""}
                onChange={(e) =>
                  update({
                    budget: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="0.00"
                disabled={isPreview}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Content / Caption</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="เขียนเนื้อหาโพสต์..."
              rows={4}
              disabled={isPreview}
            />
          </div>

          <div className="space-y-2">
            <Label>Media URL</Label>
            <Input
              value={formData.media_url}
              onChange={(e) => update({ media_url: e.target.value })}
              placeholder="https://example.com/image-or-video"
              disabled={isPreview}
            />
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            {isPreview ? (
              <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                {hashtagList.length > 0 ? (
                  hashtagList.map((tag) => (
                    <Badge key={tag} variant="secondary">#{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            ) : (
              <Input
                value={formData.hashtags}
                onChange={(e) => update({ hashtags: e.target.value })}
                placeholder="Sale, NewCollection, Fashion"
              />
            )}
            {!isPreview && (
              <p className="text-xs text-muted-foreground">คั่นด้วยเครื่องหมาย ,</p>
            )}
          </div>

          {workspace?.id && (
            <div className="space-y-2">
              <Label>กลุ่มเป้าหมาย (Personas)</Label>
              {isPreview ? (
                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                  {(formData.persona_ids ?? []).length > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {formData.persona_ids?.length} personas
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              ) : (
                <PersonaSelector
                  selectedIds={formData.persona_ids ?? []}
                  onChange={(ids) => update({ persona_ids: ids })}
                  teamId={workspace.id}
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>สถานะ</Label>
            {isPreview ? (
              <p className="text-sm">{STATUS_LABELS[formData.status] ?? formData.status}</p>
            ) : (
              <Select
                value={formData.status}
                onValueChange={(v) => update({ status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                  <SelectItem value="published">เผยแพร่</SelectItem>
                  {!isCreate && (
                    <SelectItem value="archived">เก็บถาวร</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {(formData.status === "scheduled" || (isPreview && formData.scheduled_at)) && (
            <div className="space-y-2">
              <Label>วันเวลาที่กำหนด</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at ?? ""}
                onChange={(e) => update({ scheduled_at: e.target.value })}
                disabled={isPreview}
              />
            </div>
          )}

          {isPreview && (formData.media_urls?.length || formData.media_url) && (
            <div className="space-y-2">
              <Label>รูปภาพ / มีเดีย</Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(formData.media_urls?.length ? formData.media_urls : [formData.media_url]).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`media-${i}`}
                    className="h-20 w-20 shrink-0 rounded-md object-cover border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isPreview ? "ปิด" : "ยกเลิก"}
          </Button>
          {isPreview ? (
            <Button onClick={onRequestEdit}>แก้ไข</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isValid || isPending}>
              {isPending
                ? isCreate
                  ? "กำลังสร้าง..."
                  : "กำลังบันทึก..."
                : isCreate
                  ? "สร้างโพสต์"
                  : "บันทึก"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
