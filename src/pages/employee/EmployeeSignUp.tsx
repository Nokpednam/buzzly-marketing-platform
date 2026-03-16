import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, Briefcase, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { auditSecurity } from "@/lib/auditLogger";

export default function EmployeeSignUp() {
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

    const handleNext = async () => {
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

            setLoading(true);
            const { data: existingCustomer } = await supabase
                .from("customer")
                .select("id")
                .ilike("email", formData.email.trim())
                .maybeSingle();

            if (existingCustomer) {
                setLoading(false);
                toast({
                    title: "ไม่สามารถใช้เมลนี้ได้",
                    description: "Email นี้เคยสมัครเป็นลูกค้าแล้ว กรุณาใช้ Email อื่นในการสมัครพนักงาน",
                    variant: "destructive",
                });
                return;
            }
            setLoading(false);
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
            const redirectUrl = `${window.location.origin}/employee/login`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        is_employee_signup: true,
                        aptitude: formData.aptitude,
                        birthday: formData.birthday,
                    },
                },
            });

            if (authError) {
                if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
                    toast({
                        title: "อีเมลนี้เคยสมัครสมาชิกไปแล้ว",
                        description: "มีบัญชีของคุณในระบบอยู่ก่อนแล้ว กรุณากลับไปที่หน้าเข้าสู่ระบบ",
                        variant: "default",
                    });

                    setTimeout(() => {
                        navigate("/employee/login", { replace: true });
                    }, 2000);
                    return;
                }

                throw authError;
            }

            if (authData.user) {
                try {
                    await auditSecurity.employeeRegistered(
                        authData.user.id,
                        formData.email,
                        `${formData.firstName} ${formData.lastName}`.trim() || formData.email
                    );

                    // Check if the user was pre-added and thus already approved
                    const { data: employeeData } = await supabase
                        .from("employees")
                        .select("approval_status")
                        .eq("user_id", authData.user.id)
                        .maybeSingle();

                    if (employeeData?.approval_status === "approved") {
                        toast({
                            title: "ลงทะเบียนสำเร็จและเชื่อมต่อบัญชีแล้ว!",
                            description: "ยินดีต้อนรับ! บัญชีของคุณได้รับการยืนยันตัวตนพนักงานแล้ว สามารถเข้าใช้งานได้ทันที",
                        });
                    } else {
                        toast({
                            title: "ลงทะเบียนสำเร็จ!",
                            description: "บัญชีของคุณได้รับการตั้งค่าเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้บริหาร",
                        });
                    }

                    await supabase.auth.signOut();

                    setTimeout(() => {
                        navigate("/employee/login", { replace: true });
                    }, 2000);
                } catch (employeeError: any) {
                    throw new Error(employeeError.message || "เกิดข้อผิดพลาดหลังการสมัคร");
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
                                            placeholder="employee@buzzly.co"
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
                                        <strong>หมายเหตุ:</strong> บัญชีพนักงานจะต้องได้รับการอนุมัติก่อนเข้าใช้งาน (กรณีที่คุณได้รับเชิญจาก Admin แล้ว บัญชีจะเชื่อมต่อและอนุมัติให้อัตโนมัติหลังสมัคร)
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
                            <Link to="/employee/login" className="text-primary hover:underline font-medium">
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
