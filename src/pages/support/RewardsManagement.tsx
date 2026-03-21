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
        if (window.confirm(`Are you sure you want to delete "${reward.name}"?`)) {
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
                    <p className="text-muted-foreground mt-1">Manage rewards catalog for point redemptions</p>
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
                            <CardTitle>Reward List</CardTitle>
                            <CardDescription>All rewards in the system</CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search rewards..."
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
                            No rewards found
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table className="table-fixed w-full">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead className="w-[250px]">Reward</TableHead>
                                        <TableHead className="w-[120px]">Type</TableHead>
                                        <TableHead className="text-right w-[150px]">Points Required</TableHead>
                                        <TableHead className="text-right w-[120px]">Stock</TableHead>
                                        <TableHead className="text-center w-[100px]">Status</TableHead>
                                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRewards.map((reward) => (
                                        <TableRow
                                            key={reward.id}
                                            className={`transition-opacity duration-200 ${reward.is_active ? "" : "opacity-60 bg-muted/20"}`}
                                        >
                                            <TableCell className="w-[80px]">
                                                <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                                                    {reward.image_url ? (
                                                        <img src={reward.image_url} alt={reward.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Gift className="h-5 w-5 text-muted-foreground opacity-50" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[250px]">
                                                <p className="font-medium truncate">{reward.name}</p>
                                                {reward.description && (
                                                    <p className="text-xs text-muted-foreground truncate">{reward.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[120px]">
                                                <Badge variant="outline" className="uppercase text-[10px]">
                                                    {reward.reward_type.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-amber-600 w-[150px]">
                                                {reward.points_cost.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right w-[120px]">
                                                {reward.stock_quantity === null ? (
                                                    <Badge variant="secondary" className="font-normal text-xs">Unlimited</Badge>
                                                ) : reward.stock_quantity <= 0 ? (
                                                    <Badge variant="destructive" className="font-normal text-xs">Sold Out</Badge>
                                                ) : (
                                                    <span className={reward.stock_quantity <= 10 ? "text-orange-500 font-bold" : ""}>
                                                        {reward.stock_quantity.toLocaleString()}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center w-[100px]">
                                                <Switch
                                                    checked={reward.is_active}
                                                    onCheckedChange={() => toggleRewardStatus.mutate({ id: reward.id, is_active: !reward.is_active })}
                                                    disabled={toggleRewardStatus.isPending && toggleRewardStatus.variables?.id === reward.id}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right w-[100px]">
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
                        <DialogTitle>{isEditing ? "Edit Reward" : "Add New Reward"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? `Update details for reward "${form.name}"` : "Enter information for the new reward to add to the system"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Reward Name <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="e.g. Extra Storage 10GB"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Reward details..."
                                className="resize-none"
                                rows={3}
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
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
                                <Label>Points Required</Label>
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
                                <Label>Stock Quantity <span className="text-xs text-muted-foreground">(Empty = Unlimited)</span></Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Unlimited"
                                    value={form.stock_quantity}
                                    onChange={(e) => set("stock_quantity", e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Image URL</Label>
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
                            <Label htmlFor="is_active" className="cursor-pointer">Active and Ready for Redemption</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? "Save Changes" : "Add Reward"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
