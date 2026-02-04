import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  TrendingUp,
  MessageSquareHeart,
  FileText,
  Crown,
  LogOut,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ownerNavItems = [
  {
    title: "Product Usage",
    icon: BarChart3,
    href: "/owner/product-usage",
    description: "AARRR Funnel & User Journey",
  },
  {
    title: "Business Performance",
    icon: TrendingUp,
    href: "/owner/business-performance",
    description: "MRR, CLV & Growth Metrics",
  },
  {
    title: "Customer Tiers",
    icon: Award,
    href: "/owner/customer-tiers",
    description: "Loyalty Tier Analytics",
  },
  {
    title: "User Feedback",
    icon: MessageSquareHeart,
    href: "/owner/user-feedback",
    description: "NPS & Sentiment Analysis",
  },
  {
    title: "Executive Report",
    icon: FileText,
    href: "/owner/executive-report",
    description: "Generate Reports & Export",
  },
];

export function OwnerSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    // Clear all supabase session data from localStorage first
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also call signOut to clean up any in-memory state
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore errors - we've already cleared localStorage
    }
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    // Force full page reload
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Buzzly Owner</h2>
            <p className="text-xs text-muted-foreground">Business Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Analytics
          </p>
          {ownerNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent"
              activeClassName="bg-accent text-accent-foreground"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
