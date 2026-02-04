import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const dates = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function ScheduleCalendar() {
  const activeDates = [8, 9, 10];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Schedule Campaign</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">March 2025</span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {dates.slice(0, 7).map((date) => (
            <button
              key={date}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-colors",
                activeDates.includes(date)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {date}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
