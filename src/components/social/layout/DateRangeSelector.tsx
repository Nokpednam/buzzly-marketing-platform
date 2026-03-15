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
      <SelectTrigger className="w-[140px] bg-background border-none shadow-sm ring-1 ring-border">
        <Calendar className="h-4 w-4 mr-2 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 Days</SelectItem>
        <SelectItem value="30">Last 30 Days</SelectItem>
        <SelectItem value="90">Last 90 Days</SelectItem>
      </SelectContent>
    </Select>
  );
}
