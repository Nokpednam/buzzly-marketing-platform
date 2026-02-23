import { useState } from "react";
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
  promptpay: <QrCode className="h-5 w-5" />,
  bank_transfer: <Building2 className="h-5 w-5" />,
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
      const { data, error } = await (supabase as any).rpc(
        "validate_collected_discount",
        { p_code: discountCode.trim() }
      );

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
            title: "กรุณาเข้าสู่ระบบ",
            description: "โปรดเข้าสู่ระบบก่อนใช้โค้ดส่วนลด",
          },
          invalid_code: {
            title: "โค้ดส่วนลดไม่ถูกต้อง",
            description: "กรุณาตรวจสอบและลองใหม่อีกครั้ง",
          },
          not_collected: {
            title: "คุณยังไม่ได้เก็บโค้ดนี้",
            description: "ไปเก็บโค้ดได้จากหน้าการแจ้งเตือนก่อนนำมาใช้",
          },
          already_used: {
            title: "โค้ดส่วนลดนี้ถูกใช้แล้ว",
            description: "โค้ดนี้ถูกใช้ไปแล้วในการชำระเงินครั้งก่อน",
          },
          expired: {
            title: "โค้ดส่วนลดหมดอายุแล้ว",
            description: "โปรดลองใช้โค้ดอื่น",
          },
          exhausted: {
            title: "โค้ดส่วนลดถูกใช้ครบตามจำนวนแล้ว",
            description: "โปรดลองใช้โค้ดอื่น",
          },
        };

        const msg = errorMessages[result.error] ?? {
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบโค้ดส่วนลดได้",
        };
        toast({ ...msg, variant: "destructive" });
        return;
      }

      // Validate min order value on the frontend
      if (result.min_order_value && basePrice < result.min_order_value) {
        toast({
          title: "ยอดสั่งซื้อไม่ถึงเกณฑ์",
          description: `ต้องมียอดสั่งซื้อขั้นต่ำ ฿${result.min_order_value} ขึ้นไป`,
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
      console.error("Discount error:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบโค้ดส่วนลดได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedMethodId) {
      toast({
        title: "กรุณาเลือกวิธีชำระเงิน",
        description: "โปรดเลือกวิธีการชำระเงินก่อนดำเนินการต่อ",
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
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>เลือกวิธีชำระเงิน</DialogTitle>
              <DialogDescription>
                {selectedPlan.name} Plan - {billingCycle === "yearly" ? "รายปี" : "รายเดือน"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">แผน</span>
            <span className="font-medium">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">รอบการชำระ</span>
            <span className="font-medium">
              {billingCycle === "yearly" ? "รายปี" : "รายเดือน"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ราคาปกติ</span>
            <span className={cn(appliedDiscount && "line-through text-muted-foreground")}>
              {formatPrice(basePrice)}
            </span>
          </div>

          {monthlySavings > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span className="text-sm flex items-center gap-1">
                <Tag className="h-3 w-3" />
                ประหยัดจากรายปี
              </span>
              <span className="font-medium">-{formatPrice(monthlySavings)}</span>
            </div>
          )}

          {appliedDiscount && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span className="text-sm flex items-center gap-1">
                <Tag className="h-3 w-3" />
                โค้ดส่วนลด ({appliedDiscount.code})
              </span>
              <span className="font-medium">-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">ยอดรวมทั้งหมด</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(finalPrice)}
            </span>
          </div>
        </div>

        {/* Discount Code */}
        <div className="space-y-2">
          <Label htmlFor="discount" className="text-sm">
            โค้ดส่วนลด (ถ้ามี)
          </Label>
          <div className="flex gap-2">
            <Input
              id="discount"
              placeholder="กรอกโค้ดส่วนลด"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={!!appliedDiscount || isApplyingDiscount}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleApplyDiscount}
              disabled={!discountCode.trim() || !!appliedDiscount || isApplyingDiscount}
            >
              {isApplyingDiscount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : appliedDiscount ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                "ใช้โค้ด"
              )}
            </Button>
          </div>
          {appliedDiscount && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ ใช้โค้ด {appliedDiscount.code}ลดสำเร็จ
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">เลือกวิธีชำระเงิน</Label>
          <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedMethodId === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
                onClick={() => setSelectedMethodId(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg",
                    selectedMethodId === method.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {paymentIcons[method.slug] || <CreditCard className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor={method.id}
                    className="font-medium cursor-pointer"
                  >
                    {method.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                {selectedMethodId === method.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Mock Payment Notice */}
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Demo Mode:</strong> นี่คือระบบทดสอบ การชำระเงินจะจำลองเป็นสำเร็จโดยอัตโนมัติ
              ไม่มีการเรียกเก็บเงินจริง
            </span>
          </p>
        </div>

        {/* Confirm Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleConfirm}
          disabled={!selectedMethodId || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังประมวลผล...
            </>
          ) : (
            <>
              ยืนยันชำระเงิน {formatPrice(finalPrice)}
            </>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>การชำระเงินปลอดภัยด้วยการเข้ารหัส SSL</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
