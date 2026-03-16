import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  Calendar, 
  Target, 
  AlertTriangle,
  History,
  TrendingUp,
  X
} from "lucide-react";
import { Budget, useBudgets } from "@/hooks/useBudgets";
import { cn } from "@/lib/utils";

interface BudgetDetailDialogProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetDetailDialog({ budget, open, onOpenChange }: BudgetDetailDialogProps) {
  if (!budget) return null;

  const pct = budget.amount > 0 ? Math.min((budget.spent_amount / budget.amount) * 100, 100) : 0;
  const alert = budget.amount > 0 && (budget.spent_amount / budget.amount) * 100 >= budget.alert_threshold_percent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] rounded-[2rem] p-0 border-none shadow-2xl overflow-y-auto scrollbar-hide">
        <div className={cn(
          "h-32 p-8 flex flex-col justify-end relative",
          alert ? "bg-destructive/10" : "bg-primary/5"
        )}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Budget Overview</p>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight truncate">{budget.name}</DialogTitle>
        </div>

        <div className="p-8 space-y-8">
          {/* Main Progress section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Budget Usage</p>
                <p className="text-2xl font-black tracking-tight">
                  ฿{budget.spent_amount.toLocaleString()} <span className="text-muted-foreground text-sm font-medium">/ ฿{budget.amount.toLocaleString()}</span>
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-xl font-black",
                  alert ? "text-destructive" : "text-primary"
                )}>
                  {pct.toFixed(1)}%
                </p>
              </div>
            </div>
            <Progress value={pct} className={cn("h-3 rounded-full", alert && "[&>div]:bg-destructive")} />
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Remaining: ฿{budget.remaining_amount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> Threshold: {budget.alert_threshold_percent}%</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Type</span>
              </div>
              <p className="font-bold text-sm capitalize pl-6">{budget.budget_type}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Campaign</span>
              </div>
              <p className="font-bold text-sm pl-6 truncate">{budget.campaign_name || "None"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Start Date</span>
              </div>
              <p className="font-bold text-sm pl-6">{budget.start_date ? new Date(budget.start_date).toLocaleDateString() : "Not set"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">End Date</span>
              </div>
              <p className="font-bold text-sm pl-6">{budget.end_date ? new Date(budget.end_date).toLocaleDateString() : "Not set"}</p>
            </div>
          </div>

          <div className="pt-2">
            <Button 
                variant="ghost" 
                className="w-full rounded-2xl h-12 font-bold hover:bg-muted transition-colors"
                onClick={() => onOpenChange(false)}
            >
              Close Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
