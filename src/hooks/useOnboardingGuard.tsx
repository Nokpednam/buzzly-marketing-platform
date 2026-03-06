import { usePlatformConnections } from "./usePlatformConnections";
import { useWorkspace } from "./useWorkspace";

export type OnboardingState = "loading" | "no_workspace" | "no_platform" | "ready";

export function useOnboardingGuard(): { state: OnboardingState } {
  const { connectedPlatforms, loading: platformLoading } = usePlatformConnections();
  const { hasTeam, loading: workspaceLoading } = useWorkspace();

  if (platformLoading || workspaceLoading) return { state: "loading" };
  if (!hasTeam) return { state: "no_workspace" };
  if (connectedPlatforms.length === 0) return { state: "no_platform" };
  return { state: "ready" };
}
