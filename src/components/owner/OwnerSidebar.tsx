import { NavLink } from "react-router-dom";
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
  ChevronRight,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const ownerNavItems = [
  {
    title: "Business Performance",
    icon: TrendingUp,
    href: "/owner/business-performance",
    description: "Revenue & Growth",
  },
  {
    title: "Product Usage",
    icon: BarChart3,
    href: "/owner/product-usage",
    description: "AARRR Funnel Metrics",
  },
  {
    title: "Customer Tiers",
    icon: Award,
    href: "/owner/customer-tiers",
    description: "Loyalty Analytics",
  },
  {
    title: "User Feedback",
    icon: MessageSquareHeart,
    href: "/owner/user-feedback",
    description: "Sentiment Analysis",
  },
  {
    title: "Executive Report",
    icon: FileText,
    href: "/owner/executive-report",
    description: "PDF Reports & Insights",
  },
];

export function OwnerSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      toast({
        title: "Signed Out",
        description: "Your session has ended successfully.",
      });
      window.location.href = "/";
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-100 bg-white flex flex-col font-sans transition-all duration-300">
      {/* Brand Section */}
      <div className="flex items-center gap-3 px-8 py-10 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-xl tracking-tight text-slate-900 leading-none">Buzzly</h2>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 block">Owner Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-6 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management</p>
        {ownerNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 outline-none w-full",
                isActive
                  ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.15)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-4">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold tracking-tight text-sm whitespace-nowrap">
                      {item.title}
                    </span>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-300 transform",
                  isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card - Outstaff Style */}
      <div className="p-6 mt-auto shrink-0">
        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 relative group transition-all hover:shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white shadow-md ring-1 ring-slate-100">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {userEmail?.[0].toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>

            <div className="text-center w-full px-2">
              <p className="font-bold text-slate-900 truncate tracking-tight text-base">Workspace Owner</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{userEmail}</p>
            </div>

            <Button
              variant="outline"
              className="w-full mt-2 rounded-2xl bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-xs font-bold py-6 group"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 text-slate-400 group-hover:text-red-500" />
              SIGN OUT
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
