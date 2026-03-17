import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pause,
  Play,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignWithInsights } from "@/hooks/useCampaigns";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  draft: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  completed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

const METRIC_COL_WIDTH = "w-[72px]";

interface CampaignListCardProps {
  campaign: CampaignWithInsights & { progress: number };
  formatNumber: (n: number) => string;
  onToggleStatus: (id: string, status: string | null) => void;
  onEdit: (c: CampaignWithInsights) => void;
  onDuplicate: (c: CampaignWithInsights) => void;
  onDelete: (id: string) => void;
}

export const CampaignListCard: React.FC<CampaignListCardProps> = ({
  campaign,
  formatNumber,
  onToggleStatus,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative rounded-xl bg-white border border-[#E2E8F0] cursor-pointer hover:border-slate-300 transition-colors"
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
    >
      {/* Slim horizontal row */}
      <div className="flex items-center gap-4 px-4 py-2.5">
        {/* Status Badge */}
        <div className="w-14 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 uppercase tracking-[0.05em]",
              statusStyles[campaign.status || "draft"],
            )}
          >
            {campaign.status?.toUpperCase() || "DRAFT"}
          </Badge>
        </div>

        {/* Campaign Name + meta */}
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{campaign.name}</h3>
          <span className="text-[10px] tabular-nums text-slate-400 shrink-0">{campaign.progress}%</span>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
            <Clock className="size-4 text-slate-400" />
            {campaign.start_date
              ? new Date(campaign.start_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
            · ฿{campaign.budget_amount?.toLocaleString() ?? "—"}
          </p>
        </div>

        {/* 4 Metric Columns — fixed widths */}
        <div className={cn("flex items-center shrink-0", METRIC_COL_WIDTH)}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Impr.</p>
            <p className="font-semibold tabular-nums text-sm text-slate-900">{formatNumber(campaign.impressions)}</p>
          </div>
        </div>
        <div className={cn("flex items-center shrink-0", METRIC_COL_WIDTH)}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">CTR</p>
            <p className="font-mono tracking-tighter text-sm font-bold text-slate-900">
              {((campaign.clicks / (campaign.impressions || 1)) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
        <div className={cn("flex items-center shrink-0", METRIC_COL_WIDTH)}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Conv.</p>
            <p className="font-semibold tabular-nums text-sm text-slate-900">{formatNumber(campaign.conversions)}</p>
          </div>
        </div>
        <div className={cn("flex items-center shrink-0", METRIC_COL_WIDTH)}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Cost/Conv</p>
            <p className="font-semibold tabular-nums text-sm text-slate-900">
              ฿{(campaign.spend / (campaign.conversions || 1)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0 w-16 justify-end" onClick={(e) => e.stopPropagation()}>
          {campaign.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleStatus(campaign.id, campaign.status)}
            >
              {campaign.status === "active" ? (
                <Pause className="size-4 text-slate-400" />
              ) : (
                <Play className="size-4 text-slate-400" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="size-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 border border-[#E2E8F0]">
              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)} className="text-xs">
                <Eye className="size-4 mr-2 text-slate-400" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(campaign)} className="text-xs">
                <Edit className="size-4 mr-2 text-slate-400" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(campaign)} className="text-xs">
                <Copy className="size-4 mr-2 text-slate-400" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(campaign.id)} className="text-destructive text-xs">
                <Trash2 className="size-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2px thin progress line at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-slate-100">
        <div
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${campaign.progress}%` }}
        />
      </div>
    </div>
  );
};
