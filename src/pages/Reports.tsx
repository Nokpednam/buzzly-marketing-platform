import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";

const reports = [
  {
    id: 1,
    name: "Monthly Performance Summary",
    type: "Performance",
    format: "PDF",
    createdAt: "Nov 25, 2025",
    size: "2.4 MB",
    status: "ready",
  },
  {
    id: 2,
    name: "Q4 Campaign Analysis",
    type: "Campaign",
    format: "Excel",
    createdAt: "Nov 24, 2025",
    size: "5.1 MB",
    status: "ready",
  },
  {
    id: 3,
    name: "Email Marketing Metrics",
    type: "Email",
    format: "PDF",
    createdAt: "Nov 23, 2025",
    size: "1.8 MB",
    status: "ready",
  },
  {
    id: 4,
    name: "Customer Acquisition Report",
    type: "Analytics",
    format: "PDF",
    createdAt: "Nov 22, 2025",
    size: "3.2 MB",
    status: "ready",
  },
  {
    id: 5,
    name: "Social Media Engagement",
    type: "Social",
    format: "Excel",
    createdAt: "Nov 20, 2025",
    size: "4.5 MB",
    status: "ready",
  },
];

const scheduledReports = [
  {
    id: 1,
    name: "Weekly Performance Digest",
    frequency: "Weekly",
    nextRun: "Dec 1, 2025",
    recipients: 3,
  },
  {
    id: 2,
    name: "Monthly Revenue Report",
    frequency: "Monthly",
    nextRun: "Dec 1, 2025",
    recipients: 5,
  },
  {
    id: 3,
    name: "Daily Campaign Status",
    frequency: "Daily",
    nextRun: "Nov 29, 2025",
    recipients: 2,
  },
];

const reportTemplates = [
  {
    id: "campaign",
    name: "Campaign Performance",
    description: "Overview of all campaign metrics",
    icon: BarChart3,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    id: "roi",
    name: "ROI Analysis",
    description: "Detailed return on investment breakdown",
    icon: DollarSign,
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    id: "audience",
    name: "Audience Insights",
    description: "Customer demographics and behavior",
    icon: Users,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "channel",
    name: "Channel Comparison",
    description: "Cross-platform performance analysis",
    icon: Smartphone,
    iconBg: "bg-purple-100 text-purple-600",
  },
];

// Mock preview data per report type
interface ReportPreviewData {
  title: string;
  subtitle: string;
  dateRange: string;
  summaryMetrics: { label: string; value: string; change?: string; changeType?: 'up' | 'down' }[];
  tableData: { name: string; impressions: string; clicks: string; ctr: string; conversions: string; cost: string }[];
  chartData: { name: string; value: number; color: string }[];
}

