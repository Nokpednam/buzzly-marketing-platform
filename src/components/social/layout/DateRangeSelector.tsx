import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

export function DateRangeSelector() {
  const { dateRange, setDateRange } = useSocialFilters();

  return (
    <Select value={dateRange} onValueChange={setDateRange}>
      <SelectTrigger className="h-10 w-[160px] rounded-lg border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Calendar className="mr-2 h-4 w-4 text-slate-500" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 วันที่ผ่านมา</SelectItem>
        <SelectItem value="30">30 วันที่ผ่านมา</SelectItem>
        <SelectItem value="90">90 วันที่ผ่านมา</SelectItem>
      </SelectContent>
    </Select>
  );
}
