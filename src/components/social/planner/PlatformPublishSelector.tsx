import { cn } from "@/lib/utils";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";

interface PlatformPublishSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function PlatformPublishSelector({
  selectedIds,
  onChange,
  className,
}: PlatformPublishSelectorProps) {
  const { connectedPlatforms } = usePlatformConnections();

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  if (connectedPlatforms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No platforms connected yet
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {connectedPlatforms.map((platform) => {
        const isSelected = selectedIds.includes(platform.id);
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => toggle(platform.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {platform.icon ? (
              <platform.icon className="h-4 w-4 shrink-0" />
            ) : (
              <span className="text-base leading-none">{platform.emoji}</span>
            )}
            <span>{platform.name}</span>
          </button>
        );
      })}
    </div>
  );
}