const previewDataByType: Record<string, ReportPreviewData> = {
  campaign: {
    title: "Campaign Performance Report",
    subtitle: "Overview of all campaign metrics and performance indicators",
    dateRange: "Nov 1 - Nov 30, 2025",
    summaryMetrics: [
      { label: "Total Impressions", value: "1.2M", change: "+12.5%", changeType: "up" },
      { label: "Total Clicks", value: "48,500", change: "+8.3%", changeType: "up" },
      { label: "Average CTR", value: "4.2%", change: "+0.5%", changeType: "up" },
      { label: "Total Conversions", value: "2,450", change: "+15.2%", changeType: "up" },
    ],
    tableData: [
      { name: "Summer Sale 2025", impressions: "450K", clicks: "18,200", ctr: "4.0%", conversions: "890", cost: "฿12,500" },
      { name: "New Product Launch", impressions: "380K", clicks: "15,800", ctr: "4.2%", conversions: "720", cost: "฿10,800" },
      { name: "Brand Awareness", impressions: "220K", clicks: "8,500", ctr: "3.9%", conversions: "450", cost: "฿8,200" },
      { name: "Holiday Special", impressions: "150K", clicks: "6,000", ctr: "4.0%", conversions: "390", cost: "฿6,500" },
    ],
    chartData: [
      { name: "Facebook", value: 35, color: "bg-blue-500" },
      { name: "Instagram", value: 28, color: "bg-pink-500" },
      { name: "TikTok", value: 22, color: "bg-slate-800" },
      { name: "Shopee", value: 15, color: "bg-orange-500" },
    ],
  },
  roi: {
    title: "ROI Analysis Report",
    subtitle: "Detailed return on investment breakdown by channel",
    dateRange: "Nov 1 - Nov 30, 2025",
    summaryMetrics: [
      { label: "Total Revenue", value: "฿180,000", change: "+22.5%", changeType: "up" },
      { label: "Total Cost", value: "฿45,000", change: "-5.2%", changeType: "down" },
      { label: "Net Profit", value: "฿135,000", change: "+28.3%", changeType: "up" },
      { label: "Overall ROI", value: "300%", change: "+15.0%", changeType: "up" },
    ],
    tableData: [
      { name: "Facebook Ads", impressions: "฿48,000", clicks: "฿12,000", ctr: "300%", conversions: "4.0x", cost: "฿125" },
      { name: "Instagram Ads", impressions: "฿52,000", clicks: "฿14,500", ctr: "259%", conversions: "3.6x", cost: "฿142" },
      { name: "TikTok Ads", impressions: "฿45,000", clicks: "฿10,000", ctr: "350%", conversions: "4.5x", cost: "฿98" },
      { name: "Shopee Ads", impressions: "฿35,000", clicks: "฿8,500", ctr: "312%", conversions: "4.1x", cost: "฿115" },
    ],
    chartData: [
      { name: "Facebook", value: 27, color: "bg-blue-500" },
      { name: "Instagram", value: 29, color: "bg-pink-500" },
      { name: "TikTok", value: 25, color: "bg-slate-800" },
      { name: "Shopee", value: 19, color: "bg-orange-500" },
    ],
  },
  audience: {
    title: "Audience Insights Report",
    subtitle: "Customer demographics and behavior analysis",
    dateRange: "Nov 1 - Nov 30, 2025",
    summaryMetrics: [
      { label: "Total Audience", value: "125,000", change: "+18.5%", changeType: "up" },
      { label: "New Users", value: "8,500", change: "+12.3%", changeType: "up" },
      { label: "Avg. Session", value: "4.5 min", change: "+0.8 min", changeType: "up" },
      { label: "Bounce Rate", value: "32%", change: "-3.2%", changeType: "down" },
    ],
    tableData: [
      { name: "18-24 years", impressions: "32,500", clicks: "26%", ctr: "4.8%", conversions: "1,250", cost: "฿8,500" },
      { name: "25-34 years", impressions: "45,000", clicks: "36%", ctr: "4.5%", conversions: "1,890", cost: "฿12,800" },
      { name: "35-44 years", impressions: "28,750", clicks: "23%", ctr: "3.9%", conversions: "980", cost: "฿9,200" },
      { name: "45+ years", impressions: "18,750", clicks: "15%", ctr: "3.2%", conversions: "520", cost: "฿5,500" },
    ],
    chartData: [
      { name: "Bangkok", value: 45, color: "bg-blue-500" },
      { name: "Chiang Mai", value: 18, color: "bg-emerald-500" },
      { name: "Phuket", value: 12, color: "bg-purple-500" },
      { name: "Others", value: 25, color: "bg-slate-400" },
    ],
  },
  channel: {
    title: "Channel Comparison Report",
    subtitle: "Cross-platform performance analysis and benchmarks",
    dateRange: "Nov 1 - Nov 30, 2025",
    summaryMetrics: [
      { label: "Best Platform", value: "Instagram", change: "by ROI", changeType: "up" },
      { label: "Highest CTR", value: "TikTok (5.2%)", change: "+1.2%", changeType: "up" },
      { label: "Lowest CPC", value: "Shopee (฿0.85)", change: "-฿0.12", changeType: "down" },
      { label: "Most Conversions", value: "Shopee (890)", change: "+125", changeType: "up" },
    ],
    tableData: [
      { name: "Facebook", impressions: "420K", clicks: "16,800", ctr: "4.0%", conversions: "680", cost: "฿1.25" },
      { name: "Instagram", impressions: "380K", clicks: "17,100", ctr: "4.5%", conversions: "720", cost: "฿1.18" },
      { name: "TikTok", impressions: "290K", clicks: "15,080", ctr: "5.2%", conversions: "580", cost: "฿0.95" },
      { name: "Shopee", impressions: "310K", clicks: "11,160", ctr: "3.6%", conversions: "890", cost: "฿0.85" },
    ],
    chartData: [
      { name: "Facebook", value: 30, color: "bg-blue-500" },
      { name: "Instagram", value: 27, color: "bg-pink-500" },
      { name: "TikTok", value: 21, color: "bg-slate-800" },
      { name: "Shopee", value: 22, color: "bg-orange-500" },
    ],
  },
};

