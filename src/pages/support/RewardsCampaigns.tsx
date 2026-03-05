import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Edit, Loader2, Plus, Trash2, RefreshCw, Copy } from "lucide-react";
import { useRewardsCampaigns, type PointEarningRule } from "@/hooks/useRewardsCampaigns";
import { toast } from "sonner";

function generateCode(): string {
    return "BUZZ-" + Math.random().toString(36).toUpperCase().slice(2, 8);
}

const emptyForm = {
    action_code: "",
    name: "",
    description: "",
    points_reward: 100,
    max_times_per_user: "" as number | "",
    is_active: true,
};

type FormState = typeof emptyForm;

export default function RewardsCampaigns() {
    const { data: rawRules = [], isLoading, toggleCampaignStatus, createRule, updateRule, deleteRule } = useRewardsCampaigns();

    const rules = [...rawRules].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return a.id.localeCompare(b.id);
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

    const isEditing = editingId !== null;
    const isPending = createRule.isPending || updateRule.isPending;
    const activeCount = rules.filter(c => c.is_active).length;

    const set = (field: keyof FormState, value: FormState[keyof FormState]) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm, action_code: generateCode() });
        setDialogOpen(true);
    };

    const openEdit = (rule: PointEarningRule) => {
        setEditingId(rule.id);
        setForm({
            action_code: rule.action_code,
            name: rule.name,
            description: rule.description ?? "",
            points_reward: rule.points_reward,
            max_times_per_user: rule.max_times_per_user ?? "",
            is_active: rule.is_active,
        });
        setDialogOpen(true);
    };

    const handleDelete = (rule: PointEarningRule) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรหัส "${rule.action_code}"?\nผู้ใช้ที่เคยบันทึกรหัสนี้แล้วจะไม่ได้รับผลกระทบ`)) {
            deleteRule.mutate(rule.id);
        }
    };

    const handleToggle = async (id: string, checked: boolean) => {
        setPendingToggleId(id);
        await toggleCampaignStatus.mutateAsync({ id, is_active: checked });
        setPendingToggleId(null);
    };

    const handleSubmit = async () => {
        if (!form.action_code.trim() || !form.name.trim()) return;

        const payload = {
            action_code: form.action_code.trim().toUpperCase(),
            name: form.name.trim(),
            description: form.description.trim() || null,
            points_reward: Number(form.points_reward),
            max_times_per_user: form.max_times_per_user === "" ? null : Number(form.max_times_per_user),
            is_active: form.is_active,
        };

        if (isEditing) {
            await updateRule.mutateAsync({ id: editingId!, ...payload });
        } else {
            await createRule.mutateAsync(payload);
        }
        setDialogOpen(false);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("คัดลอกรหัสแล้ว", { description: code });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Activity Codes</h1>
                    <p className="text-muted-foreground">จัดการรหัสกิจกรรมที่ผู้ใช้กรอกเพื่อรับคะแนนสะสม</p>
                </div>
                <Button onClick={openCreate} className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" /> สร้างรหัสกิจกรรม
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rules.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายการรหัสกิจกรรม</CardTitle>
                    <CardDescription>
                        ผู้ใช้จะกรอก Action Code เพื่อรับคะแนนสะสมตามเงื่อนไขที่กำหนด
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold text-foreground">รหัสกิจกรรม</TableHead>
                                    <TableHead className="font-bold text-foreground">ชื่อ / คำอธิบาย</TableHead>
                                    <TableHead className="font-bold text-foreground">แต้มรางวัล</TableHead>
                                    <TableHead className="font-bold text-foreground">จำกัดครั้ง/ผู้ใช้</TableHead>
                                    <TableHead className="w-[100px] font-bold text-foreground text-center">สถานะ</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => {
                                    const isThisPending = pendingToggleId === rule.id;
                                    return (
                                        <TableRow key={rule.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full shrink-0 ${rule.is_active ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"}`} />
                                                    <span className="font-mono text-sm font-bold">{rule.action_code}</span>
                                                    <button
                                                        onClick={() => copyCode(rule.action_code)}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                        title="คัดลอกรหัส"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{rule.name}</p>
                                                {rule.description && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                                        {rule.description}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-bold text-green-600 bg-green-50">
                                                    +{rule.points_reward.toLocaleString()} pts
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {rule.max_times_per_user === null
                                                    ? <span className="text-muted-foreground text-sm">ไม่จำกัด</span>
                                                    : `${rule.max_times_per_user} ครั้ง`}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={rule.is_active}
                                                    onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                                                    disabled={isThisPending}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(rule)}
                                                        disabled={deleteRule.isPending && deleteRule.variables === rule.id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {rules.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <Gift className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                            ยังไม่มีรหัสกิจกรรม — กด "สร้างรหัสกิจกรรม" เพื่อเริ่มต้น
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "แก้ไขรหัสกิจกรรม" : "สร้างรหัสกิจกรรมใหม่"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "แก้ไขรายละเอียดของรหัสกิจกรรม (ไม่สามารถเปลี่ยน Action Code ได้)"
                                : "กรอกรายละเอียดหรือกด Generate เพื่อสุ่มรหัสกิจกรรมใหม่"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Action Code */}
                        <div className="space-y-2">
                            <Label>
                                Action Code <span className="text-destructive">*</span>
                                <span className="ml-2 text-xs text-muted-foreground font-normal">(ตัวพิมพ์ใหญ่, ไม่ซ้ำกัน)</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="เช่น BUZZ-ABC123"
                                    value={form.action_code}
                                    readOnly={isEditing}
                                    className={`font-mono uppercase ${isEditing ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                                    onChange={(e) => set("action_code", e.target.value.toUpperCase())}
                                />
                                {!isEditing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        title="สุ่มรหัสใหม่"
                                        onClick={() => set("action_code", generateCode())}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {isEditing && (
                                <p className="text-xs text-amber-600">
                                    Action Code ไม่สามารถเปลี่ยนได้เพื่อป้องกันผลกระทบต่อผู้ใช้ที่บันทึกรหัสนี้แล้ว
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label>ชื่อกิจกรรม <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="เช่น เช็คอินวันแรก"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>คำอธิบาย</Label>
                            <Textarea
                                placeholder="อธิบายเงื่อนไขการรับรหัสนี้..."
                                className="resize-none"
                                rows={2}
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                            />
                        </div>

                        {/* Points + Max times */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>แต้มรางวัล</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.points_reward}
                                    onChange={(e) => set("points_reward", Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    จำกัดครั้ง/ผู้ใช้
                                    <span className="ml-1 text-xs text-muted-foreground font-normal">(เว้นว่าง = ไม่จำกัด)</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="ไม่จำกัด"
                                    value={form.max_times_per_user}
                                    onChange={(e) => set("max_times_per_user", e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* is_active */}
                        <div className="flex items-center gap-3 pt-1">
                            <Switch
                                id="rule_is_active"
                                checked={form.is_active}
                                onCheckedChange={(v) => set("is_active", v)}
                            />
                            <Label htmlFor="rule_is_active" className="cursor-pointer">เปิดใช้งานทันที</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !form.action_code.trim() || !form.name.trim()}
                        >
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? "บันทึก" : "สร้างรหัส"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
