import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";

export type AnalyticsCategory = "all" | "organic" | "ads";

interface SocialFiltersContextValue {
  activePlatforms: string[];
  setActivePlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  dateRange: string;
  setDateRange: (range: string) => void;
  /** Global Ad Group filter — "all" = no filter */
  adGroupId: string;
  setAdGroupId: (id: string) => void;
  category: AnalyticsCategory;
  setCategory: (c: AnalyticsCategory) => void;
}

const SocialFiltersContext = createContext<SocialFiltersContextValue | undefined>(undefined);

export function SocialFiltersProvider({ children }: { children: ReactNode }) {
  const { connectedPlatforms } = usePlatformConnections();

  const [activePlatforms, setActivePlatforms] = useState<string[]>(() =>
    connectedPlatforms.map((p) => p.id)
  );
  const [dateRange, setDateRange] = useState("30");
  const [adGroupId, setAdGroupId] = useState("all");
  const [category, setCategory] = useState<AnalyticsCategory>("all");

  // Sync when connectedPlatforms changes:
  // - Remove platforms that are no longer connected
  // - Add newly connected platforms
  // - Preserve existing user deselections
  useEffect(() => {
    const connectedIds = new Set(connectedPlatforms.map((p) => p.id));
    setActivePlatforms((prev) => {
      const kept = prev.filter((id) => connectedIds.has(id));
      const newlyConnected = connectedPlatforms
        .filter((p) => !prev.includes(p.id))
        .map((p) => p.id);
      return [...kept, ...newlyConnected];
    });
  }, [connectedPlatforms]);

  return (
    <SocialFiltersContext.Provider
      value={{
        activePlatforms,
        setActivePlatforms,
        dateRange,
        setDateRange,
        adGroupId,
        setAdGroupId,
        category,
        setCategory,
      }}
    >
      {children}
    </SocialFiltersContext.Provider>
  );
}

export function useSocialFilters(): SocialFiltersContextValue {
  const context = useContext(SocialFiltersContext);
  if (context === undefined) {
    throw new Error("useSocialFilters must be used within a SocialFiltersProvider");
  }
  return context;
}
