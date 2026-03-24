import { Loader2, CheckCircle2, Megaphone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAds } from "@/hooks/useAds";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Syncing Ads…</span>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-slate-50 border border-dashed">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 font-medium text-center">
          No ads yet. Create ads in Social Analytics first.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl bg-slate-50/50 overflow-hidden">
      <ScrollArea className="h-[350px] w-full pr-1">
        <div className="p-3 space-y-2">
          {ads.map((ad) => {
            const selected = value.includes(ad.id);
            return (
              <button
                key={ad.id}
                type="button"
                onClick={() => toggle(ad.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all text-left group border shadow-sm",
                  selected
                    ? "bg-cyan-50 border-cyan-200/60 shadow-cyan-900/5"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/80"
                )}
              >
                <div className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center transition-colors border",
                  selected 
                    ? "bg-cyan-500 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" 
                    : "bg-white border-slate-200 group-hover:border-slate-400"
                )}>
                  {selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block truncate font-bold uppercase tracking-wide",
                    selected ? "text-cyan-950" : "text-slate-700"
                  )}>
                    {ad.name}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {ad.platform}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none",
                        ad.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      )}
                    >
                      {ad.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
