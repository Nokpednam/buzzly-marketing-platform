import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "planner", label: "Planner", icon: Calendar, path: "/social/planner" },
  { value: "analytics", label: "Analytics", icon: BarChart3, path: "/social/analytics" },
  { value: "inbox", label: "Inbox", icon: MessageSquare, path: "/social/inbox" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function SocialTabNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: TabValue =
    (TABS.find((t) => location.pathname.startsWith(t.path))?.value as TabValue) ?? "planner";

  return (
    <nav className="flex gap-0.5 rounded-2xl bg-muted/30 p-1 dark:bg-muted/20">
      {TABS.map(({ value, label, icon: Icon, path }) => {
        const isActive = activeTab === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => navigate(path)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm border-l-2 border-l-primary pl-[14px]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
