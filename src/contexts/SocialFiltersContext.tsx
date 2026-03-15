import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";

interface SocialFiltersContextValue {
  activePlatforms: string[];
  setActivePlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  dateRange: string;
  setDateRange: (range: string) => void;
}

const SocialFiltersContext = createContext<SocialFiltersContextValue | undefined>(undefined);

export function SocialFiltersProvider({ children }: { children: ReactNode }) {
  const { connectedPlatforms } = usePlatformConnections();

  const [activePlatforms, setActivePlatforms] = useState<string[]>(() =>
    connectedPlatforms.map((p) => p.id)
  );
  const [dateRange, setDateRange] = useState("7");

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
      value={{ activePlatforms, setActivePlatforms, dateRange, setDateRange }}
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
