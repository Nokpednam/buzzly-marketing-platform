import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart3, MessageSquare, Plug } from "lucide-react";

const TABS = [
  { value: "planner", label: "Planner", icon: Calendar, path: "/social/planner" },
  { value: "analytics", label: "Analytics", icon: BarChart3, path: "/social/analytics" },
  { value: "inbox", label: "Inbox", icon: MessageSquare, path: "/social/inbox" },
  { value: "integrations", label: "Integrations", icon: Plug, path: "/social/integrations" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function SocialTabNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: TabValue =
    (TABS.find((t) => location.pathname.startsWith(t.path))?.value as TabValue) ?? "planner";

  return (
    <Tabs value={activeTab} onValueChange={(value) => navigate(`/social/${value}`)}>
      <TabsList className="bg-muted/50 p-1 h-11 rounded-2xl gap-1">
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-xl px-5 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
