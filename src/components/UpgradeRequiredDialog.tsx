import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap, Lock, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanType, usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "@/hooks/use-toast";
import { useSubscription, BillingCycle } from "@/hooks/useSubscription";
import { PaymentMethodDialog } from "@/components/subscription/PaymentMethodDialog";

interface UpgradeRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: PlanType;
  featureName: string;
  featureDescription?: string;
}

interface PlanDisplay {
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

const planDisplays: PlanDisplay[] = [
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
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(requiredPlan);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // UpgradeRequiredDialog defaults to monthly for simplicity, or we could add a toggle later
  const [billingCycle] = useState<BillingCycle>("monthly");

  const { currentPlan, updatePlan, refetch: refetchPlanAccess } = usePlanAccess();
  const {
    plans: subscriptionPlans,
    paymentMethods,
    createSubscription,
    refetch: refetchSubscription,
    loading: subscriptionLoading
  } = useSubscription();

  useEffect(() => {
    if (open) {
      setSelectedPlanType(requiredPlan);
      setShowPaymentDialog(false);
    }
  }, [open, requiredPlan]);

  const handleSelectPlan = (planId: PlanType) => {
    // Don't allow selecting current plan or lower
    const planOrder: PlanType[] = ["free", "pro", "team"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const selectedIndex = planOrder.indexOf(planId);

    if (selectedIndex > currentIndex) {
      setSelectedPlanType(planId);
    }
  };

  const handleProceed = async () => {
    if (!selectedPlanType || selectedPlanType === currentPlan) return;

    // If Free plan (unlikely in upgrade dialog but good for safety), update directly
    if (selectedPlanType === "free") {
      const success = await updatePlan("free");
      if (success) {
        toast({
          title: "ดาวน์เกรดสำเร็จ",
          description: "คุณได้กลับไปใช้งาน Free Plan",
        });
        onOpenChange(false);
      }
      return;
    }

    // For paid plans, show payment dialog
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async (paymentMethodId: string, discountCode?: string) => {
    if (!selectedPlanType) return;

    // Find the real plan object from subscriptionPlans
    const realPlan = subscriptionPlans.find(p => p.slug === selectedPlanType);

    if (!realPlan) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบข้อมูลแพ็กเกจ กรุณาลองใหม่",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createSubscription(
        realPlan.id,
        paymentMethodId,
        billingCycle
      );

      if (result.success) {
        // Refresh plan access to update UI
        await refetchPlanAccess();
        await refetchSubscription();

        // Update user profile plan_type locally if needed/handled by context?
        // Context refetch should handle it.

        toast({
          title: "อัปเกรดสำเร็จ! 🎉",
          description: `คุณได้อัปเกรดเป็น ${selectedPlanType.toUpperCase()} Plan เรียบร้อยแล้ว`,
        });

        setShowPaymentDialog(false);
        onOpenChange(false);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถดำเนินการได้ กรุณาลองใหม่",
          variant: "destructive",
        });
        // Reset to plan selection for retry
        setShowPaymentDialog(false);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const planOrder: PlanType[] = ["free", "pro", "team"];
  const currentPlanIndex = planOrder.indexOf(currentPlan);

  // Find the currently selected real plan for passing to PaymentMethodDialog
  const selectedRealPlan = subscriptionPlans.find(p => p.slug === selectedPlanType) || null;

  return (
    <>
      <Dialog open={open && !showPaymentDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
                {planDisplays.map((plan) => {
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
                        selectedPlanType === plan.id && !isLowerPlan
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
                            selectedPlanType === plan.id
                              ? "bg-primary hover:bg-primary/90"
                              : plan.id === "pro"
                                ? "bg-primary/80 hover:bg-primary"
                                : "bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground"
                          )}
                          variant={selectedPlanType === plan.id ? "default" : "outline"}
                        >
                          {selectedPlanType === plan.id ? "เลือกแล้ว ✓" : "เลือก Plan นี้"}
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
                  disabled={!selectedPlanType || selectedPlanType === currentPlan}
                  onClick={handleProceed}
                >
                  {selectedPlanType && selectedPlanType !== currentPlan
                    ? `อัปเกรดเป็น ${planDisplays.find((p) => p.id === selectedPlanType)?.name}`
                    : "กรุณาเลือก Plan ที่ต้องการอัปเกรด"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={(open) => {
          setShowPaymentDialog(open);
        }}
        selectedPlan={selectedRealPlan}
        billingCycle={billingCycle}
        paymentMethods={paymentMethods}
        onConfirmPayment={handleConfirmPayment}
        onBack={() => setShowPaymentDialog(false)}
        isProcessing={isProcessing}
      />
    </>
  );
}

