import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import type { TeamPermissions } from "@/hooks/useTeamManagement";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface TeamPermissionsGuardProps {
  children: ReactNode;
  permission: keyof TeamPermissions;
  fallbackTo?: string;
}

/**
 * Guards a route by checking if the user has the required permission.
 * Redirects to fallbackTo (default /dashboard) if permission is missing.
 * Avoids redirect loop when fallbackTo === current path or when query errors.
 */
export function TeamPermissionsGuard({
  children,
  permission,
  fallbackTo = "/dashboard",
}: TeamPermissionsGuardProps) {
  const location = useLocation();
  const { canAccess, isLoading, isError, refetch } = useTeamPermissions();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Avoid redirect loop: if we'd redirect to the same path, show error/retry instead
  const wouldRedirectToSelf = location.pathname === fallbackTo || location.pathname.startsWith(`${fallbackTo}/`);

  if (isError && wouldRedirectToSelf) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-center text-sm font-medium text-foreground">
          ไม่สามารถโหลดสิทธิ์การเข้าถึงได้
        </p>
        <p className="text-center text-xs text-muted-foreground max-w-sm">
          กรุณาลองรีเฟรชหรือตรวจสอบการเชื่อมต่อ
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  if (!canAccess(permission) && !wouldRedirectToSelf) {
    return <Navigate to={fallbackTo} replace />;
  }

  // When canAccess is false but would redirect to self (query failed / permissions null),
  // fail open to avoid infinite redirect loop
  return <>{children}</>;
}
