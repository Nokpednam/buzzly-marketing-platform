import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import type { TeamPermissions } from "@/hooks/useTeamManagement";

interface TeamPermissionsGuardProps {
  children: ReactNode;
  permission: keyof TeamPermissions;
  fallbackTo?: string;
}

/**
 * Guards a route by checking if the user has the required permission.
 * Redirects to fallbackTo (default /dashboard) if permission is missing.
 */
export function TeamPermissionsGuard({
  children,
  permission,
  fallbackTo = "/dashboard",
}: TeamPermissionsGuardProps) {
  const { canAccess, isLoading } = useTeamPermissions();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!canAccess(permission)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
