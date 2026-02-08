import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Users, Zap, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanAccess, PlanType } from "@/hooks/usePlanAccess";
import { useSubscription, SubscriptionPlan, BillingCycle } from "@/hooks/useSubscription";
import { PaymentMethodDialog } from "@/components/subscription/PaymentMethodDialog";
import { toast } from "@/hooks/use-toast";

interface PlanSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planIcons: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
  team: <Users className="h-5 w-5" />,
};

const planColors: Record<string, { text: string; bg: string; gradient: string }> = {
  free: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    gradient: "from-muted/50 to-muted/20",
  },
  pro: {
    text: "text-primary",
    bg: "bg-primary/20",
    gradient: "from-primary/20 to-primary/5",
  },
  team: {
    text: "text-violet-500",
    bg: "bg-violet-500/20",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
};

export function PlanSelectionDialog({ open, onOpenChange }: PlanSelectionDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { currentPlan, updatePlan, refetch: refetchPlanAccess } = usePlanAccess();
  const {
    plans,
    paymentMethods,
    loading,
    getMonthlyEquivalent,
    getSavingsPercent,
    createSubscription,
    refetch: refetchSubscription,
  } = useSubscription();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPlan(null);
      setShowPaymentDialog(false);
    }
  }, [open]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;

    // If selecting free plan, just update directly
    if (selectedPlan.slug === "free") {
      handleFreePlanSelect();
      return;
    }

    // For paid plans, show payment dialog
    setShowPaymentDialog(true);
  };

  const handleFreePlanSelect = async () => {
    const success = await updatePlan("free");
    if (success) {
      toast({
        title: "เลือก Free Plan สำเร็จ!",
        description: "คุณสามารถเริ่มใช้งานได้ทันที",
      });
      onOpenChange(false);
    }
  };

  const isDowngrade = () => {
    if (!selectedPlan) return false;
    const currentPlanData = plans.find((p) => p.slug === currentPlan);
    if (!currentPlanData) return false;
    return selectedPlan.tier < currentPlanData.tier;
  };


  const handleConfirmPayment = async (paymentMethodId: string, discountCode?: string) => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const result = await createSubscription(
        selectedPlan.id,
        paymentMethodId,
        billingCycle
      );

      if (result.success) {
        // Refresh plan access to update UI
        await refetchPlanAccess();
        await refetchSubscription();

        toast({
          title: "ชำระเงินสำเร็จ! 🎉",
          description: `คุณได้อัปเกรดเป็น ${selectedPlan.name} Plan เรียบร้อยแล้ว`,
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
        setSelectedPlan(null);
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

  const formatPrice = (price: number) => {
    if (price === 0) return "ฟรี";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showPaymentDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              เลือก Plan ที่เหมาะกับคุณ
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              อัปเกรดเพื่อปลดล็อคฟีเจอร์ทั้งหมดและเพิ่มประสิทธิภาพการตลาด
            </p>
          </DialogHeader>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer",
                billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"
              )}
            >
              รายเดือน
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) =>
                setBillingCycle(checked ? "yearly" : "monthly")
              }
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer flex items-center gap-2",
                billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"
              )}
            >
              รายปี
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                ประหยัดสูงสุด 17%
              </Badge>
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {plans.map((plan) => {
              const colors = planColors[plan.slug] || planColors.free;
              const isCurrentPlan = plan.slug === currentPlan;
              const isSelected = selectedPlan?.id === plan.id;
              const monthlyPrice = getMonthlyEquivalent(plan, billingCycle);
              const savings = getSavingsPercent(plan);

              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200",
                    `bg-gradient-to-b ${colors.gradient}`,
                    isCurrentPlan && "ring-2 ring-muted",
                    isSelected
                      ? "border-primary shadow-lg scale-[1.02]"
                      : "border-transparent hover:border-border hover:shadow-md"
                  )}
                >
                  {plan.is_popular && (
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
                        colors.bg
                      )}
                    >
                      <span className={colors.text}>
                        {planIcons[plan.slug] || <Zap className="h-5 w-5" />}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <span className={cn("text-3xl font-bold", colors.text)}>
                      {formatPrice(monthlyPrice)}
                    </span>
                    {monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">/เดือน</span>
                    )}
                    {billingCycle === "yearly" && savings > 0 && (
                      <p className="text-xs text-accent-foreground mt-1">
                        ประหยัด {savings}% เมื่อชำระรายปี
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    className={cn(
                      "w-full mt-5",
                      isSelected
                        ? "bg-primary hover:bg-primary/90"
                        : plan.is_popular
                          ? "bg-primary/80 hover:bg-primary"
                          : "bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground"
                    )}
                    variant={isSelected ? "default" : "outline"}
                  >
                    {isSelected
                      ? "เลือกแล้ว ✓"
                      : isCurrentPlan
                        ? "Plan ปัจจุบัน"
                        : "เลือก Plan นี้"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Team Plan Extra Info */}
          <div className="mt-4 p-4 rounded-lg bg-secondary border border-border">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Team Plan: เชิญสมาชิกมาจัดการร้านค้าร่วมกัน
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  สามารถเชิญสมาชิกได้ไม่จำกัดจำนวน มาดูแลและจัดการ Marketing Dashboard ร่วมกัน
                </p>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center mt-4">
            <Button
              size="lg"
              className="px-8"
              disabled={!selectedPlan || (selectedPlan.slug === currentPlan) || isDowngrade()}
              onClick={handleProceedToPayment}
            >
              {selectedPlan ? (
                selectedPlan.slug === "free" ? (
                  "ยืนยันเลือก Free Plan"
                ) : (
                  `ดำเนินการชำระเงิน`
                )
              ) : (
                "กรุณาเลือก Plan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={(open) => {
          setShowPaymentDialog(open);
          if (!open) {
            setSelectedPlan(null);
          }
        }}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        paymentMethods={paymentMethods}
        onConfirmPayment={handleConfirmPayment}
        onBack={() => setShowPaymentDialog(false)}
        isProcessing={isProcessing}
      />
    </>
  );
}
