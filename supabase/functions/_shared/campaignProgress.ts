/**
 * Shared campaign progress calculator.
 * Used by:
 *   - campaign-auto-stop edge function (Deno)
 *   - src/hooks/useCampaigns.tsx (browser, same logic re-exported)
 *
 * Formula:
 *   overall = (kpiProgress * 0.5) + (timeProgress * 0.5)
 *   → 100% ONLY when BOTH kpi and time individually reach 100%.
 */

export interface ProgressInput {
  start_date:          string | null;
  end_date:            string | null;
  target_kpi_metric:   string | null;
  target_kpi_value:    number | null;
  clicks:              number;
  spend:               number;
  conversions:         number;
  impressions:         number;
}

export interface ProgressResult {
  timeProgress:    number; // 0-100, based purely on elapsed time
  kpiProgress:     number; // 0-100, how close we are to the target KPI
  overallProgress: number; // 0-100, the combined score
  kpiLabel:        string; // human-readable metric name
  kpiActual:       number; // the current raw KPI value
  kpiTarget:       number; // the target raw KPI value
}

const KPI_MAP: Record<string, { label: string; key: keyof ProgressInput }> = {
  clicks:      { label: "Clicks",      key: "clicks" },
  spend:       { label: "Spend",       key: "spend" },
  conversions: { label: "Conversions", key: "conversions" },
  impressions: { label: "Impressions", key: "impressions" },
};

export function calculateCampaignProgress(
  input: ProgressInput,
  /** Override "now" for testing. Defaults to Date.now(). */
  nowMs?: number,
): ProgressResult {
  const now = nowMs ?? Date.now();

  // ── Time progress ──────────────────────────────────────────────────────────
  const start = input.start_date ? new Date(input.start_date).getTime() : null;
  const end   = input.end_date   ? new Date(input.end_date).getTime()   : null;

  let timeProgress = 0;
  if (start !== null && end !== null && end > start) {
    if (now >= end)      timeProgress = 100;
    else if (now > start) timeProgress = Math.min(100, Math.round(((now - start) / (end - start)) * 100));
  }

  // ── KPI progress ───────────────────────────────────────────────────────────
  const kpiTarget = input.target_kpi_value ?? 0;
  const kpiDef    = input.target_kpi_metric ? KPI_MAP[input.target_kpi_metric] : null;
  const kpiActual = kpiDef ? (input[kpiDef.key] as number) : 0;
  const kpiLabel  = kpiDef?.label ?? "No KPI set";

  const kpiProgress = kpiTarget > 0
    ? Math.min(100, Math.round((kpiActual / kpiTarget) * 100))
    : 0;

  // ── Overall ────────────────────────────────────────────────────────────────
  const overallProgress = Math.round((kpiProgress * 0.5) + (timeProgress * 0.5));

  return { timeProgress, kpiProgress, overallProgress, kpiLabel, kpiActual, kpiTarget };
}
