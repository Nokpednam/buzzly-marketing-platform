import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is an employee
      const { data: employeeData } = await supabase
        .from("employees")
        .select(`
          id,
          status,
          approval_status,
          role_employees_id,
          role_employees (
            role_name
          )
        `)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!employeeData) {
        // Not an employee - check old user_roles table for backwards compatibility
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .in("role", ["admin", "owner"]);

        if (!roleData || roleData.length === 0) {
          // Regular customer - redirect to customer dashboard
          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: "กำลังนำไปยัง Dashboard...",
          });
          navigate("/dashboard");
          return;
        }

        // Has old role - redirect accordingly
        const isOwner = roleData.some(r => r.role === "owner");
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: `ยินดีต้อนรับ ${isOwner ? "Owner" : "Admin"}!`,
        });
        navigate(isOwner ? "/owner/product-usage" : "/admin/monitor");
        return;
      }

      // Check approval status
      if (employeeData.approval_status === "pending") {
        await supabase.auth.signOut();
        toast({
          title: "รอการอนุมัติ",
          description: "บัญชีของคุณอยู่ระหว่างรอการอนุมัติจาก Admin",
          variant: "destructive",
        });
        return;
      }

      if (employeeData.approval_status === "rejected") {
        await supabase.auth.signOut();
        toast({
          title: "ถูกปฏิเสธ",
          description: "การสมัครของคุณถูกปฏิเสธ กรุณาติดต่อ Admin",
          variant: "destructive",
        });
        return;
      }

      if (employeeData.status !== "active") {
        await supabase.auth.signOut();
        toast({
          title: "บัญชีถูกระงับ",
          description: "บัญชีของคุณถูกระงับ กรุณาติดต่อ Admin",
          variant: "destructive",
        });
        return;
      }

      const roleName = (employeeData.role_employees as any)?.role_name;
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: `ยินดีต้อนรับ ${roleName || "Employee"}!`,
      });

      // Redirect based on role
      if (roleName === "owner") {
        navigate("/owner/product-usage");
      } else {
        navigate("/admin/monitor");
      }
    } catch (error: any) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Employee Login</CardTitle>
          <CardDescription>เข้าสู่ระบบสำหรับพนักงาน Buzzly</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@buzzly.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link to="/admin/signup" className="text-primary hover:underline font-medium">
                สมัครเป็น Employee
              </Link>
            </p>
            <p className="text-muted-foreground">
              เป็นลูกค้า?{" "}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Customer Login
              </Link>
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              กลับหน้าหลัก
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
