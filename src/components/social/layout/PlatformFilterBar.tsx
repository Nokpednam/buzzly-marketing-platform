import { Switch } from "@/components/ui/switch";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { usePlatformConnections, type Platform } from "@/hooks/usePlatformConnections";

function PlatformIcon({ platform, isActive }: { platform: Platform; isActive: boolean }) {
  return (
    <div className="relative">
      {platform.icon ? (
        <platform.icon
          className={`h-4 w-4 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
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
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-700/50">
      <span className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Layers className="h-3.5 w-3.5" />
        แพลตฟอร์ม
      </span>
      <div className="flex flex-wrap gap-2">
        {connectedPlatforms.map((platform) => {
          const isActive = activePlatforms.includes(platform.id);
          return (
            <label
              key={platform.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-all",
                isActive
                  ? "border-slate-900 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
                  : "border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-80 dark:border-slate-700 dark:bg-slate-800/50"
              )}
            >
              <Switch
                checked={isActive}
                onCheckedChange={() => togglePlatform(platform.id)}
                className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white"
              />
              <div className="flex items-center gap-2">
                <PlatformIcon platform={platform} isActive={isActive} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {platform.name}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
