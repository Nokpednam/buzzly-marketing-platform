import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Download,
  Check,
  Star,
  Crown,
  FileText,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { useSubscription, BillingCycle } from "@/hooks/useSubscription";
import { useInvoices } from "@/hooks/useInvoices";

export function BillingTab() {
  const {
    plans,
    paymentMethods,
    currentSubscription,
    loading: subLoading,
    getPrice,
    getSavingsPercent,
    createSubscription,
  } = useSubscription();

  const {
    invoices,
    isLoading: invoicesLoading,
    getStatusLabel,
    getStatusColor,
    formatCurrency,
  } = useInvoices();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const currentPlan = plans.find(p => p.id === currentSubscription?.plan_id);

  const handleUpgrade = (planId: string) => {
    setSelectedPlanId(planId);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (methodId: string) => {
    if (!selectedPlanId) return;
    const result = await createSubscription(selectedPlanId, methodId, billingCycle);
    if (result.success) {
      setPaymentDialogOpen(false);
      setSelectedPlanId(null);
    }
  };

  if (subLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>แผนปัจจุบัน</CardTitle>
              <CardDescription>
                {currentPlan ? `คุณกำลังใช้แผน ${currentPlan.name}` : "คุณยังไม่ได้สมัครแผน"}
              </CardDescription>
            </div>
            {currentPlan && (
              <Badge className="bg-primary gap-1">
                <Crown className="h-3 w-3" />
                {currentPlan.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  ฿{getPrice(currentPlan, currentSubscription?.billing_cycle || "monthly").toLocaleString()}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{currentSubscription?.billing_cycle === "yearly" ? "ปี" : "เดือน"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ชำระ{currentSubscription?.billing_cycle === "yearly" ? "รายปี" : "รายเดือน"} • 
                  รอบบิลถัดไป: {currentSubscription?.current_period_end 
                    ? new Date(currentSubscription.current_period_end).toLocaleDateString("th-TH")
                    : "-"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">เปลี่ยนแผน</Button>
                {currentSubscription?.cancel_at_period_end ? (
                  <Badge variant="destructive">จะยกเลิกเมื่อสิ้นสุดรอบบิล</Badge>
                ) : (
                  <Button variant="ghost" className="text-destructive">ยกเลิกแผน</Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">เลือกแผนด้านล่างเพื่อเริ่มใช้งาน</p>
          )}
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
          <TabsList>
            <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2">
              รายปี
              <Badge variant="secondary" className="text-xs">ประหยัด 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const savings = getSavingsPercent(plan);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative border-0 shadow-sm ${plan.is_popular ? "ring-2 ring-primary" : ""}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1">
                    <Star className="h-3 w-3" />
                    แนะนำ
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrentPlan && <Badge variant="outline">ใช้อยู่</Badge>}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    ฿{getPrice(plan, billingCycle).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === "yearly" ? "ปี" : "เดือน"}
                  </span>
                </div>
                {billingCycle === "yearly" && savings > 0 && (
                  <p className="text-sm text-success">ประหยัด {savings}%</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrentPlan ? "แผนปัจจุบัน" : "เลือกแผนนี้"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Method */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            วิธีการชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">หมดอายุ 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              อัปเดต
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ประวัติใบแจ้งหนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">ยังไม่มีใบแจ้งหนี้</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || invoice.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString("th-TH")
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.subscription?.plan?.name || "Subscription"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {invoices.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="link" className="gap-1">
                ดูทั้งหมด
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
