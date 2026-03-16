import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduledPostCard } from "@/components/social/planner/ScheduledPostCard";
import type { UnifiedCalendarDay, CalendarItem } from "@/hooks/useUnifiedCalendar";

type FilterType = "all" | "post" | "ad";

interface ContentCalendarProps {
  calendarDays: UnifiedCalendarDay[];
  isLoading: boolean;
  onDayClick: (dateISO: string) => void;
  onItemClick: (item: CalendarItem) => void;
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_LABELS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "post", label: "Posts" },
  { value: "ad", label: "Ads" },
];

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  const d = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7));
  }
  return rows;
}

function LoadingSkeleton() {
  return (
    <Card className="bento-card overflow-hidden">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentCalendar({
  calendarDays,
  isLoading,
  onDayClick,
  onItemClick,
  viewYear,
  viewMonth,
  onViewChange,
}: ContentCalendarProps) {
  const today = new Date();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const itemsByDate = new Map<string, CalendarItem[]>(
    calendarDays.map((day) => [
      day.date,
      activeFilter === "all"
        ? day.items
        : day.items.filter((item) => item.type === activeFilter),
    ])
  );

  const rows = buildCalendarGrid(viewYear, viewMonth);

  const goPrev = () => {
    if (viewMonth === 0) {
      onViewChange(viewYear - 1, 11);
    } else {
      onViewChange(viewYear, viewMonth - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      onViewChange(viewYear + 1, 0);
    } else {
      onViewChange(viewYear, viewMonth + 1);
    }
  };

  const goToday = () => {
    onViewChange(today.getFullYear(), today.getMonth());
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <Card className="bento-card overflow-hidden">
      <CardHeader className="pb-3 px-6 pt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="h-8 w-8 rounded-lg hover:bg-muted/60"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <h2 className="text-base font-semibold tabular-nums min-w-[11rem] text-center text-foreground">
              {MONTH_LABELS[viewMonth]} {viewYear}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="h-8 w-8 rounded-lg hover:bg-muted/60"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="rounded-xl text-xs font-medium border-border/40"
          >
            Today
          </Button>
        </div>

        {/* Filter toggle — Linear pill */}
        <div className="flex items-center gap-0.5 self-start rounded-xl bg-muted/40 p-0.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                activeFilter === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[11px] font-bold text-foreground/70 uppercase tracking-wide py-1"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {rows.map((row, ri) =>
            row.map((day, ci) => {
              if (day === null) {
                return <div key={`${ri}-${ci}`} className="min-h-[7rem]" />;
              }

              const dateISO = toISODate(viewYear, viewMonth, day);
              const dayItems = itemsByDate.get(dateISO) ?? [];
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              const isPast = isPastDate(viewYear, viewMonth, day);
              const canCreate = !isPast;

              return (
                <div
                  key={dateISO}
                  className={cn(
                    "group relative min-h-[7rem] rounded-lg border p-2 flex flex-col gap-1 transition-colors",
                    "border-border/40 hover:bg-muted/20",
                    isToday && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between shrink-0">
                    <span
                      className={cn(
                        "text-xs font-semibold leading-none w-5 h-5 flex items-center justify-center rounded-full",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/75"
                      )}
                    >
                      {day}
                    </span>
                    {canCreate && dayItems.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => onDayClick(dateISO)}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-foreground/60 opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
                        aria-label={`Add post ${dateISO}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>

                  {dayItems.length === 0 ? (
                    canCreate ? (
                      <button
                        type="button"
                        onClick={() => onDayClick(dateISO)}
                        className="flex flex-1 min-h-[4rem] items-center justify-center rounded-md text-foreground/35 opacity-0 transition-all hover:bg-muted/20 group-hover:opacity-100"
                        aria-label={`Add post ${dateISO}`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-foreground/25 group-hover:border-primary/40 group-hover:text-primary/70">
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>
                    ) : (
                      <div className="flex flex-1 min-h-[4rem]" aria-hidden />
                    )
                  ) : (
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayItems.slice(0, 3).map((item) => (
                      <ScheduledPostCard
                        key={item.id}
                        item={item}
                        onClick={onItemClick}
                      />
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[10px] text-foreground/70 px-1">
                        +{dayItems.length - 3} more
                      </span>
                    )}
                  </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
