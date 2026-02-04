import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Bell, LogOut, Settings, User, ChevronUp, Gift, TrendingUp, History, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlanSelectionDialog } from "@/components/PlanSelectionDialog";
import { usePlanAccess, PlanType } from "@/hooks/usePlanAccess";
import { useLoyaltyTier, tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface SidebarBottomSectionProps {
  collapsed?: boolean;
}

interface PointsTransaction {
  id: string;
  points_amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

const planInfo: Record<PlanType, { name: string; upgradeText: string; showUpgrade: boolean }> = {
  free: {
    name: "Free",
    upgradeText: "Upgrade to Pro",
    showUpgrade: true,
  },
  pro: {
    name: "Pro",
    upgradeText: "Upgrade to Team",
    showUpgrade: true,
  },
  team: {
    name: "Team",
    upgradeText: "Manage Plan",
    showUpgrade: false,
  },
};

export function SidebarBottomSection({ collapsed = false }: SidebarBottomSectionProps) {
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [upgradeHovered, setUpgradeHovered] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
  const { currentPlan, loading } = usePlanAccess();
  const { userLoyalty, getNextTier, getProgressToNextTier } = useLoyaltyTier();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        setUserName(user.user_metadata?.full_name || null);
        
        // Fetch recent points transactions
        const { data: transactions } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (transactions) {
          setRecentTransactions(transactions);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (userName) {
      return userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return "U";
  };

  if (loading) return null;

  const plan = planInfo[currentPlan];

  // Get tier info for display
  const tierName = userLoyalty?.tier?.name || "Bronze";
  const tierIcon = tierIcons[tierName] || "🥉";
  const tierColor = tierColors[tierName] || tierColors.Bronze;
  const tier = userLoyalty?.tier;
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();

  // Tier benefits
  const tierBenefits = [
    { label: "Discount", value: `${tier?.discount_percentage || 0}%` },
    { label: "Point Multiplier", value: `${tier?.point_multiplier || 1}x` },
  ];

  // Collapsed state - show avatar with tier badge
  if (collapsed) {
    return (
      <div className="p-2 border-t border-sidebar-border space-y-2">
        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-10 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userName || "User"}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPlanDialogOpen(true)}>
              <Zap className="mr-2 h-4 w-4" />
              {plan.upgradeText}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tier Badge in middle (collapsed = icon only with popover) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-10 p-0 flex items-center justify-center",
                "hover:bg-sidebar-accent"
              )}
            >
              <span className="text-lg">{tierIcon}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="center" className="w-72">
            <TierPopoverContent 
              tierName={tierName}
              tierIcon={tierIcon}
              tierColor={tierColor}
              tierBenefits={tierBenefits}
              nextTier={nextTier}
              progress={progress}
              recentTransactions={recentTransactions}
            />
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full h-10 p-0 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-2.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-80">
            <NotificationsContent />
          </PopoverContent>
        </Popover>

        <PlanSelectionDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} />
      </div>
    );
  }

  // Expanded state - Lovable style
  return (
    <div className="border-t border-sidebar-border">
      {/* Upgrade Card */}
      <div className="p-3">
        <button
          onClick={() => setPlanDialogOpen(true)}
          onMouseEnter={() => setUpgradeHovered(true)}
          onMouseLeave={() => setUpgradeHovered(false)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg p-3 transition-all duration-200",
            "bg-sidebar-accent/50 hover:bg-sidebar-accent",
            upgradeHovered && "bg-sidebar-accent"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              plan.showUpgrade 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent text-accent-foreground"
            )}>
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{plan.upgradeText}</p>
              <p className="text-xs text-muted-foreground">
                {plan.showUpgrade ? "Unlock more benefits" : "You have full access"}
              </p>
            </div>
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            upgradeHovered && "transform -translate-y-0.5"
          )} />
        </button>
      </div>

      {/* Bottom Bar - Avatar + Tier Badge + Notifications */}
      <div className="px-3 pb-3 flex items-center justify-between">
        {/* Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userName || "User"}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tier Badge in Center - Clickable with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "h-8 px-2 gap-1.5 rounded-full",
                "hover:bg-sidebar-accent",
                tierColor.bg
              )}
            >
              <span className="text-base">{tierIcon}</span>
              <span className={cn("text-xs font-medium", tierColor.text)}>{tierName}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-80">
            <TierPopoverContent 
              tierName={tierName}
              tierIcon={tierIcon}
              tierColor={tierColor}
              tierBenefits={tierBenefits}
              nextTier={nextTier}
              progress={progress}
              recentTransactions={recentTransactions}
            />
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-80">
            <NotificationsContent />
          </PopoverContent>
        </Popover>
      </div>

      <PlanSelectionDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} />
    </div>
  );
}

// Tier Popover Content Component
interface TierPopoverContentProps {
  tierName: string;
  tierIcon: string;
  tierColor: { bg: string; text: string };
  tierBenefits: { label: string; value: string }[];
  nextTier: { name: string; min_points: number } | null;
  progress: number;
  recentTransactions: PointsTransaction[];
}

function TierPopoverContent({ 
  tierName, 
  tierIcon, 
  tierColor, 
  tierBenefits, 
  nextTier, 
  progress, 
  recentTransactions 
}: TierPopoverContentProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
          tierColor.bg
        )}>
          {tierIcon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{tierName} Member</h4>
          <p className="text-xs text-muted-foreground">Your loyalty status</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Gift className="h-3.5 w-3.5" />
          <span>Your Benefits</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tierBenefits.map((benefit) => (
            <div 
              key={benefit.label}
              className="flex flex-col p-2 rounded-lg bg-muted/50"
            >
              <span className="text-xs text-muted-foreground">{benefit.label}</span>
              <span className="text-sm font-semibold text-foreground">{benefit.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Progress to {nextTier.name}</span>
          </div>
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
              <span className="font-medium text-foreground">{nextTier.min_points} pts needed</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          <span>Recent Activity</span>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  {tx.transaction_type === 'earned' ? (
                    <ArrowUp className="h-3 w-3 text-primary" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-muted-foreground truncate max-w-[140px]">
                    {tx.description || tx.transaction_type}
                  </span>
                </div>
                <span className={cn(
                  "font-medium",
                  tx.transaction_type === 'earned' ? "text-primary" : "text-destructive"
                )}>
                  {tx.transaction_type === 'earned' ? '+' : '-'}{tx.points_amount} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}

// Notifications Content Component
function NotificationsContent() {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Notifications</h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Welcome to Buzzly!</p>
            <p className="text-xs text-muted-foreground">Start exploring your marketing dashboard</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">New campaign insights</p>
            <p className="text-xs text-muted-foreground">Your latest campaign is performing well</p>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="w-full text-xs">
        View all notifications
      </Button>
    </div>
  );
}