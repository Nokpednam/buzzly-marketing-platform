import * as XLSX from "xlsx";

interface ReportMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgRoas: number;
  trendData?: { date: string; impressions: number; clicks: number; spend: number }[];
}

interface PersonaDataForExcel {
  age_distribution: Record<string, number>;
  gender: Record<string, number>;
  top_locations: { name: string; pct: number }[];
  interests: { name: string; pct: number }[];
  device_type: Record<string, number>;
}

export function generateExcelFromReportData(params: {
  reportName: string;
  reportType: string;
  dateRangeLabel?: string;
  metrics?: ReportMetrics | null;
  personaData?: PersonaDataForExcel | null;
  generatedAt: string;
}): ArrayBuffer {
  const { reportName, reportType, dateRangeLabel, metrics, personaData, generatedAt } = params;
  const wb = XLSX.utils.book_new();

  // Summary sheet (all report types)
  const summaryData = [
    ["BUZZLY REPORT"],
    ["Report", reportName],
    ["Type", reportType === "channel" ? "Persona" : reportType],
    ["Generated", generatedAt],
    ...(dateRangeLabel ? [["Date Range", dateRangeLabel]] : []),
    [],
    ["Key Metrics"],
    ["Total Impressions", metrics?.totalImpressions ?? 0],
    ["Total Clicks", metrics?.totalClicks ?? 0],
    ["Total Spend", metrics?.totalSpend ?? 0],
    ["Total Conversions", metrics?.totalConversions ?? 0],
    ["Avg CTR (%)", metrics?.avgCtr?.toFixed(2) ?? "0"],
    ["Avg CPC", metrics?.avgCpc?.toFixed(2) ?? "0"],
    ["ROAS", metrics?.avgRoas?.toFixed(1) ? `${metrics.avgRoas.toFixed(1)}x` : "0"],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Trend data (campaign & roi)
  if (metrics?.trendData && metrics.trendData.length > 0) {
    const trendRows = [
      ["Date", "Impressions", "Clicks", "Spend"],
      ...metrics.trendData.map((d) => [d.date, d.impressions, d.clicks, d.spend]),
    ];
    const wsTrend = XLSX.utils.aoa_to_sheet(trendRows);
    XLSX.utils.book_append_sheet(wb, wsTrend, "Trend Data");
  }

  // Persona data (channel)
  if (reportType === "channel" && personaData) {
    const ageEntries = Object.entries(personaData.age_distribution ?? {});
    if (ageEntries.length > 0) {
      const ageRows = [["Age Group", "Share (%)"], ...ageEntries.map(([k, v]) => [k, Math.round(v * 100)])];
      const wsAge = XLSX.utils.aoa_to_sheet(ageRows);
      XLSX.utils.book_append_sheet(wb, wsAge, "Age Distribution");
    }

    const genderEntries = Object.entries(personaData.gender ?? {});
    if (genderEntries.length > 0) {
      const genderRows = [["Gender", "Share (%)"], ...genderEntries.map(([k, v]) => [k, Math.round(v * 100)])];
      const wsGender = XLSX.utils.aoa_to_sheet(genderRows);
      XLSX.utils.book_append_sheet(wb, wsGender, "Gender");
    }

    if ((personaData.top_locations ?? []).length > 0) {
      const locRows = [
        ["Location", "Share (%)"],
        ...personaData.top_locations.map((l) => [l.name, Math.round(l.pct * 100)]),
      ];
      const wsLoc = XLSX.utils.aoa_to_sheet(locRows);
      XLSX.utils.book_append_sheet(wb, wsLoc, "Geographic Reach");
    }

    if ((personaData.interests ?? []).length > 0) {
      const intRows = [
        ["Interest", "Affinity (%)"],
        ...personaData.interests.map((i) => [i.name, Math.round(i.pct * 100)]),
      ];
      const wsInt = XLSX.utils.aoa_to_sheet(intRows);
      XLSX.utils.book_append_sheet(wb, wsInt, "Interests");
    }

    const deviceEntries = Object.entries(personaData.device_type ?? {});
    if (deviceEntries.length > 0) {
      const deviceRows = [["Device", "Share (%)"], ...deviceEntries.map(([k, v]) => [k, Math.round(v * 100)])];
      const wsDevice = XLSX.utils.aoa_to_sheet(deviceRows);
      XLSX.utils.book_append_sheet(wb, wsDevice, "Device Type");
    }
  }

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

export function generateCsvFromReportData(params: {
  reportName: string;
  reportType: string;
  dateRangeLabel?: string;
  metrics?: ReportMetrics | null;
  personaData?: PersonaDataForExcel | null;
  generatedAt: string;
}): string {
  const { reportName, reportType, dateRangeLabel, metrics, personaData, generatedAt } = params;
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ["BUZZLY REPORT"],
    ["Report", reportName],
    ["Type", reportType === "channel" ? "Persona" : reportType],
    ["Generated", generatedAt],
    ...(dateRangeLabel ? [["Date Range", dateRangeLabel]] : []),
    [],
    ["Key Metrics"],
    ["Total Impressions", metrics?.totalImpressions ?? 0],
    ["Total Clicks", metrics?.totalClicks ?? 0],
    ["Total Spend", metrics?.totalSpend ?? 0],
    ["Total Conversions", metrics?.totalConversions ?? 0],
    ["Avg CTR (%)", metrics?.avgCtr?.toFixed(2) ?? "0"],
    ["Avg CPC", metrics?.avgCpc?.toFixed(2) ?? "0"],
    ["ROAS", metrics?.avgRoas?.toFixed(1) ? `${metrics?.avgRoas?.toFixed(1)}x` : "0"],
  ];

  let csv = "";
  if (metrics?.trendData && metrics.trendData.length > 0) {
    csv += "Trend Data\n";
    csv += "Date,Impressions,Clicks,Spend\n";
    metrics.trendData.forEach((d) => {
      csv += `${d.date},${d.impressions},${d.clicks},${d.spend}\n`;
    });
    csv += "\n";
  }

  csv += "Summary\n";
  summaryData.forEach((row) => {
    csv += row.join(",") + "\n";
  });

  if (reportType === "channel" && personaData) {
    if (Object.keys(personaData.age_distribution ?? {}).length > 0) {
      csv += "\nAge Distribution\nAge Group,Share (%)\n";
      Object.entries(personaData.age_distribution ?? {}).forEach(([k, v]) => {
        csv += `${k},${Math.round(v * 100)}\n`;
      });
    }
    if ((personaData.top_locations ?? []).length > 0) {
      csv += "\nGeographic Reach\nLocation,Share (%)\n";
      personaData.top_locations.forEach((l) => {
        csv += `${l.name},${Math.round(l.pct * 100)}\n`;
      });
    }
  }

  return csv;
}
