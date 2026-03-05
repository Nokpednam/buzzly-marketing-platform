import { useState } from "react";
import { useRewardsManagement, type RewardItem } from "@/hooks/useRewardsManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { PackageOpen, Edit, Search, Gift, Loader2, Plus, Trash2 } from "lucide-react";

const REWARD_TYPES = ["system_quota", "service", "partner_perk", "digital_asset"] as const;

const emptyForm = {
    name: "",
    description: "",
    reward_type: "service",
    points_cost: 0,
    stock_quantity: "" as number | "",
    image_url: "",
    is_active: true,
};

type FormState = typeof emptyForm;

export default function RewardsManagement() {
    const { data: rewards = [], isLoading, toggleRewardStatus, createRewardItem, updateRewardItem, deleteRewardItem } = useRewardsManagement();

    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    const filteredRewards = rewards.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeCount = rewards.filter(r => r.is_active).length;
    const isEditing = editingId !== null;
    const isPending = createRewardItem.isPending || updateRewardItem.isPending;

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (reward: RewardItem) => {
        setEditingId(reward.id);
        setForm({
            name: reward.name,
            description: reward.description ?? "",
            reward_type: reward.reward_type,
            points_cost: reward.points_cost,
            stock_quantity: reward.stock_quantity ?? "",
            image_url: reward.image_url ?? "",
            is_active: reward.is_active,
        });
        setDialogOpen(true);
    };

    const handleDelete = (reward: RewardItem) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบ "${reward.name}"?`)) {
            deleteRewardItem.mutate(reward.id);
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            reward_type: form.reward_type,
            points_cost: Number(form.points_cost),
            stock_quantity: form.stock_quantity === "" ? null : Number(form.stock_quantity),
            image_url: form.image_url.trim() || null,
            is_active: form.is_active,
        };

        if (isEditing) {
            await updateRewardItem.mutateAsync({ id: editingId!, ...payload });
        } else {
            await createRewardItem.mutateAsync(payload);
        }
        setDialogOpen(false);
    };

    const set = (field: keyof FormState, value: FormState[keyof FormState]) =>
        setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <PackageOpen className="h-8 w-8 text-primary" /> Rewards Catalog
                    </h1>
                    <p className="text-muted-foreground mt-1">จัดการแคตตาล็อกของรางวัลสำหรับนำไปแลกด้วยคะแนนสะสม</p>
                </div>
                <Button onClick={openCreate} className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" /> Add Reward
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rewards.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">{rewards.length - activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <CardTitle>รายการของรางวัล</CardTitle>
                            <CardDescription>ของรางวัลทั้งหมดในระบบ</CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อของรางวัล..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filteredRewards.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Gift className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            ไม่พบรายการของรางวัล
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">รูปภาพ</TableHead>
                                        <TableHead>ของรางวัล</TableHead>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead className="text-right">คะแนนที่ใช้แลก</TableHead>
                                        <TableHead className="text-right">จำนวนคงเหลือ</TableHead>
                                        <TableHead className="text-center">สถานะใช้งาน</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRewards.map((reward) => (
                                        <TableRow
                                            key={reward.id}
                                            className={`transition-opacity duration-200 ${reward.is_active ? "" : "opacity-60 bg-muted/20"}`}
                                        >
                                            <TableCell>
                                                <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                                                    {reward.image_url ? (
                                                        <img src={reward.image_url} alt={reward.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Gift className="h-5 w-5 text-muted-foreground opacity-50" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{reward.name}</p>
                                                {reward.description && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{reward.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="uppercase text-[10px]">
                                                    {reward.reward_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-amber-600">
                                                {reward.points_cost.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {reward.stock_quantity === null ? (
                                                    <Badge variant="secondary" className="font-normal text-xs">ไม่จำกัด</Badge>
                                                ) : reward.stock_quantity <= 0 ? (
                                                    <Badge variant="destructive" className="font-normal text-xs">หมด</Badge>
                                                ) : (
                                                    <span className={reward.stock_quantity <= 10 ? "text-orange-500 font-bold" : ""}>
                                                        {reward.stock_quantity.toLocaleString()}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={reward.is_active}
                                                    onCheckedChange={() => toggleRewardStatus.mutate({ id: reward.id, is_active: !reward.is_active })}
                                                    disabled={toggleRewardStatus.isPending && toggleRewardStatus.variables?.id === reward.id}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(reward)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(reward)}
                                                        disabled={deleteRewardItem.isPending && deleteRewardItem.variables === reward.id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "แก้ไขของรางวัล" : "เพิ่มของรางวัลใหม่"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? `แก้ไขข้อมูลของรางวัล "${form.name}"` : "กรอกข้อมูลของรางวัลที่ต้องการเพิ่มในระบบ"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>ชื่อของรางวัล <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="เช่น Extra Storage 10GB"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>คำอธิบาย</Label>
                            <Textarea
                                placeholder="รายละเอียดของรางวัล..."
                                className="resize-none"
                                rows={3}
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ประเภท</Label>
                                <Select value={form.reward_type} onValueChange={(v) => set("reward_type", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REWARD_TYPES.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>คะแนนที่ใช้แลก</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.points_cost}
                                    onChange={(e) => set("points_cost", Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>จำนวนสต๊อก <span className="text-xs text-muted-foreground">(เว้นว่าง = ไม่จำกัด)</span></Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="ไม่จำกัด"
                                    value={form.stock_quantity}
                                    onChange={(e) => set("stock_quantity", e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>URL รูปภาพ</Label>
                                <Input
                                    placeholder="https://..."
                                    value={form.image_url}
                                    onChange={(e) => set("image_url", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <Switch
                                id="is_active"
                                checked={form.is_active}
                                onCheckedChange={(v) => set("is_active", v)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">เปิดให้แลกได้ทันที</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? "บันทึก" : "เพิ่มของรางวัล"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
