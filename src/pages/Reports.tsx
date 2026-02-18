import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Download,
  FileText,
  Calendar,
  Clock,
  Plus,
  MoreHorizontal,
  Eye,
  Share2,
  Trash2,
  FileSpreadsheet,
  BarChart3,
  DollarSign,
  Users,
  Smartphone,
  ArrowRight,
  Sparkles,
  FileCheck,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { useReports } from "@/hooks/useReports";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const reportTemplates = [
  { id: "campaign", name: "Campaign Performance", description: "Conversion & CTR deep dive", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "roi", name: "ROI Analysis", description: "Financial efficiency report", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "audience", name: "Audience Insights", description: "Demographics & Behavior", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "channel", name: "Channel Comparison", description: "Multi-platform benchmarks", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-500/10" },
];

function ReportsContent() {
  const { reports, isLoading, createReport, deleteReport } = useReports();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState("all");

  // Custom report form state
  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState("campaign");
  const [newReportFormat, setNewReportFormat] = useState("pdf");

  const handleQuickGenerate = (typeId: string, reportName?: string) => {
    setPreviewReport(reportName ?? typeId);
    setIsPreviewOpen(true);
  };

  const handleSaveReport = async () => {
    if (!newReportName.trim()) return;
    await createReport.mutateAsync({
      name: newReportName,
      report_type: newReportType,
      file_format: newReportFormat,
    });
    setIsGenerateOpen(false);
    setNewReportName("");
  };

  const handleDelete = async (reportId: string) => {
    await deleteReport.mutateAsync(reportId);
  };

  const filteredReports = reports.filter((r) => {
    if (filterFormat === "all") return true;
    return r.file_format?.toLowerCase() === filterFormat;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Intelligence Center
          </div>
          <h1 className="text-4xl font-black tracking-tight">REPORTS</h1>
          <p className="text-muted-foreground">Transform your marketing data into actionable stakeholder insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl px-6 h-11 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={() => { }}
          >
            <Clock className="h-4 w-4 mr-2" /> Schedule Automation
          </Button>
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="rounded-xl px-6 h-11 shadow-lg shadow-primary/20 bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" /> Custom Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: TEMPLATE GALLERY (4 COL) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Quick Templates</h3>
            <Badge variant="secondary" className="text-[10px]">PRESET</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer border-none bg-muted/30 transition-all hover:bg-muted/50 hover:ring-1 ring-primary/20 overflow-hidden"
                onClick={() => handleQuickGenerate(template.id, template.name)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-background ${template.color}`}>
                    <template.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{template.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary text-primary-foreground border-none rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="h-20 w-20" /></div>
            <CardContent className="p-6 relative">
              <h4 className="font-bold mb-1">AI Smart Summary</h4>
              <p className="text-xs opacity-80 mb-4 leading-relaxed">Let Buzzly AI analyze your top campaigns and generate a narrative summary for your next meeting.</p>
              <Button size="sm" variant="secondary" className="w-full font-bold">Try AI Insights</Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: RECENT ACTIVITY (8 COL) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Archives</CardTitle>
              </div>
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue placeholder="All Files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF Docs</SelectItem>
                  <SelectItem value="excel">Excel Data</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="font-bold text-muted-foreground">ยังไม่มีรายงาน</p>
                  <p className="text-sm text-muted-foreground mt-1">คลิก "Custom Report" เพื่อสร้างรายงานแรกของคุณ</p>
                  <Button
                    size="sm"
                    className="mt-4 rounded-xl"
                    onClick={() => setIsGenerateOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> สร้างรายงาน
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-background border hover:border-primary/50 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${report.file_format === "pdf" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                          {report.file_format === "pdf" ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{report.name}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {report.created_at
                                ? format(new Date(report.created_at), "d MMM yyyy", { locale: th })
                                : "—"}
                            </span>
                            <Badge variant="outline" className="text-[9px] py-0 h-4">
                              {report.report_type}
                            </Badge>
                            <Badge
                              className={`text-[9px] py-0 h-4 ${report.status === "ready"
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-yellow-500/10 text-yellow-600"
                                }`}
                            >
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-9 w-9"
                          onClick={() => handleQuickGenerate(report.id, report.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-4 h-9 gap-2"
                            asChild
                          >
                            <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5" /> Download
                            </a>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" /> Share with Team
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CREATE REPORT DIALOG --- */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">สร้างรายงานใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>ชื่อรายงาน</Label>
              <Input
                placeholder="เช่น Monthly Performance Q1 2026"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภทรายงาน</Label>
              <Select value={newReportType} onValueChange={setNewReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>รูปแบบไฟล์</Label>
              <Select value={newReportFormat} onValueChange={setNewReportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveReport}
              disabled={!newReportName.trim() || createReport.isPending}
              className="rounded-xl"
            >
              {createReport.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              สร้างรายงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- PREVIEW DIALOG --- */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[850px] p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-muted/20">
          <div className="h-[80vh] overflow-y-auto p-6 md:p-12">
            <div className="bg-background shadow-2xl rounded-sm p-12 min-h-full border">
              <div className="flex justify-between items-start mb-12 border-b pb-8">
                <div>
                  <div className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded w-fit mb-4 tracking-widest">BUZZLY REPORT</div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{previewReport ?? "Performance Summary"}</h2>
                  <p className="text-muted-foreground font-serif italic">
                    Generated on {format(new Date(), "d MMMM yyyy", { locale: th })}
                  </p>
                </div>
                <div className="text-right text-[10px] font-bold text-muted-foreground uppercase leading-loose">
                  Ref: #BZY-{Date.now().toString().slice(-6)}<br />
                  Data: Aggregated Channels<br />
                  Status: Finalized
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 mb-12">
                <Metric label="Total Impressions" value="1.42M" change="+12%" />
                <Metric label="Conv. Rate" value="3.82%" change="+0.4%" />
                <Metric label="Ad Spend" value="$12,400" change="-5%" />
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Key Strategic Insight
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Instagram remains your highest performing channel for direct ROAS, however TikTok engagement rate has surged by 15% this week. We recommend reallocating 10% of Facebook budget to TikTok short-form content to capture growing upper-funnel interest.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-background border-t flex justify-between items-center px-8">
            <span className="text-xs text-muted-foreground">Viewing Page 1 of 1</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Close</Button>
              <Button className="rounded-xl px-6 bg-primary">
                <Download className="h-4 w-4 mr-2" /> Download Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-[10px] font-bold text-green-500">{change}</span>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <PlanRestrictedPage requiredFeature="customReports" featureDescription="สร้างและดาวน์โหลดรายงานการตลาดแบบกำหนดเอง">
      <ReportsContent />
    </PlanRestrictedPage>
  );
}