import { CheckCircle2, Circle, Zap, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLoyaltyMissions } from '@/hooks/useLoyaltyMissions';

// Map action_type → icon emoji for visual variety
const missionIcons: Record<string, string> = {
  create_workspace: '🏗️',
  connect_api:      '🔌',
  upgrade_plan:     '⭐',
  create_campaign:  '🚀',
};

export function LoyaltyMissionsList() {
  const {
    missions,
    loading,
    completedCount,
    totalMissions,
    totalPoints,
    earnedPoints,
  } = useLoyaltyMissions();

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const overallProgress = totalPoints > 0
    ? Math.round((earnedPoints / totalPoints) * 100)
    : 0;


  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Mission Board
            </CardTitle>
            <CardDescription className="mt-0.5">
              Complete missions to earn points and level up your tier
            </CardDescription>
          </div>
          {/* Summary badge */}
          <div className="text-right">
            <p className="text-2xl font-bold leading-none">
              {earnedPoints}
              <span className="text-sm font-normal text-muted-foreground"> / {totalPoints} pts</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {totalMissions} complete
            </p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1 pt-2">
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{overallProgress}%</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition-all duration-300',
              mission.isCompleted
                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                : 'bg-muted/30 border-border hover:border-primary/40 hover:bg-muted/50'
            )}
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {mission.isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/40" />
              )}
            </div>

            {/* Mission icon + label */}
            <div className="text-xl flex-shrink-0 select-none">
              {missionIcons[mission.action_type] ?? '🎯'}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium text-sm leading-tight',
                  mission.isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {mission.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mission.isCompleted ? 'Completed ✓' : 'To do'}
              </p>
            </div>

            {/* Points badge */}
            <Badge
              className={cn(
                'shrink-0 font-bold text-xs px-3 py-1 flex items-center gap-1',
                mission.isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              )}
              variant="outline"
            >
              <Zap className="h-3 w-3" />
              +{mission.points_awarded} pts
            </Badge>
          </div>
        ))}

        {missions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No missions available right now.
          </div>
        )}

        {/* All done state */}
        {completedCount > 0 && completedCount === totalMissions && (
          <div className="mt-2 rounded-xl bg-gradient-to-r from-yellow-500/10 to-emerald-500/10 border border-yellow-500/20 p-4 text-center">
            <p className="text-sm font-bold">🎉 All missions complete!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You've earned all {totalPoints} available points. You're a pro!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
