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
    Users,
    Zap,
    Send,
    Archive,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DiscountManagement() {
    const {
        discounts,
        isLoading,
        draftDiscounts,
        ongoingDiscounts,
        endedDiscounts,
        activeDiscounts,
        expiredDiscounts,
        createDiscount,
        deleteDiscount,
        toggleActive,
        publishDiscount,
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
        if (!d.published_at) return { label: "Draft", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Archive };
        if (!d.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground border-border", icon: XCircle };
        if (d.end_date && new Date(d.end_date) < new Date())
            return { label: "Expired", color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock };
        if (d.usage_limit !== null && d.collections_count >= d.usage_limit)
            return { label: "Fully Collected", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertCircle };
        return { label: "Live", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 };
    };

    const getUsagePercent = (d: (typeof discounts)[0]) => {
        if (!d.usage_limit) return 0;
        return Math.min((d.collections_count / d.usage_limit) * 100, 100);
    };

    const totalCollected = discounts.reduce((sum, d) => sum + d.collections_count, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-2">
                        <Tag className="h-4 w-4" />
                        Subscription Promotions
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Discount Management
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Create and manage subscription discount codes
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl gap-2 shadow-lg shadow-emerald-700/20 px-6 py-6 font-bold shrink-0 bg-emerald-700 hover:bg-emerald-800">
                            <Plus className="h-5 w-5" /> New Discount Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-lg border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                                <Tag className="h-5 w-5 text-emerald-700" />
                                Create Discount Code
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Code *</Label>
                                    <Input
                                        placeholder="LAUNCH50"
                                        value={form.code}
                                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        className="rounded-xl h-11 font-mono font-bold tracking-widest"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Campaign Name</Label>
                                    <Input
                                        placeholder="Launch Promo"
                                        value={form.name ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Discount Type</Label>
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
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Min Order (฿)</Label>
                                    <Input
                                        type="number"
                                        value={form.min_order_value ?? 0}
                                        onChange={(e) => setForm((p) => ({ ...p, min_order_value: Number(e.target.value) }))}
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
                                    placeholder="e.g. 50% off for new subscribers in launch month"
                                    value={form.description ?? ""}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    className="rounded-xl h-11"
                                />
                            </div>

                            <Button
                                className="w-full rounded-xl h-12 font-bold bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/20"
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Codes",
                        value: discounts.length,
                        icon: Tag,
                        gradient: "from-violet-600 to-purple-700",
                        text: "text-purple-100",
                    },
                    {
                        label: "Active / Live",
                        value: activeDiscounts.length,
                        icon: CheckCircle2,
                        gradient: "from-emerald-600 to-teal-700",
                        text: "text-emerald-100",
                    },
                    {
                        label: "Total Collected",
                        value: totalCollected,
                        icon: Users,
                        gradient: "from-blue-600 to-indigo-700",
                        text: "text-blue-100",
                    },
                    {
                        label: "Expired",
                        value: expiredDiscounts.length,
                        icon: Clock,
                        gradient: "from-amber-500 to-orange-600",
                        text: "text-amber-100",
                    },
                ].map((stat) => (
                    <Card
                        key={stat.label}
                        className={`bg-gradient-to-br ${stat.gradient} border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <stat.icon className="h-20 w-20 text-white transform rotate-12 translate-x-6 -translate-y-2" />
                        </div>
                        <CardContent className="p-5 relative z-10">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white mb-3">
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <p className={`text-sm font-medium mt-0.5 ${stat.text}`}>{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Discount List */}
            <Card className="glass-panel">
                <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-emerald-700" />
                        All Discount Codes
                    </CardTitle>
                    <CardDescription>Click a code to copy it · Toggle to activate/deactivate · Release to publish to customers</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : discounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed">
                            <div className="h-20 w-20 bg-emerald-700/10 rounded-full flex items-center justify-center mb-4">
                                <Tag className="h-10 w-10 text-emerald-700/40" />
                            </div>
                            <p className="font-bold text-lg text-muted-foreground">No discount codes yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create the first discount code for a subscription plan
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Drafts Section */}
                            {draftDiscounts.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Archive className="h-5 w-5 text-slate-500" />
                                        Draft Campaigns
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            {draftDiscounts.length}
                                        </Badge>
                                    </h3>
                                    <div className="space-y-3">
                                        {draftDiscounts.map(renderDiscountCard)}
                                    </div>
                                </div>
                            )}

                            {/* Ongoing Section */}
                            {ongoingDiscounts.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-emerald-500" />
                                        Ongoing Campaigns
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                            {ongoingDiscounts.length}
                                        </Badge>
                                    </h3>
                                    <div className="space-y-3">
                                        {ongoingDiscounts.map(renderDiscountCard)}
                                    </div>
                                </div>
                            )}

                            {/* Ended Section */}
                            {endedDiscounts.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-slate-500" />
                                        Ended Campaigns
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            {endedDiscounts.length}
                                        </Badge>
                                    </h3>
                                    <div className="space-y-3">
                                        {endedDiscounts.map(renderDiscountCard)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    function renderDiscountCard(discount: (typeof discounts)[0]) {
        const status = getStatus(discount);
        const usagePct = getUsagePercent(discount);
        const StatusIcon = status.icon;

        return (
            <div
                key={discount.id}
                className="p-5 rounded-2xl border bg-background hover:border-emerald-700/30 hover:shadow-md transition-all duration-200"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Code Badge */}
                        <button
                            onClick={() => copyCode(discount.code)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/5 border border-emerald-700/20 hover:bg-emerald-700/10 transition-colors group flex-shrink-0"
                        >
                            <span className="font-mono font-black text-emerald-700 text-sm tracking-widest">
                                {discount.code}
                            </span>
                            <Copy className="h-3 w-3 text-emerald-700/50 group-hover:text-emerald-700 transition-colors" />
                        </button>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                {discount.name && (
                                    <p className="font-bold text-sm">{discount.name}</p>
                                )}
                                <Badge className={cn("text-[10px] h-5 px-2 gap-1 border", status.color)}>
                                    <StatusIcon className="h-2.5 w-2.5" /> {status.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 font-bold">
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
                            <p className="text-xs font-bold text-muted-foreground">
                                <span className="text-emerald-600">{discount.collections_count}</span> collected
                            </p>
                            <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                {discount.usage_count} used
                                {discount.usage_limit ? ` / ${discount.usage_limit} limit` : ""}
                            </p>
                            {discount.usage_limit && (
                                <div className="w-24 mt-1.5">
                                    <Progress value={usagePct} className="h-1.5" />
                                </div>
                            )}
                        </div>

                        <div className="w-px h-8 bg-border mx-2" />

                        {!discount.published_at ? (
                            <Button
                                onClick={() => publishDiscount.mutate(discount.id)}
                                disabled={publishDiscount.isPending}
                                className="h-10 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Release Code
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={discount.is_active}
                                    onCheckedChange={(v) => toggleActive.mutate({ id: discount.id, is_active: v })}
                                />
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteDiscount.mutate(discount.id)}
                            disabled={deleteDiscount.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
