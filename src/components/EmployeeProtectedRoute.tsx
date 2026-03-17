import { Navigate, useLocation } from "react-router-dom";
import { useEmployeeAuth, EmployeeRole } from "@/hooks/useEmployeeAuth";

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: EmployeeRole[];
}

export function EmployeeProtectedRoute({
  children,
  allowedRoles = ["owner", "admin", "dev", "support"]
}: EmployeeProtectedRouteProps) {
  const { user, session, isEmployee, employeeRole, approvalStatus, loading } = useEmployeeAuth();
  const location = useLocation();

  const loginPage = "/employee/login";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in - redirect to appropriate login page
  if (!user || !session) {
    return <Navigate to={loginPage} replace />;
  }

  // Check if pending approval
  if (approvalStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">รอการอนุมัติ</h1>
          <p className="text-muted-foreground">
            บัญชีของคุณอยู่ระหว่างรอการอนุมัติจาก Dev/Admin กรุณารอการยืนยัน
          </p>
          <button
            onClick={() => window.location.href = loginPage}
            className="text-primary hover:underline"
          >
            กลับหน้า Login
          </button>
        </div>
      </div>
    );
  }

  // Check if rejected
  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">ถูกปฏิเสธ</h1>
          <p className="text-muted-foreground">
            การสมัครของคุณถูกปฏิเสธ กรุณาติดต่อ Admin สำหรับข้อมูลเพิ่มเติม
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="text-primary hover:underline"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Not an employee - redirect to customer dashboard
  if (!isEmployee) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if role is allowed
  if (employeeRole && !allowedRoles.includes(employeeRole)) {
    // Owner goes to owner panel
    if (employeeRole === "owner") {
      return <Navigate to="/owner/dashboard" replace />;
    }
    // Other roles: support goes to support panel, dev goes to dev panel
    if (employeeRole === "dev") {
      return <Navigate to="/dev/monitor" replace />;
    }
    if (employeeRole === "support") {
      return <Navigate to="/support/workspaces" replace />;
    }
    return <Navigate to="/dev/monitor" replace />;
  }

  return <>{children}</>;
}
