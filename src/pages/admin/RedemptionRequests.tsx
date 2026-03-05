import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Search, Loader2 } from "lucide-react";
import { useRedemptionRequests, type RedemptionRequest } from "@/hooks/useRedemptionRequests";

export default function RedemptionRequests() {
    const { data: requests = [], isLoading, updateRedemptionStatus } = useRedemptionRequests();

    const [searchTerm, setSearchTerm] = useState("");
    const [processingRequest, setProcessingRequest] = useState<RedemptionRequest | null>(null);
    const [actionType, setActionType] = useState<"fulfill" | "reject" | null>(null);
    const [redemptionCode, setRedemptionCode] = useState("");
    const [adminNotes, setAdminNotes] = useState("");

    const filteredRequests = requests.filter(req =>
        req.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reward_item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const handleActionClick = (req: RedemptionRequest, type: "fulfill" | "reject") => {
        setProcessingRequest(req);
        setActionType(type);
        setRedemptionCode(req.redemption_code || "");
        setAdminNotes(req.admin_notes || "");
    };

    const submitAction = async () => {
        if (!processingRequest || !actionType) return;

        await updateRedemptionStatus.mutateAsync({
            id: processingRequest.id,
            status: actionType === "fulfill" ? "fulfilled" : "rejected",
            redemption_code: redemptionCode,
            admin_notes: adminNotes
        });

        setProcessingRequest(null);
        setActionType(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock className="w-3 h-3 mr-1" /> รอดำเนินการ</Badge>;
            case 'fulfilled': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> จัดส่งแล้ว</Badge>;
            case 'rejected': return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><XCircle className="w-3 h-3 mr-1" /> ปฏิเสธ</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Redemption Requests</h1>
                    <p className="text-muted-foreground">จัดการคำขอแลกของรางวัลจากพอยต์ลูกค้า</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาชื่อรางวัล หรือ Email"
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (
                        <div className="rounded-md border-0 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>วันที่แลก</TableHead>
                                        <TableHead>ลูกค้า (Email)</TableHead>
                                        <TableHead>ของรางวัล</TableHead>
                                        <TableHead>แต้มที่ใช้</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                                {format(new Date(req.redeemed_at), "dd MMM yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {req.customer?.full_name ?? "—"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{req.customer?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{req.reward_item?.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Type: {req.reward_item?.reward_type}
                                                    {req.redemption_code && ` • Code: ${req.redemption_code}`}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-amber-600">
                                                    {req.reward_item?.points_cost.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(req.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleActionClick(req, "fulfill")}>
                                                            อนุมัติ
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleActionClick(req, "reject")}>
                                                            ปฏิเสธ
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleActionClick(req, "fulfill")}>
                                                        ดูรายละเอียด
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                ไม่มีรายการคำขอแลกของรางวัล
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={!!processingRequest} onOpenChange={(open) => !open && setProcessingRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "fulfill" ? "รายละเอียดการจัดส่ง / อนุมัติ" : "ปฏิเสธการแลกรางวัล"}
                        </DialogTitle>
                        <DialogDescription>
                            อัปเดตสถานะสำหรับรายการ "{processingRequest?.reward_item?.name}" ของลูกค้า {processingRequest?.customer?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">แต้มที่ใช้:</span>
                                <span className="font-bold text-amber-600">{processingRequest?.reward_item?.points_cost.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันที่ขอแลก:</span>
                                <span>{processingRequest && format(new Date(processingRequest.redeemed_at), "dd MMM yyyy HH:mm")}</span>
                            </div>
                            {processingRequest?.status !== 'pending' && processingRequest?.fulfilled_at && (
                                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                                    <span className="text-muted-foreground">ทำรายการเมื่อ:</span>
                                    <span>{format(new Date(processingRequest.fulfilled_at), "dd MMM yyyy HH:mm")}</span>
                                </div>
                            )}
                        </div>

                        {actionType === 'fulfill' && (
                            <div className="space-y-2">
                                <Label>รหัสโค้ดรางวัล / Tracking Number (ถ้ามี)</Label>
                                <Input
                                    value={redemptionCode}
                                    onChange={(e) => setRedemptionCode(e.target.value)}
                                    placeholder="เช่น PROMO-ABCD-1234 หรือ TH12345678TH"
                                    readOnly={processingRequest?.status !== 'pending'}
                                />
                                <p className="text-xs text-muted-foreground">ข้อมูลนี้จะเชื่อมโยงไปแสดงให้ลูกค้าเห็น</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>บันทึกภายใน (Admin Notes)</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="โน้ตสำหรับทีมงาน (ลูกค้าไม่เห็น)"
                                readOnly={processingRequest?.status !== 'pending'}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProcessingRequest(null)}>ปิด</Button>
                        {processingRequest?.status === 'pending' && (
                            <Button
                                variant={actionType === "reject" ? "destructive" : "default"}
                                onClick={submitAction}
                                disabled={updateRedemptionStatus.isPending || (actionType === "reject" && !adminNotes.trim())}
                            >
                                {updateRedemptionStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {actionType === "fulfill" ? "ยืนยันการจัดส่ง / อนุมัติ" : "ยืนยันการปฏิเสธ"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
