import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, Briefcase, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { auditSecurity } from "@/lib/auditLogger";

export default function AdminSignUp() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1 - Account
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2 - Profile
    firstName: "",
    lastName: "",
    aptitude: "",
    birthday: "",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "กรุณากรอกข้อมูลให้ครบ",
          description: "Email และ Password จำเป็นต้องกรอก",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: "รหัสผ่านไม่ถูกต้อง",
          description: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "รหัสผ่านไม่ตรงกัน",
          description: "กรุณากรอกรหัสผ่านให้ตรงกัน",
          variant: "destructive",
        });
        return;
      }

      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ชื่อและนามสกุลจำเป็นต้องกรอก",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin/login`;

      // 1. Try to Sign Up (for new users)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            // Employee specific metadata
            is_employee_signup: true,
            aptitude: formData.aptitude,
            birthday: formData.birthday,
          },
        },
      });

      if (authError) {
        // 2. Handle Existing Users
        if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
          // Attempt to Sign In to verify ownership
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            throw new Error("อีเมลนี้มีอยู่ในระบบแล้ว แต่รหัสผ่านไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการเข้าสู่ระบบ");
          }

          if (signInData.user) {
            // Check if already has an employee record
            const { data: existingEmployee } = await supabase
              .from('employees')
              .select('id, approval_status')
              .eq('user_id', signInData.user.id)
              .maybeSingle();

            if (existingEmployee) {
              toast({
                title: "ลงทะเบียนแล้ว",
                description: `สถานะบัญชีของคุณคือ: ${existingEmployee.approval_status || 'ไม่ระบุ'}`,
              });
              await supabase.auth.signOut();
              navigate("/admin/login");
              return;
            }

            // Get default Employee role
            const { data: defaultRole } = await supabase
              .from('role_employees')
              .select('id')
              .ilike('role_name', 'employee')
              .limit(1)
              .single();

            // create employee record manually (RLS policy allows this for authenticated user)
            const { data: newEmployee, error: insertError } = await supabase
              .from('employees')
              .insert({
                user_id: signInData.user.id,
                email: formData.email,
                status: 'active',
                approval_status: 'pending',
                role_employees_id: defaultRole?.id || null,
              })
              .select()
              .single(); // Use .single() to get the inserted row

            if (insertError) throw insertError;

            if (newEmployee) {
              // Create profile
              const { error: profileError } = await supabase
                .from('employees_profile')
                .insert({
                  employees_id: newEmployee.id,
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  aptitude: formData.aptitude,
                  birthday_at: formData.birthday ? formData.birthday : null,
                });

              if (profileError) {
                console.error("Error creating profile:", profileError);
                // continue mostly success
              }
            }

            // Log employee registration (existing user)
            await auditSecurity.employeeRegistered(
              signInData.user.id,
              formData.email,
              `${formData.firstName} ${formData.lastName}`.trim() || formData.email
            );

            toast({
              title: "ลงทะเบียนสำเร็จ!",
              description: "ส่งคำขอเป็นพนักงานเรียบร้อยแล้ว รอการอนุมัติจาก Admin",
            });

            await supabase.auth.signOut();
            setTimeout(() => {
              navigate("/admin/login", { replace: true });
            }, 1000);
            return;
          }
        }

        throw authError; // Throw other errors
      }

      // 3. Success for New User - Manually create employee record
      if (authData.user) {
        try {
          // Get default Employee role
          const { data: defaultRole } = await supabase
            .from('role_employees')
            .select('id')
            .ilike('role_name', 'employee')
            .limit(1)
            .single();

          // Create employee record manually (trigger may fail silently)
          const { data: newEmployee, error: insertError } = await supabase
            .from('employees')
            .insert({
              user_id: authData.user.id,
              email: formData.email,
              status: 'active',
              approval_status: 'pending',
              role_employees_id: defaultRole?.id || null,
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating employee:", insertError);
            throw new Error(`ไม่สามารถสร้างบัญชี employee: ${insertError.message}`);
          }

          if (newEmployee) {
            // Create employee profile
            const { error: profileError } = await supabase
              .from('employees_profile')
              .insert({
                employees_id: newEmployee.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                aptitude: formData.aptitude,
                birthday_at: formData.birthday ? formData.birthday : null,
              });

            if (profileError) {
              console.error("Error creating profile:", profileError);
              // Continue - profile creation is not critical
            }
          }

          // Log employee registration
          await auditSecurity.employeeRegistered(
            authData.user.id,
            formData.email,
            `${formData.firstName} ${formData.lastName}`.trim() || formData.email
          );

          toast({
            title: "ลงทะเบียนสำเร็จ!",
            description: "บัญชีของคุณอยู่ระหว่างรอการอนุมัติจาก Admin กรุณารอการยืนยัน",
          });

          await supabase.auth.signOut();

          setTimeout(() => {
            navigate("/admin/login", { replace: true });
          }, 1000);
        } catch (employeeError: any) {
          // If employee creation fails, clean up the auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(employeeError.message || "ไม่สามารถสร้างบัญชี employee ได้");
        }
      }
    } catch (error: any) {
      toast({
        title: "ลงทะเบียนไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">สมัครเป็น Employee</CardTitle>
          <CardDescription>
            ขั้นตอนที่ {step} จาก 2 - {step === 1 ? "ข้อมูลบัญชี" : "ข้อมูลส่วนตัว"}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 2 ? handleSignUp : (e) => e.preventDefault()}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@buzzly.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-9"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">อย่างน้อย 8 ตัวอักษร</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยัน Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-9"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleNext} className="w-full">
                  ถัดไป
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Profile Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">ชื่อ</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="สมชาย"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-9"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">นามสกุล</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="ใจดี"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptitude">ความถนัด / ตำแหน่ง</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="aptitude"
                      type="text"
                      placeholder="Developer, Support, etc."
                      value={formData.aptitude}
                      onChange={(e) => setFormData({ ...formData, aptitude: e.target.value })}
                      className="pl-9"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">วันเกิด</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="pl-9"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                  <p className="text-amber-800 dark:text-amber-200">
                    <strong>หมายเหตุ:</strong> หลังจากลงทะเบียน บัญชีของคุณจะรอการอนุมัติจาก Admin ก่อนจึงจะสามารถเข้าใช้งานได้
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับ
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังสมัคร...
                      </>
                    ) : (
                      "สมัครสมาชิก"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              มีบัญชีอยู่แล้ว?{" "}
              <Link to="/admin/login" className="text-primary hover:underline font-medium">
                เข้าสู่ระบบ
              </Link>
            </p>
            <p className="text-muted-foreground">
              ต้องการสมัครเป็นลูกค้า?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                สมัครเป็น Customer
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
