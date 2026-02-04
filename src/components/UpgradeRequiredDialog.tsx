import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanType, usePlanAccess, PlanFeatures, featureNames } from "@/hooks/usePlanAccess";
import { toast } from "@/hooks/use-toast";

interface UpgradeRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: PlanType;
  featureName: string;
  featureDescription?: string;
}

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  features: { name: string; included: boolean }[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "เริ่มต้นใช้งานฟรี",
    icon: <Zap className="h-5 w-5" />,
    color: "text-muted-foreground",
    bgGradient: "from-muted/50 to-muted/20",
    features: [
      { name: "เชื่อมต่อ 2 Platforms", included: true },
      { name: "Dashboard พื้นฐาน", included: true },
      { name: "รายงาน 7 วันย้อนหลัง", included: true },
      { name: "Customer Persona", included: true },
      { name: "AI Insights", included: false },
      { name: "Custom Reports", included: false },
      { name: "Priority Support", included: false },
      { name: "Team Members", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "สำหรับธุรกิจที่ต้องการเติบโต",
    icon: <Crown className="h-5 w-5" />,
    color: "text-primary",
    bgGradient: "from-primary/20 to-primary/5",
    popular: true,
    features: [
      { name: "เชื่อมต่อ Unlimited Platforms", included: true },
      { name: "Dashboard ขั้นสูง", included: true },
      { name: "รายงาน 90 วันย้อนหลัง", included: true },
      { name: "Customer Persona", included: true },
      { name: "AI Insights", included: true },
      { name: "Custom Reports", included: true },
      { name: "Priority Support", included: true },
      { name: "Team Members", included: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$79",
    period: "/month",
    description: "สำหรับทีมที่ต้องการจัดการร่วมกัน",
    icon: <Users className="h-5 w-5" />,
    color: "text-violet-500",
    bgGradient: "from-violet-500/20 to-violet-500/5",
    features: [
      { name: "เชื่อมต่อ Unlimited Platforms", included: true },
      { name: "Dashboard ขั้นสูง", included: true },
      { name: "รายงาน Unlimited ย้อนหลัง", included: true },
      { name: "Customer Persona", included: true },
      { name: "AI Insights", included: true },
      { name: "Custom Reports", included: true },
      { name: "Priority Support", included: true },
      { name: "Invite Team Members (5 คน)", included: true },
    ],
  },
];

export function UpgradeRequiredDialog({
  open,
  onOpenChange,
  requiredPlan,
  featureName,
  featureDescription,
}: UpgradeRequiredDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(requiredPlan);
  const { currentPlan, updatePlan } = usePlanAccess();

  useEffect(() => {
    if (open) {
      setSelectedPlan(requiredPlan);
    }
  }, [open, requiredPlan]);

  const handleSelectPlan = (planId: PlanType) => {
    // Don't allow selecting current plan or lower
    const planOrder: PlanType[] = ["free", "pro", "team"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const selectedIndex = planOrder.indexOf(planId);
    
    if (selectedIndex > currentIndex) {
      setSelectedPlan(planId);
    }
  };

  const handleConfirm = async () => {
    if (selectedPlan && selectedPlan !== currentPlan) {
      const success = await updatePlan(selectedPlan);
      if (success) {
        toast({
          title: "อัปเกรดสำเร็จ!",
          description: `คุณได้อัปเกรดเป็น ${selectedPlan.toUpperCase()} Plan เรียบร้อยแล้ว`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัปเกรดได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
    }
  };

  const planOrder: PlanType[] = ["free", "pro", "team"];
  const currentPlanIndex = planOrder.indexOf(currentPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                ฟีเจอร์นี้ต้องการอัปเกรด Plan
              </DialogTitle>
            </div>
          </div>
          
          {/* Feature Info Banner */}
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 mt-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{featureName}</p>
                {featureDescription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {featureDescription}
                  </p>
                )}
                <p className="text-sm text-primary mt-2">
                  ต้องการ <span className="font-semibold">{requiredPlan.toUpperCase()}</span> Plan หรือสูงกว่า
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            const planIndex = planOrder.indexOf(plan.id);
            const isCurrentPlan = plan.id === currentPlan;
            const isLowerPlan = planIndex <= currentPlanIndex;
            const isSelectable = !isLowerPlan;

            return (
              <div
                key={plan.id}
                onClick={() => isSelectable && handleSelectPlan(plan.id)}
                className={cn(
                  "relative rounded-xl border-2 p-5 transition-all duration-200",
                  `bg-gradient-to-b ${plan.bgGradient}`,
                  isCurrentPlan && "ring-2 ring-muted",
                  isLowerPlan && "opacity-50 cursor-not-allowed",
                  !isLowerPlan && "cursor-pointer",
                  selectedPlan === plan.id && !isLowerPlan
                    ? "border-primary shadow-lg scale-[1.02]"
                    : "border-transparent hover:border-border hover:shadow-md"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    แนะนำ
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-2 right-2">
                    Plan ปัจจุบัน
                  </Badge>
                )}

                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-3",
                      plan.id === "free" && "bg-muted",
                      plan.id === "pro" && "bg-primary/20",
                      plan.id === "team" && "bg-violet-500/20"
                    )}
                  >
                    <span className={plan.color}>{plan.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className={cn("text-3xl font-bold", plan.color)}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center",
                          feature.included
                            ? "bg-emerald-500/20 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {feature.included ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="text-[10px]">-</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        )}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                {!isLowerPlan && (
                  <Button
                    className={cn(
                      "w-full mt-5",
                      selectedPlan === plan.id
                        ? "bg-primary hover:bg-primary/90"
                        : plan.id === "pro"
                        ? "bg-primary/80 hover:bg-primary"
                        : "bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground"
                    )}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {selectedPlan === plan.id ? "เลือกแล้ว ✓" : "เลือก Plan นี้"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Team Plan Extra Info */}
        <div className="mt-4 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Team Plan: เชิญสมาชิกมาจัดการร้านค้าร่วมกัน
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                สามารถเชิญสมาชิกได้สูงสุด 5 คน มาดูแลและจัดการ Marketing Dashboard ร่วมกัน
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center mt-4">
          <Button
            size="lg"
            className="px-8"
            disabled={!selectedPlan || selectedPlan === currentPlan}
            onClick={handleConfirm}
          >
            {selectedPlan && selectedPlan !== currentPlan
              ? `อัปเกรดเป็น ${plans.find((p) => p.id === selectedPlan)?.name}`
              : "กรุณาเลือก Plan ที่ต้องการอัปเกรด"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
