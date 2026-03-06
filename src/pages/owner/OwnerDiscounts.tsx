import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscounts } from "@/hooks/useDiscounts";
import { cn } from "@/lib/utils";
import {
    Tag,
    CheckCircle2,
    Clock,
    XCircle,
    Percent,
    DollarSign,
    Users,
    TrendingUp,
    Archive,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

export default function OwnerDiscounts() {
    const {
        discounts,
        isLoading,
        activeDiscounts,
        expiredDiscounts,
    } = useDiscounts();

    const totalCollected = discounts.reduce((sum, d) => sum + d.collections_count, 0);
    const totalUsed = discounts.reduce((sum, d) => sum + d.usage_count, 0);

    const percentCount = discounts.filter((d) => d.discount_type === "percent").length;
    const fixedCount = discounts.filter((d) => d.discount_type === "fixed").length;

    const pieData = [
        { name: "Percent (%)", value: percentCount, color: "#6d28d9" },
        { name: "Fixed (฿)", value: fixedCount, color: "#0d9488" },
    ].filter((d) => d.value > 0);

    const barData = discounts
        .filter((d) => d.published_at)
        .sort((a, b) => b.collections_count - a.collections_count)
        .slice(0, 8)
        .map((d) => ({
            code: d.code,
            Collected: d.collections_count,
            Used: d.usage_count,
        }));

    const getStatus = (d: (typeof discounts)[0]) => {
        if (!d.published_at) return { label: "Draft", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Archive };
        if (!d.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground border-border", icon: XCircle };
        if (d.end_date && new Date(d.end_date) < new Date())
            return { label: "Expired", color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock };
        if (d.usage_limit !== null && d.collections_count >= d.usage_limit)
            return { label: "Fully Collected", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertCircle };
        return { label: "Live", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                    <Sparkles className="h-4 w-4" />
                    Executive Overview
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Discount Analytics
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Read-only overview of all subscription discount campaigns
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))
                ) : (
                    [
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
                            label: "Total Used",
                            value: totalUsed,
                            icon: TrendingUp,
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
                    ))
                )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart — discount type breakdown */}
                <Card className="glass-panel">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Percent className="h-5 w-5 text-primary" />
                            Discount Type Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        {isLoading ? (
                            <Skeleton className="h-48 w-full rounded-xl" />
                        ) : pieData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                No data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} codes`, "Count"]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Bar Chart — top codes by collections */}
                <Card className="glass-panel">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Top Codes by Collections
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        {isLoading ? (
                            <Skeleton className="h-48 w-full rounded-xl" />
                        ) : barData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                No published codes yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                    <XAxis dataKey="code" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Collected" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Used" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Read-only Discount Table */}
            <Card className="glass-panel">
                <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        All Discount Codes
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : discounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
                            <Tag className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="font-bold text-muted-foreground">No discount codes found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-xs font-bold uppercase text-muted-foreground">
                                        <th className="text-left py-3 pr-4">Code</th>
                                        <th className="text-left py-3 pr-4">Name</th>
                                        <th className="text-left py-3 pr-4">Type</th>
                                        <th className="text-right py-3 pr-4">Value</th>
                                        <th className="text-left py-3 pr-4">Status</th>
                                        <th className="text-right py-3 pr-4">Collected</th>
                                        <th className="text-right py-3 pr-4">Used</th>
                                        <th className="text-right py-3 pr-4">Limit</th>
                                        <th className="text-left py-3">Date Range</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {discounts.map((d) => {
                                        const status = getStatus(d);
                                        const StatusIcon = status.icon;
                                        return (
                                            <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <span className="font-mono font-black text-primary text-xs tracking-widest">
                                                        {d.code}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {d.name ?? "—"}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 font-bold">
                                                        {d.discount_type === "percent" ? (
                                                            <><Percent className="h-2.5 w-2.5" /> Percent</>
                                                        ) : (
                                                            <><DollarSign className="h-2.5 w-2.5" /> Fixed</>
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-right font-bold">
                                                    {d.discount_type === "percent"
                                                        ? `${d.discount_value}%`
                                                        : `฿${d.discount_value}`}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge className={cn("text-[10px] h-5 px-2 gap-1 border", status.color)}>
                                                        <StatusIcon className="h-2.5 w-2.5" /> {status.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold text-emerald-600">
                                                    {d.collections_count}
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold">
                                                    {d.usage_count}
                                                </td>
                                                <td className="py-3 pr-4 text-right text-muted-foreground">
                                                    {d.usage_limit ?? "∞"}
                                                </td>
                                                <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    {d.start_date || d.end_date ? (
                                                        <>
                                                            {d.start_date
                                                                ? new Date(d.start_date).toLocaleDateString()
                                                                : "—"}
                                                            {" → "}
                                                            {d.end_date
                                                                ? new Date(d.end_date).toLocaleDateString()
                                                                : "No end"}
                                                        </>
                                                    ) : (
                                                        "No date range"
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