function ReportsContent() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [previewType, setPreviewType] = useState("");

  const handleOpenGenerate = () => {
    setSelectedReportType("");
    setSelectedDateRange("30d");
    setSelectedFormat("pdf");
    setIsGenerateOpen(true);
  };

  const handleQuickGenerate = (typeId: string) => {
    setPreviewType(typeId);
    setIsPreviewOpen(true);
  };

  const handleGenerateReport = () => {
    setIsGenerateOpen(false);
    toast({
      title: "กำลังสร้าง Report",
      description: `Report จะพร้อมใน 1-2 นาที`,
    });
  };

  const handleDownloadFromPreview = () => {
    setIsPreviewOpen(false);
    toast({
      title: "ดาวน์โหลด Report",
      description: "กำลังดาวน์โหลด Report เป็น PDF",
    });
  };

  const previewData = previewDataByType[previewType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download custom marketing reports
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenGenerate}>
          <Plus className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Quick Report Templates */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Quick Generate</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {reportTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
              onClick={() => handleQuickGenerate(template.id)}
            >
              <CardContent className="p-4">
                <div className={`mb-2 h-10 w-10 rounded-lg ${template.iconBg} flex items-center justify-center`}>
                  <template.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold">{template.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Reports</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.createdAt}
                      </span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{report.type}</Badge>
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Scheduled Reports</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    <Clock className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="secondary">{report.frequency}</Badge>
                      <span>Next: {report.nextRun}</span>
                      <span>{report.recipients} recipients</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign">Campaign Performance</SelectItem>
                  <SelectItem value="roi">ROI Analysis</SelectItem>
                  <SelectItem value="audience">Audience Insights</SelectItem>
                  <SelectItem value="channel">Channel Comparison</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={!selectedReportType}>
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Report Dialog - Document Style */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Report Preview
            </DialogTitle>
          </DialogHeader>
          {previewData && (
            <div className="py-4">
              {/* Document-style Report */}
              <div className="border rounded-lg bg-background shadow-sm">
                {/* Report Header */}
                <div className="border-b p-6 bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{previewData.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{previewData.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">Buzzly Platform</p>
                      <p className="text-xs text-muted-foreground">{previewData.dateRange}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="p-6 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Summary Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewData.summaryMetrics.map((metric, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-lg font-bold text-foreground mt-1">{metric.value}</p>
                        {metric.change && (
                          <p className={`text-xs mt-1 ${metric.changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {metric.change}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="p-6 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Detailed Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                            {previewType === 'roi' ? 'Revenue' : 'Impressions'}
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                            {previewType === 'roi' ? 'Cost' : previewType === 'audience' ? 'Share' : 'Clicks'}
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                            {previewType === 'roi' ? 'ROI' : 'CTR'}
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                            {previewType === 'roi' ? 'ROAS' : 'Conversions'}
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                            {previewType === 'roi' ? 'CAC' : 'Cost/CPC'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.tableData.map((row, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-3 font-medium">{row.name}</td>
                            <td className="py-3 px-3 text-right">{row.impressions}</td>
                            <td className="py-3 px-3 text-right">{row.clicks}</td>
                            <td className="py-3 px-3 text-right">{row.ctr}</td>
                            <td className="py-3 px-3 text-right">{row.conversions}</td>
                            <td className="py-3 px-3 text-right">{row.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    {previewType === 'audience' ? 'Location Distribution' : 'Channel Distribution'}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="h-4 rounded-full overflow-hidden flex">
                        {previewData.chartData.map((item, index) => (
                          <div
                            key={index}
                            className={`${item.color} h-full`}
                            style={{ width: `${item.value}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {previewData.chartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">
                    Generated by Buzzly Platform • {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadFromPreview}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Reports() {
  return (
    <PlanRestrictedPage
      requiredFeature="customReports"
      featureDescription="สร้างและดาวน์โหลดรายงานการตลาดแบบกำหนดเอง"
    >
      <ReportsContent />
    </PlanRestrictedPage>
  );
}
