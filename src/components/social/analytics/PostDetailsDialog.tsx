import type { FC } from "react";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import type { SocialPost } from "@/hooks/useSocialPosts";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  ImageIcon,
  Leaf,
  Megaphone,
  MessageCircle,
  Repeat2,
} from "lucide-react";

interface PostDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: SocialPost | null;
}

const getStatusBadgeClassName = (status: string | null) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "archived":
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case "published":
      return CheckCircle2;
    case "scheduled":
      return Clock3;
    case "archived":
      return Archive;
    default:
      return ImageIcon;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const PostDetailsDialog: FC<PostDetailsDialogProps> = ({
  open,
  onOpenChange,
  post,
}) => {
  const navigate = useNavigate();
  const { getPlatformById } = usePlatformConnections();

  if (!post) {
    return null;
  }

  const platform = post.platform_id ? getPlatformById(post.platform_id) : undefined;
  const PlatformIcon = platform?.icon;
  const StatusIcon = getStatusIcon(post.status);
  const metrics = [
    {
      label: "Likes",
      value: post.likes ?? 0,
      icon: Heart,
      className: "text-rose-500",
    },
    {
      label: "Comments",
      value: post.comments ?? 0,
      icon: MessageCircle,
      className: "text-sky-500",
    },
    {
      label: "Shares",
      value: post.shares ?? 0,
      icon: Repeat2,
      className: "text-emerald-500",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {post.post_channel === "ad" ? (
              <>
                <Megaphone className="h-5 w-5 text-blue-500" />
                Paid Ad Details
              </>
            ) : (
              <>
                <Leaf className="h-5 w-5 text-emerald-500" />
                Organic Post Details
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Full post content, publishing details, and organic engagement metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {post.post_channel === "ad" ? (
              <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                <Megaphone className="h-3 w-3" />
                Paid Ad
              </Badge>
            ) : (
              <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Leaf className="h-3 w-3" />
                Organic
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              {PlatformIcon ? <PlatformIcon className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
              {platform?.name ?? "Unknown Platform"}
            </Badge>
            <Badge className={`gap-1 ${getStatusBadgeClassName(post.status)}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {post.status ?? "draft"}
            </Badge>
            {post.ad_group_name && (
              <Badge variant="outline" className="gap-1">
                {post.ad_group_name}
              </Badge>
            )}
          </div>

          {post.media_urls?.[0] && (
            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/30">
              <img
                src={post.media_urls[0]}
                alt={post.display_title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">
              {post.display_title}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {post.content ?? "—"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className={`h-4 w-4 ${metric.className}`} />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-xl font-semibold">{metric.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Scheduled At</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDateTime(post.scheduled_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published At</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDateTime(post.published_at)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Reach / Impressions</p>
                <p className="mt-1 text-sm">
                  {(post.reach ?? 0).toLocaleString()} reach
                  {" · "}
                  {(post.impressions ?? 0).toLocaleString()} impressions
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clicks / Engagement Rate</p>
                <p className="mt-1 text-sm">
                  {(post.clicks ?? 0).toLocaleString()} clicks
                  {" · "}
                  {Number(post.engagement_rate ?? 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {post.hashtags && post.hashtags.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              navigate("/social/planner");
            }}
          >
            {post.post_channel === "ad" ? "View/Edit in Planner" : "Edit in Planner"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
