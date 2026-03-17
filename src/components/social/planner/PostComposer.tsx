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
  ad_group_id?: string | null;
}

export interface PostComposerProps {
  mode: "create" | "edit" | "preview";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<SocialPostFormData>;
  onSubmit: (data: SocialPostFormData) => void;
  isPending: boolean;
  onRequestEdit?: () => void;
  adGroups?: { id: string; name: string }[];
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
  scheduled_at: "",
  ad_group_id: null,
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function hasValidDateTime(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function PostComposer({
  mode,
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending,
  onRequestEdit,
  adGroups = [],
}: PostComposerProps) {
  const { workspace } = useWorkspace();
  const [formData, setFormData] = useState<SocialPostFormData>(DEFAULT_FORM);
  const [scheduledAtInput, setScheduledAtInput] = useState("");

  useEffect(() => {
    if (open) {
      const nextScheduledAt = toDateTimeLocalValue(initialData?.scheduled_at);
      setFormData({
        ...DEFAULT_FORM,
        ...initialData,
        media_url: initialData?.media_urls?.[0] ?? initialData?.media_url ?? "",
        scheduled_at: nextScheduledAt,
      });
      setScheduledAtInput(nextScheduledAt);
    }
  }, [open, initialData]);

  const isCreate = mode === "create";
  const isPreview = mode === "preview";
  const hasValidScheduledAt = hasValidDateTime(scheduledAtInput);

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      scheduled_at: scheduledAtInput.trim() ? scheduledAtInput : undefined,
    });
  };

  const update = (patch: Partial<SocialPostFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleScheduledAtChange = (value: string) => {
    setScheduledAtInput(value);
    update({ scheduled_at: value });
  };

  const isValid =
    formData.content.trim().length > 0 &&
    formData.platform_ids.length > 0 &&
    hasValidScheduledAt &&
    (formData.content_kind === "organic" || (formData.budget ?? 0) > 0);

  const hashtagList = formData.hashtags
    ? formData.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const titleMap = { create: "Create New Post", edit: "Edit Post", preview: "Post Details" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-h-[90vh] rounded-2xl">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          {isCreate && (
            <DialogDescription>Create a new social media post</DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[calc(90vh-12rem)] overflow-y-auto overflow-x-hidden px-6">
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
              <Label>Post Type</Label>
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
              placeholder="Post name or ad headline"
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
              placeholder="Write post content..."
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
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            )}
          </div>

          {workspace?.id && (
            <div className="space-y-2">
              <Label>Target Personas</Label>
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

          {adGroups.length > 0 && (
            <div className="space-y-2">
              <Label>Ad Group</Label>
              {isPreview ? (
                <p className="text-sm">
                  {adGroups.find((g) => g.id === formData.ad_group_id)?.name ?? "—"}
                </p>
              ) : (
                <Select
                  value={formData.ad_group_id ?? "none"}
                  onValueChange={(v) => update({ ad_group_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {adGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isPreview && (
                <p className="text-xs text-muted-foreground">
                  Link this post to an Ad Group to include in analytics reports
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  {!isCreate && (
                    <SelectItem value="archived">Archived</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Scheduled Date & Time *</Label>
            {isPreview ? (
              <p className="text-sm">
                {formData.scheduled_at
                  ? new Date(formData.scheduled_at).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            ) : (
              <Input
                type="datetime-local"
                value={scheduledAtInput}
                min={toDateTimeLocalValue(new Date().toISOString())}
                onChange={(e) => handleScheduledAtChange(e.target.value)}
                required
                aria-invalid={!hasValidScheduledAt}
              />
            )}
            {!isPreview && (
              <p className="text-xs text-muted-foreground">
                Posts are saved with their scheduled time for display in the calendar
              </p>
            )}
            {!isPreview && !hasValidScheduledAt && (
              <p className="text-xs text-destructive">Please select a valid date and time</p>
            )}
          </div>

          {isPreview && (formData.media_urls?.length || formData.media_url) && (
              <div className="space-y-2">
                <Label>Images / Media</Label>
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
        </div>

        <div className="border-t px-6 py-4 rounded-b-2xl">
          <DialogFooter className="flex flex-row justify-end gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isPreview ? "Close" : "Cancel"}
            </Button>
            {isPreview ? (
              <Button onClick={onRequestEdit}>Edit</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isValid || isPending}>
                {isPending
                  ? isCreate
                    ? "Creating..."
                    : "Saving..."
                  : isCreate
                    ? "Create Post"
                    : "Save"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
