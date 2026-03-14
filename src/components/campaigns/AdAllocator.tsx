import { Loader2, CheckCircle2, Megaphone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAds } from "@/hooks/useAds";

interface AdAllocatorProps {
  value: string[];
  onChange: (adIds: string[]) => void;
}

export function AdAllocator({ value, onChange }: AdAllocatorProps) {
  const { ads, isLoading } = useAds();

  const toggle = (adId: string) => {
    if (value.includes(adId)) {
      onChange(value.filter((id) => id !== adId));
    } else {
      onChange([...value, adId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading ads…</span>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
        <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          No ads yet. Create ads in Social Analytics first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-44 overflow-y-auto space-y-1 border rounded-xl p-2 bg-muted/20">
      {ads.map((ad) => {
        const selected = value.includes(ad.id);
        return (
          <button
            key={ad.id}
            type="button"
            onClick={() => toggle(ad.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              selected
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50 border border-transparent"
            }`}
          >
            <Checkbox
              checked={selected}
              className="shrink-0 pointer-events-none"
            />
            <span className="flex-1 truncate font-medium">{ad.name}</span>
            {ad.external_status === "published" && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 shrink-0">
                <CheckCircle2 className="h-3 w-3" />
                {ad.platform}
              </span>
            )}
            <span
              className={`text-xs shrink-0 ${
                ad.status === "active"
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              }`}
            >
              {ad.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}
