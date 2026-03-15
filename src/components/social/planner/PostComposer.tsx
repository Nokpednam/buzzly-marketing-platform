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
import { PlatformPublishSelector } from "@/components/social/planner/PlatformPublishSelector";

export interface SocialPostFormData {
  platform_ids: string[];
  post_type: string;
  content: string;
  status: string;
  hashtags: string;
  scheduled_at?: string;
  media_urls?: string[] | null;
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
  post_type: "image",
  content: "",
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
  const [formData, setFormData] = useState<SocialPostFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (open) {
      setFormData({ ...DEFAULT_FORM, ...initialData });
    }
  }, [open, initialData]);

  const isCreate = mode === "create";
  const isPreview = mode === "preview";

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const update = (patch: Partial<SocialPostFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const isValid = formData.content.trim().length > 0 && formData.platform_ids.length > 0;

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
            <Label>ประเภท</Label>
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
            <Label>เนื้อหา</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="เขียนเนื้อหาโพสต์..."
              rows={4}
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

          {isPreview && formData.media_urls && formData.media_urls.length > 0 && (
            <div className="space-y-2">
              <Label>รูปภาพ / มีเดีย</Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {formData.media_urls.map((url, i) => (
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
