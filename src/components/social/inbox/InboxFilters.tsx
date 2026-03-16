import { Search, X, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import type { InboxFiltersState } from "@/hooks/useSocialInbox";

interface InboxFiltersProps {
  filters: InboxFiltersState;
  onFiltersChange: (filters: InboxFiltersState) => void;
}

const SENTIMENTS = [
  { value: "positive", label: "Positive", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "neutral", label: "Neutral", className: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400" },
  { value: "negative", label: "Negative", className: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" },
] as const;

export function InboxFilters({ filters, onFiltersChange }: InboxFiltersProps) {
  const { connectedPlatforms } = usePlatformConnections();

  const togglePlatform = (platformId: string) => {
    const current = filters.platform_ids ?? [];
    const next = current.includes(platformId)
      ? current.filter((id) => id !== platformId)
      : [...current, platformId];
    onFiltersChange({ ...filters, platform_ids: next.length > 0 ? next : undefined });
  };

  const toggleReadFilter = (value: boolean | undefined) => {
    onFiltersChange({ ...filters, is_read: filters.is_read === value ? undefined : value });
  };

  const toggleSentiment = (value: string) => {
    onFiltersChange({ ...filters, sentiment: filters.sentiment === value ? undefined : value });
  };

  const toggleArchived = () => {
    onFiltersChange({ ...filters, showArchived: !filters.showArchived });
  };

  const clearAll = () => {
    onFiltersChange({ search: filters.search, showArchived: filters.showArchived });
  };

  const hasActiveFilters =
    (filters.platform_ids?.length ?? 0) > 0 ||
    filters.is_read !== undefined ||
    !!filters.sentiment ||
    !!filters.showArchived;

  return (
    <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/40 shadow-sm">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search comments or author..."
          value={filters.search ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="pl-9 h-9 text-sm"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Read/Unread toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleReadFilter(false)}
            className={cn(
              "h-7 px-2.5 text-xs rounded-full border",
              filters.is_read === false
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border/40 text-muted-foreground"
            )}
          >
            Unread
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleReadFilter(true)}
            className={cn(
              "h-7 px-2.5 text-xs rounded-full border",
              filters.is_read === true
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border/40 text-muted-foreground"
            )}
          >
            Read
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleArchived}
            className={cn(
              "h-7 px-2.5 text-xs rounded-full border gap-1",
              filters.showArchived
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border/40 text-muted-foreground"
            )}
          >
            <Archive className="h-3 w-3" />
            Archived
          </Button>
        </div>

        {/* Sentiment chips */}
        <div className="flex items-center gap-1.5">
          {SENTIMENTS.map(({ value, label, className }) => (
            <button
              key={value}
              onClick={() => toggleSentiment(value)}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                className,
                filters.sentiment === value && "ring-2 ring-offset-1 ring-current"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Platform filters */}
        {connectedPlatforms.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {connectedPlatforms.map((p) => {
              const isActive = (filters.platform_ids ?? []).includes(p.id);
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                  aria-pressed={isActive}
                >
                  {Icon ? <Icon className="h-3 w-3" /> : <span>{p.emoji}</span>}
                  {p.name}
                </button>
              );
            })}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/30">
          <span className="text-xs text-muted-foreground">Filter:</span>
          {filters.is_read === false && (
            <Badge variant="secondary" className="text-xs h-5 gap-1">
              Unread
              <button onClick={() => onFiltersChange({ ...filters, is_read: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.showArchived && (
            <Badge variant="secondary" className="text-xs h-5 gap-1">
              Archived
              <button onClick={() => onFiltersChange({ ...filters, showArchived: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.is_read === true && (
            <Badge variant="secondary" className="text-xs h-5 gap-1">
              Read
              <button onClick={() => onFiltersChange({ ...filters, is_read: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sentiment && (
            <Badge variant="secondary" className="text-xs h-5 gap-1 capitalize">
              {filters.sentiment}
              <button onClick={() => onFiltersChange({ ...filters, sentiment: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.platform_ids ?? []).map((id) => {
            const platform = connectedPlatforms.find((p) => p.id === id);
            if (!platform) return null;
            return (
              <Badge key={id} variant="secondary" className="text-xs h-5 gap-1">
                {platform.name}
                <button onClick={() => togglePlatform(id)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
