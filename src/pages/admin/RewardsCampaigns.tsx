import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Edit, Loader2 } from "lucide-react";
import { useRewardsCampaigns, type PointEarningRule } from "@/hooks/useRewardsCampaigns";

export default function RewardsCampaigns() {
    const { data: campaigns = [], isLoading, toggleCampaignStatus, updateCampaignReward } = useRewardsCampaigns();

    const [editingCampaign, setEditingCampaign] = useState<PointEarningRule | null>(null);
    const [editPoints, setEditPoints] = useState<number>(0);

    const handleEditClick = (campaign: PointEarningRule) => {
        setEditingCampaign(campaign);
        setEditPoints(campaign.points_reward);
    };

    const handleSaveEdit = async () => {
        if (!editingCampaign) return;
        await updateCampaignReward.mutateAsync({
            id: editingCampaign.id,
            points_reward: editPoints,
        });
        setEditingCampaign(null);
    };

    const activeCount = campaigns.filter(c => c.is_active).length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Rewards Campaigns</h1>
                <p className="text-muted-foreground">จัดการแคมเปญกติกาการแจกแต้มสำหรับผู้ใช้</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>รายการแคมเปญแจกแต้ม</CardTitle>
                    <CardDescription>
                        กติกาหรือภารกิจ (Missions / Milestones) ที่ระบบจะให้คะแนนอัตโนมัติเมื่อลูกค้าทำสำเร็จ
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
                                <TableRow>
                                    <TableHead>รหัสกิจกรรม</TableHead>
                                    <TableHead>ชื่อแคมเปญ</TableHead>
                                    <TableHead>แต้มรางวัล</TableHead>
                                    <TableHead>จำกัดครั้ง/ผู้ใช้</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {campaign.action_code}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{campaign.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                                {campaign.description}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-bold text-green-600 bg-green-50">
                                                +{campaign.points_reward.toLocaleString()} pts
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {campaign.max_times_per_user === null
                                                ? <span className="text-muted-foreground">ไม่จำกัด</span>
                                                : `${campaign.max_times_per_user} ครั้ง`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={campaign.is_active}
                                                    onCheckedChange={(checked) =>
                                                        toggleCampaignStatus.mutate({ id: campaign.id, is_active: checked })
                                                    }
                                                    disabled={toggleCampaignStatus.isPending}
                                                />
                                                <span className="text-sm">
                                                    {campaign.is_active ? "เปิดใช้งาน" : "ปิด"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(campaign)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {campaigns.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            ไม่พบข้อมูลแคมเปญ
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>แก้ไขแต้มรางวัล</DialogTitle>
                        <DialogDescription>
                            ปรับจำนวนแต้มคะแนนที่จะแจกให้กับแคมเปญ "{editingCampaign?.name}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>จำนวนแต้มรางวัล (Points Reward)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={editPoints}
                                onChange={(e) => setEditPoints(Number(e.target.value))}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            <p><strong>รหัสกิจกรรม:</strong> {editingCampaign?.action_code}</p>
                            <p><strong>รายละเอียด:</strong> {editingCampaign?.description}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingCampaign(null)}>ยกเลิก</Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={updateCampaignReward.isPending || editPoints < 0}
                        >
                            {updateCampaignReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            บันทึกการเปลี่ยนแปลง
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
