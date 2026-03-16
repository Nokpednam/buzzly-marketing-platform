import { Outlet, useLocation } from "react-router-dom";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { SocialFiltersProvider } from "@/contexts/SocialFiltersContext";
import { SocialTabNav } from "@/components/social/layout/SocialTabNav";

const TAB_SUBTITLES: Record<string, string> = {
  planner: "Plan and schedule posts",
  analytics: "View organic and paid results in one place",
  inbox: "Comments from social media, real-time updates",
};

export default function SocialLayout() {
  const { state: onboardingState } = useOnboardingGuard();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "planner";
  const subtitle = TAB_SUBTITLES[activeTab] ?? "Manage posts, display results, and reply";

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  return (
    <SocialFiltersProvider>
      <div className="min-h-[90vh] w-full">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Single header — no duplicate titles in child pages */}
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Social
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
            <SocialTabNav />
          </header>

          <Outlet />
        </div>
      </div>
    </SocialFiltersProvider>
  );
}
