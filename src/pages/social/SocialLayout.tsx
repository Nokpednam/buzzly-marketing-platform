import { Outlet } from "react-router-dom";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { SocialFiltersProvider } from "@/contexts/SocialFiltersContext";
import { SocialTabNav } from "@/components/social/layout/SocialTabNav";

export default function SocialLayout() {
  const { state: onboardingState } = useOnboardingGuard();

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  return (
    <SocialFiltersProvider>
      <div className="relative min-h-[90vh] w-full bg-[#f4f7fb] dark:bg-background font-sans">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-foreground inline-block bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm">
              Social
            </h1>
            <SocialTabNav />
          </div>
          <Outlet />
        </div>
      </div>
    </SocialFiltersProvider>
  );
}
