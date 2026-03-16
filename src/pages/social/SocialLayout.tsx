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
      <div className="min-h-[90vh] w-full bg-slate-50/80 dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Social
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                จัดการโพสต์ แสดงผล และตอบกลับ
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
