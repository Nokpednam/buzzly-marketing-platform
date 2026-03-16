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
      <SelectTrigger className="h-10 w-[180px] rounded-xl border-border/40 bg-muted/30">
        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="30">Last 30 days</SelectItem>
        <SelectItem value="90">Last 90 days</SelectItem>
      </SelectContent>
    </Select>
  );
}
