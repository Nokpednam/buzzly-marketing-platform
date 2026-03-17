import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/errorLogger";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Check,
  Loader2,
  Shield,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan, PaymentMethod, BillingCycle } from "@/hooks/useSubscription";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: SubscriptionPlan | null;
  billingCycle: BillingCycle;
  paymentMethods: PaymentMethod[];
  onConfirmPayment: (paymentMethodId: string, discountCode?: string) => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
}

const paymentIcons: Record<string, React.ReactNode> = {
  credit_card: <CreditCard className="h-5 w-5" />,
  credit: <CreditCard className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  promptpay: <QrCode className="h-5 w-5" />,
  qr: <QrCode className="h-5 w-5" />,
  bank_transfer: <Building2 className="h-5 w-5" />,
  bank: <Building2 className="h-5 w-5" />,
  mobile_banking: <Smartphone className="h-5 w-5" />,
};

export function PaymentMethodDialog({
  open,
  onOpenChange,
  selectedPlan,
  billingCycle,
  paymentMethods,
  onConfirmPayment,
  onBack,
  isProcessing,
}: PaymentMethodDialogProps) {
  const { toast } = useToast();
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percent?: number;
    amount?: number;
    maxAmount?: number | null;
  } | null>(null);

  // Auto-select first payment method when only one is available
  useEffect(() => {
    if (open && paymentMethods.length === 1 && !selectedMethodId) {
      setSelectedMethodId(paymentMethods[0].id);
    }
  }, [open, paymentMethods, selectedMethodId]);

  if (!selectedPlan) return null;

  const basePrice = billingCycle === "yearly" ? selectedPlan.price_yearly : selectedPlan.price_monthly;

  let rawDiscount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent) {
      rawDiscount = (basePrice * appliedDiscount.percent) / 100;
      if (appliedDiscount.maxAmount) {
        rawDiscount = Math.min(rawDiscount, appliedDiscount.maxAmount);
      }
    } else {
      rawDiscount = appliedDiscount.amount || 0;
    }
  }

  const discountAmount = Math.min(rawDiscount, basePrice);
  const finalPrice = basePrice - discountAmount;
  const monthlySavings = billingCycle === "yearly"
    ? selectedPlan.price_monthly * 12 - selectedPlan.price_yearly
    : 0;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);

    try {
      // Use RPC function (SECURITY DEFINER) to bypass RLS on discounts table.
      // This ensures customers who collected a coupon can validate it even
      // though they are not workspace members.
      const { data, error } = await supabase.rpc("validate_collected_discount", {
        p_code: discountCode.trim(),
      });

      if (error) throw error;

      const result = data as {
        error?: string;
        id?: string;
        code?: string;
        discount_type?: "percent" | "fixed";
        discount_value?: number;
        min_order_value?: number;
        max_discount_amount?: number | null;
      };

      if (result.error) {
        const errorMessages: Record<string, { title: string; description: string }> = {
          not_authenticated: {
            title: "Please sign in",
            description: "Please sign in before using the discount code",
          },
          invalid_code: {
            title: "Invalid discount code",
            description: "Please check and try again",
          },
          not_collected: {
            title: "You haven't collected this code",
            description: "Collect the code from the notifications page first",
          },
          already_used: {
            title: "This discount code has been used",
            description: "This code was already used in a previous payment",
          },
          expired: {
            title: "Discount code has expired",
            description: "Please try another code",
          },
          exhausted: {
            title: "Discount code usage limit reached",
            description: "Please try another code",
          },
        };

        const msg = errorMessages[result.error] ?? {
          title: "Error",
          description: "Unable to validate discount code",
        };
        toast({ ...msg, variant: "destructive" });
        return;
      }

      // Validate min order value on the frontend
      if (result.min_order_value && basePrice < result.min_order_value) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order value is ฿${result.min_order_value}`,
          variant: "destructive",
        });
        return;
      }

      if (result.discount_type === "percent") {
        setAppliedDiscount({
          code: result.code!,
          percent: result.discount_value,
          maxAmount: result.max_discount_amount ?? null,
        });
      } else {
        setAppliedDiscount({ code: result.code!, amount: result.discount_value });
      }
    } catch (err) {
      logError("PaymentMethodDialog.handleApplyDiscount", err, { discountCode: discountCode.trim() });
      toast({
        title: "Error",
        description: "Unable to validate discount code at this time",
        variant: "destructive",
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedMethodId) {
      toast({
        title: "Please select a payment method",
        description: "Please choose a payment method to continue",
        variant: "destructive",
      });
      return;
    }
    await onConfirmPayment(selectedMethodId, appliedDiscount?.code);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={onBack}
              aria-label="Back to plan selection"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg">Select payment method</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedPlan.name} Plan · {billingCycle === "yearly" ? "Annually" : "Monthly"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="font-medium">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Billing cycle</span>
            <span className="font-medium">
              {billingCycle === "yearly" ? "Annually" : "Monthly"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Regular price</span>
            <span className={cn(appliedDiscount && "line-through text-muted-foreground")}>
              {formatPrice(basePrice)}
            </span>
          </div>

          {monthlySavings > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span className="text-sm flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Annual savings
              </span>
              <span className="font-medium">-{formatPrice(monthlySavings)}</span>
            </div>
          )}

          {appliedDiscount && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span className="text-sm flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Discount code ({appliedDiscount.code})
              </span>
              <span className="font-medium">-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center pt-1">
            <span className="font-semibold text-base">Total</span>
            <span className="text-xl font-bold text-primary tabular-nums">
              {formatPrice(finalPrice)}
            </span>
          </div>
        </div>

        {/* Discount Code */}
        <div className="space-y-2">
          <Label htmlFor="discount" className="text-sm font-medium">
            Promo code
          </Label>
          <div className="flex gap-2">
            <Input
              id="discount"
              placeholder="Enter code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={!!appliedDiscount || isApplyingDiscount}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="default"
              onClick={handleApplyDiscount}
              disabled={!discountCode.trim() || !!appliedDiscount || isApplyingDiscount}
            >
              {isApplyingDiscount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : appliedDiscount ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500 mr-1" />
                  Applied
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {appliedDiscount && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" />
              {appliedDiscount.code} applied
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment method</Label>
          <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId}>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    selectedMethodId === method.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                  onClick={() => setSelectedMethodId(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="shrink-0" />
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center h-11 w-11 rounded-xl",
                      selectedMethodId === method.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {paymentIcons[method.slug] ?? <CreditCard className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label
                      htmlFor={method.id}
                      className="font-medium cursor-pointer block"
                    >
                      {method.name}
                    </Label>
                    {method.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {method.description}
                      </p>
                    )}
                  </div>
                  {selectedMethodId === method.id && (
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Demo Mode Notice */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Demo mode</strong> — Payments are simulated. No real charges.
            </span>
          </p>
        </div>

        {/* Confirm Button */}
        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold"
          onClick={handleConfirm}
          disabled={!selectedMethodId || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Confirm payment · {formatPrice(finalPrice)}</>
          )}
        </Button>

        {/* Security Badge */}
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3" />
          Secure payment with SSL encryption
        </p>
      </DialogContent>
    </Dialog>
  );
}
