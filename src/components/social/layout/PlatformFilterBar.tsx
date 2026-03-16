import { cn } from "@/lib/utils";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { usePlatformConnections, type Platform } from "@/hooks/usePlatformConnections";

function PlatformIcon({ platform, isActive }: { platform: Platform; isActive: boolean }) {
  return (
    <div className="relative">
      {platform.icon ? (
        <platform.icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
      ) : (
        <span className="text-sm">{platform.emoji}</span>
      )}
      {isActive && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
    </div>
  );
}

export function PlatformFilterBar() {
  const { activePlatforms, setActivePlatforms } = useSocialFilters();
  const { connectedPlatforms } = usePlatformConnections();

  const togglePlatform = (id: string) => {
    setActivePlatforms((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (connectedPlatforms.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {connectedPlatforms.map((platform) => {
        const isActive = activePlatforms.includes(platform.id);
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => togglePlatform(platform.id)}
            title={platform.name}
            aria-label={`${isActive ? "Deselect" : "Select"} ${platform.name}`}
            className={cn(
              "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all",
              isActive
                ? "border-primary bg-primary/10 dark:bg-primary/20"
                : "border-border/30 bg-muted/20 opacity-70 hover:opacity-100 hover:border-border/50"
            )}
          >
            <PlatformIcon platform={platform} isActive={isActive} />
          </button>
        );
      })}
    </div>
  );
}
