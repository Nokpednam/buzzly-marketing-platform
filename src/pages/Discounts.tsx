import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useDiscounts, CreateDiscountInput } from "@/hooks/useDiscounts";
import { cn } from "@/lib/utils";
import {
    Tag,
    Plus,
    Copy,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    Percent,
    DollarSign,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Discounts() {
    const {
        discounts,
        isLoading,
        activeDiscounts,
        expiredDiscounts,
        exhaustedDiscounts,
        createDiscount,
        deleteDiscount,
        toggleActive,
    } = useDiscounts();

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<CreateDiscountInput>({
        code: "",
        name: "",
        discount_type: "percent",
        discount_value: 10,
        min_order_value: 0,
        usage_limit: null,
        start_date: null,
        end_date: null,
        description: "",
    });

    const handleCreate = async () => {
        if (!form.code) return;
        await createDiscount.mutateAsync(form);
        setOpen(false);
        setForm({
            code: "",
            name: "",
            discount_type: "percent",
            discount_value: 10,
            min_order_value: 0,
            usage_limit: null,
            start_date: null,
            end_date: null,
            description: "",
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied "${code}" to clipboard`);
    };

    const getStatus = (d: (typeof discounts)[0]) => {
        if (!d.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground", icon: XCircle };
        if (d.end_date && new Date(d.end_date) < new Date())
            return { label: "Expired", color: "bg-destructive/10 text-destructive", icon: Clock };
        if (d.usage_limit !== null && d.usage_count >= d.usage_limit)
            return { label: "Exhausted", color: "bg-amber-500/10 text-amber-600", icon: AlertCircle };
        return { label: "Active", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 };
    };

    const getUsagePercent = (d: (typeof discounts)[0]) => {
        if (!d.usage_limit) return 0;
        return Math.min((d.usage_count / d.usage_limit) * 100, 100);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Discount Codes</h1>
                    <p className="text-muted-foreground mt-1">จัดการโปรโมชั่นและโค้ดส่วนลดสำหรับลูกค้า</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> New Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-black uppercase tracking-tight">Create Discount Code</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Code *</Label>
                                    <Input
                                        placeholder="SUMMER20"
                                        value={form.code}
                                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        className="rounded-xl h-11 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Name</Label>
                                    <Input
                                        placeholder="Summer Sale"
                                        value={form.name ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Type</Label>
                                    <Select
                                        value={form.discount_type}
                                        onValueChange={(v) => setForm((p) => ({ ...p, discount_type: v as "percent" | "fixed" }))}
                                    >
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percent">Percent (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount (฿)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                                        Value {form.discount_type === "percent" ? "(%)" : "(฿)"}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={form.discount_value}
                                        onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Min Order (฿)</Label>
                                    <Input
                                        type="number"
                                        value={form.min_order_value ?? 0}
                                        onChange={(e) => setForm((p) => ({ ...p, min_order_value: Number(e.target.value) }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Usage Limit</Label>
                                    <Input
                                        type="number"
                                        placeholder="Unlimited"
                                        value={form.usage_limit ?? ""}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, usage_limit: e.target.value ? Number(e.target.value) : null }))
                                        }
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={form.start_date ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value || null }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">End Date</Label>
                                    <Input
                                        type="date"
                                        value={form.end_date ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value || null }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
                                <Input
                                    placeholder="Optional description..."
                                    value={form.description ?? ""}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    className="rounded-xl h-11"
                                />
                            </div>

                            <Button
                                className="w-full rounded-xl h-12 font-bold"
                                onClick={handleCreate}
                                disabled={createDiscount.isPending || !form.code}
                            >
                                {createDiscount.isPending ? "Creating..." : "Create Discount Code"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Codes", value: discounts.length, icon: Tag, color: "text-primary" },
                    { label: "Active", value: activeDiscounts.length, icon: CheckCircle2, color: "text-emerald-600" },
                    { label: "Expired", value: expiredDiscounts.length, icon: Clock, color: "text-amber-600" },
                    { label: "Exhausted", value: exhaustedDiscounts.length, icon: AlertCircle, color: "text-destructive" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-muted/20 rounded-2xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-background border">
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Discount List */}
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
                <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">All Discount Codes</CardTitle>
                    <CardDescription>คลิกที่โค้ดเพื่อคัดลอก</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : discounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
                            <Tag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="font-bold text-lg text-muted-foreground">ยังไม่มีโค้ดส่วนลด</p>
                            <p className="text-sm text-muted-foreground mt-1">สร้างโค้ดส่วนลดแรกของคุณด้านบน</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {discounts.map((discount) => {
                                const status = getStatus(discount);
                                const usagePct = getUsagePercent(discount);
                                const StatusIcon = status.icon;
                                return (
                                    <div
                                        key={discount.id}
                                        className="p-5 rounded-2xl border bg-background hover:border-primary/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                {/* Code Badge */}
                                                <button
                                                    onClick={() => copyCode(discount.code)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors group flex-shrink-0"
                                                >
                                                    <span className="font-mono font-black text-primary text-sm tracking-wider">
                                                        {discount.code}
                                                    </span>
                                                    <Copy className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" />
                                                </button>

                                                {/* Info */}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {discount.name && (
                                                            <p className="font-bold text-sm">{discount.name}</p>
                                                        )}
                                                        <Badge className={cn("text-[10px] h-5 px-2 gap-1", status.color)}>
                                                            <StatusIcon className="h-2.5 w-2.5" /> {status.label}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1">
                                                            {discount.discount_type === "percent" ? (
                                                                <><Percent className="h-2.5 w-2.5" /> {discount.discount_value}% off</>
                                                            ) : (
                                                                <><DollarSign className="h-2.5 w-2.5" /> ฿{discount.discount_value} off</>
                                                            )}
                                                        </Badge>
                                                        {discount.min_order_value > 0 && (
                                                            <Badge variant="secondary" className="text-[10px] h-5 px-2">
                                                                Min ฿{discount.min_order_value.toLocaleString()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {discount.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 truncate">{discount.description}</p>
                                                    )}
                                                    {(discount.start_date || discount.end_date) && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {discount.start_date && `From ${new Date(discount.start_date).toLocaleDateString()}`}
                                                            {discount.start_date && discount.end_date && " — "}
                                                            {discount.end_date && `Until ${new Date(discount.end_date).toLocaleDateString()}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold">
                                                        {discount.usage_count}
                                                        {discount.usage_limit ? ` / ${discount.usage_limit}` : ""} uses
                                                    </p>
                                                    {discount.usage_limit && (
                                                        <div className="w-20 mt-1">
                                                            <Progress value={usagePct} className="h-1.5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <Switch
                                                    checked={discount.is_active}
                                                    onCheckedChange={(v) => toggleActive.mutate({ id: discount.id, is_active: v })}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteDiscount.mutate(discount.id)}
                                                    disabled={deleteDiscount.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
