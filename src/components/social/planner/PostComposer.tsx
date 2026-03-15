import { useState, useEffect } from "react";
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
import { PlatformPublishSelector } from "@/components/social/planner/PlatformPublishSelector";

export interface SocialPostFormData {
  platform_ids: string[];
  post_type: string;
  content: string;
  status: string;
  hashtags: string;
  scheduled_at?: string;
}

export interface PostComposerProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<SocialPostFormData>;
  onSubmit: (data: SocialPostFormData) => void;
  isPending: boolean;
}

const POST_TYPES = ["image", "video", "carousel", "story", "reel"];

const DEFAULT_FORM: SocialPostFormData = {
  platform_ids: [],
  post_type: "image",
  content: "",
  status: "draft",
  hashtags: "",
};

export function PostComposer({
  mode,
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
}: PostComposerProps) {
  const [formData, setFormData] = useState<SocialPostFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (open) {
      setFormData({ ...DEFAULT_FORM, ...initialData });
    }
  }, [open, initialData]);

  const isCreate = mode === "create";

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const update = (patch: Partial<SocialPostFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const isValid = formData.content.trim().length > 0 && formData.platform_ids.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? "สร้างโพสต์ใหม่" : "แก้ไขโพสต์"}</DialogTitle>
          {isCreate && (
            <DialogDescription>สร้างโพสต์ social media ใหม่</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Platforms</Label>
            <PlatformPublishSelector
              selectedIds={formData.platform_ids}
              onChange={(ids) => update({ platform_ids: ids })}
            />
          </div>

          <div className="space-y-2">
            <Label>ประเภท</Label>
            <Select
              value={formData.post_type}
              onValueChange={(v) => update({ post_type: v })}
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
            />
          </div>

          <div className="space-y-2">
            <Label>Hashtags (คั่นด้วยเครื่องหมาย ,)</Label>
            <Input
              value={formData.hashtags}
              onChange={(e) => update({ hashtags: e.target.value })}
              placeholder="Sale, NewCollection, Fashion"
            />
          </div>

          <div className="space-y-2">
            <Label>สถานะ</Label>
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
          </div>

          {formData.status === "scheduled" && (
            <div className="space-y-2">
              <Label>วันเวลาที่กำหนด</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at ?? ""}
                onChange={(e) => update({ scheduled_at: e.target.value })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending
              ? isCreate
                ? "กำลังสร้าง..."
                : "กำลังบันทึก..."
              : isCreate
                ? "สร้างโพสต์"
                : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
