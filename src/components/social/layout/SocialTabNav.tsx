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
    <nav className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-700/50">
      {TABS.map(({ value, label, icon: Icon, path }) => {
        const isActive = activeTab === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => navigate(path)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
