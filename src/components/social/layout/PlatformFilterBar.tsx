import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { usePlatformConnections, type Platform } from "@/hooks/usePlatformConnections";

function PlatformIcon({ platform, isActive }: { platform: Platform; isActive: boolean }) {
  return (
    <div className="relative">
      {platform.icon ? (
        <platform.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
      ) : (
        <span className="text-sm">{platform.emoji}</span>
      )}
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
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
    <Card className="border-none bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 shrink-0">
          <Layers className="h-4 w-4" /> Data Sources
        </span>
        <div className="flex flex-wrap gap-4">
          {connectedPlatforms.map((platform) => {
            const isActive = activePlatforms.includes(platform.id);
            return (
              <div
                key={platform.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all border duration-300 ${
                  isActive
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-slate-50 dark:bg-slate-800 border-transparent grayscale opacity-50 hover:opacity-80"
                }`}
              >
                <Switch
                  checked={isActive}
                  onCheckedChange={() => togglePlatform(platform.id)}
                  className="data-[state=checked]:bg-primary shadow-sm"
                />
                <div className={`flex items-center gap-2 pr-1 ${isActive ? "scale-105 transition-transform" : ""}`}>
                  <PlatformIcon platform={platform} isActive={isActive} />
                  <span className="text-sm font-bold tracking-tight">{platform.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
