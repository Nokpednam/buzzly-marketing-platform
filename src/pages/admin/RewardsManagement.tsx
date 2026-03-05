import { useState } from "react";
import { useRewardsManagement, type RewardItem } from "@/hooks/useRewardsManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { PackageOpen, Edit, AlertCircle, Search, Gift, Loader2 } from "lucide-react";

export default function RewardsManagement() {
    const { data: rewards = [], isLoading, toggleRewardStatus, updateRewardItem } = useRewardsManagement();

    const [searchTerm, setSearchTerm] = useState("");
    const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
    const [editPointsCost, setEditPointsCost] = useState<number>(0);
    const [editStock, setEditStock] = useState<number | "">("");

    const filteredRewards = rewards.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeCount = rewards.filter(r => r.is_active).length;

    const handleEditClick = (reward: RewardItem) => {
        setEditingReward(reward);
        setEditPointsCost(reward.points_cost);
        setEditStock(reward.stock_quantity ?? "");
    };

    const handleSaveEdit = async () => {
        if (!editingReward) return;
        await updateRewardItem.mutateAsync({
            id: editingReward.id,
            points_cost: editPointsCost,
            stock_quantity: editStock === "" ? null : Number(editStock),
        });
        setEditingReward(null);
    };

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
                                            className={`table-row-hover transition-opacity duration-200 ${reward.is_active ? "" : "opacity-60 bg-muted/20"}`}
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
                                                <Button variant="ghost" size="sm" className="press-effect" onClick={() => handleEditClick(reward)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingReward} onOpenChange={(open) => !open && setEditingReward(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>แก้ไขของรางวัล</DialogTitle>
                        <DialogDescription>
                            ปรับเปลี่ยนคะแนนที่ใช้แลกและจำนวนสต๊อกของ "{editingReward?.name}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>คะแนนที่ใช้แลก (Points Cost)</Label>
                            <Input
                                type="number"
                                value={editPointsCost}
                                onChange={(e) => setEditPointsCost(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>จำนวนสต๊อก (เว้นว่างไว้หากไม่จำกัดจำนวน)</Label>
                            <Input
                                type="number"
                                placeholder="เช่น 100, หรือเว้นว่าง"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </div>
                        <div className="flex items-start gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mt-4">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>การปรับสต๊อกให้เป็น 0 ของรางวัลจะแสดงเป็น "หมด" ในหน้าระบบ</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReward(null)}>ยกเลิก</Button>
                        <Button onClick={handleSaveEdit} disabled={updateRewardItem.isPending}>
                            {updateRewardItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
