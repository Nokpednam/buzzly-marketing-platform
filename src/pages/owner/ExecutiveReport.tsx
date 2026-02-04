import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Presentation,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Available metrics to include in report
const availableMetrics = [
  { id: "mrr", label: "Monthly Recurring Revenue (MRR)", category: "Revenue" },
  { id: "arr", label: "Annual Recurring Revenue (ARR)", category: "Revenue" },
  { id: "clv", label: "Customer Lifetime Value (CLV)", category: "Revenue" },
  { id: "churn", label: "Churn Rate", category: "Growth" },
  { id: "nrr", label: "Net Revenue Retention", category: "Growth" },
  { id: "growth", label: "Month-over-Month Growth", category: "Growth" },
  { id: "nps", label: "Net Promoter Score (NPS)", category: "Customer" },
  { id: "csat", label: "Customer Satisfaction Score", category: "Customer" },
  { id: "dau", label: "Daily Active Users", category: "Engagement" },
  { id: "mau", label: "Monthly Active Users", category: "Engagement" },
  { id: "retention", label: "User Retention Rate", category: "Engagement" },
  { id: "funnel", label: "AARRR Funnel Metrics", category: "Product" },
  { id: "features", label: "Feature Usage Stats", category: "Product" },
];

// Recent reports
const recentReports = [
  {
    id: 1,
    name: "Q4 2024 Executive Summary",
    date: "Dec 1, 2024",
    format: "PDF",
    status: "completed",
  },
  {
    id: 2,
    name: "November Performance Review",
    date: "Nov 30, 2024",
    format: "Slides",
    status: "completed",
  },
  {
    id: 3,
    name: "Investor Update - November",
    date: "Nov 28, 2024",
    format: "PDF",
    status: "completed",
  },
  {
    id: 4,
    name: "Weekly Metrics Report",
    date: "Nov 25, 2024",
    format: "Excel",
    status: "completed",
  },
];

// Scheduled reports
const scheduledReports = [
  {
    id: 1,
    name: "Weekly Performance Summary",
    frequency: "Weekly",
    nextRun: "Every Monday, 9:00 AM",
    recipients: 3,
  },
  {
    id: 2,
    name: "Monthly Executive Report",
    frequency: "Monthly",
    nextRun: "1st of each month, 8:00 AM",
    recipients: 5,
  },
];

export default function ExecutiveReport() {
  const { toast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "mrr",
    "churn",
    "nps",
    "mau",
  ]);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("last-month");

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: `Creating ${reportFormat.toUpperCase()} report with ${selectedMetrics.length} metrics...`,
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Report Scheduled",
      description: "Your report has been scheduled successfully.",
    });
  };

  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Executive Report</h1>
        <p className="text-muted-foreground">
          Generate and export reports for stakeholders
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Metrics Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Select Metrics</CardTitle>
                <CardDescription>
                  Choose the metrics to include in your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedMetrics).map(([category, metrics]) => (
                    <div key={category}>
                      <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                        {category}
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {metrics.map((metric) => (
                          <div
                            key={metric.id}
                            className="flex items-center space-x-3 rounded-lg border p-3"
                          >
                            <Checkbox
                              id={metric.id}
                              checked={selectedMetrics.includes(metric.id)}
                              onCheckedChange={() => handleMetricToggle(metric.id)}
                            />
                            <Label
                              htmlFor={metric.id}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {metric.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Configuration */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="last-quarter">Last Quarter</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={reportFormat} onValueChange={setReportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            PDF Document
                          </div>
                        </SelectItem>
                        <SelectItem value="slides">
                          <div className="flex items-center gap-2">
                            <Presentation className="h-4 w-4" />
                            Presentation Slides
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel Spreadsheet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleGenerateReport}
                      disabled={selectedMetrics.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleScheduleReport}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selected Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMetrics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No metrics selected
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedMetrics.map((id) => {
                        const metric = availableMetrics.find((m) => m.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {metric?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {report.format === "PDF" && (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                        {report.format === "Slides" && (
                          <Presentation className="h-5 w-5 text-primary" />
                        )}
                        {report.format === "Excel" && (
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                          <Badge variant="secondary">{report.format}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Automatically generated reports
                </CardDescription>
              </div>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                New Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{report.frequency}</Badge>
                          <span>{report.nextRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">{report.recipients}</p>
                        <p className="text-muted-foreground">recipients</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
