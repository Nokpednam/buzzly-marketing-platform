import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, Loader2, Mail, Lock, User as UserIcon, Phone } from "lucide-react";
import BuzzlyLogo from "@/components/BuzzlyLogo";
import authBackground from "@/assets/auth-background.png";

interface Gender {
  id: string;
  name_gender: string;
}

const SALARY_RANGES = [
  "ต่ำกว่า 15,000 บาท",
  "15,000 - 30,000 บาท",
  "30,001 - 50,000 บาท",
  "50,001 - 80,000 บาท",
  "80,001 - 120,000 บาท",
  "มากกว่า 120,000 บาท",
];

const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genders, setGenders] = useState<Gender[]>([]);

  // Form data mapped to profile_customers table
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Personal Info
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    // Step 3: Additional Info
    genderId: "",
    salaryRange: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch genders from database
  useEffect(() => {
    const fetchGenders = async () => {
      const { data, error } = await supabase
        .from("genders")
        .select("id, name_gender")
        .order("name_gender");

      if (error) {
        console.error("Error fetching genders:", error);
      } else {
        setGenders(data || []);
      }
    };

    fetchGenders();
  }, []);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = "กรุณากรอกอีเมล";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      }

      if (!formData.password) {
        newErrors.password = "กรุณากรอกรหัสผ่าน";
      } else if (formData.password.length < 8) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      }
    }

    if (step === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "กรุณากรอกชื่อ";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "กรุณากรอกนามสกุล";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Auto-generate display name if empty when leaving step 2
      if (currentStep === 2 && !formData.displayName) {
        setFormData(prev => ({
          ...prev,
          displayName: `${prev.firstName} ${prev.lastName}`.trim()
        }));
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      // 1. Create auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: formData.displayName || `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("อีเมลนี้ถูกใช้งานแล้ว");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        const activeSession = data.session;

        if (activeSession) {
          // 2. Update profile_customers with all form data
          const { error: customerError } = await supabase
            .from("profile_customers")
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
              display_name: formData.displayName || `${formData.firstName} ${formData.lastName}`,
              phone: formData.phone || null,
              gender_id: formData.genderId || null,
              salary_range: formData.salaryRange || null,
              email: formData.email,
            })
            .eq("user_id", data.user.id);

          if (customerError) {
            console.error("Error updating profile_customers:", customerError);
            // Don't block signup, just log the error
          }

          toast.success("สมัครสมาชิกสำเร็จ!");
          navigate("/dashboard");
        } else {
          // Email confirmation required
          toast.success("กรุณาตรวจสอบอีเมลเพื่อยืนยันการสมัครสมาชิก");
          navigate("/auth");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ *</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="ชื่อจริง"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล *</Label>
                <Input
                  id="lastName"
                  placeholder="นามสกุล"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">ชื่อที่แสดง (ไม่บังคับ)</Label>
              <Input
                id="displayName"
                placeholder={`${formData.firstName || "ชื่อ"} ${formData.lastName || "นามสกุล"}`}
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                หากไม่กรอก จะใช้ชื่อ-นามสกุลแทน
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ (ไม่บังคับ)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0xx-xxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gender">เพศ (ไม่บังคับ)</Label>
              <Select
                value={formData.genderId}
                onValueChange={(value) => handleInputChange("genderId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเพศ" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender.id} value={gender.id}>
                      {gender.name_gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange">ช่วงรายได้ (ไม่บังคับ)</Label>
              <Select
                value={formData.salaryRange}
                onValueChange={(value) => handleInputChange("salaryRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกช่วงรายได้" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 mt-6">
              <h4 className="font-medium mb-2">สรุปข้อมูล</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">อีเมล:</span> {formData.email}</p>
                <p><span className="font-medium text-foreground">ชื่อ-นามสกุล:</span> {formData.firstName} {formData.lastName}</p>
                {formData.displayName && (
                  <p><span className="font-medium text-foreground">ชื่อที่แสดง:</span> {formData.displayName}</p>
                )}
                {formData.phone && (
                  <p><span className="font-medium text-foreground">เบอร์โทร:</span> {formData.phone}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "สร้างบัญชี";
      case 2:
        return "ข้อมูลส่วนตัว";
      case 3:
        return "ข้อมูลเพิ่มเติม";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "กรอกอีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ";
      case 2:
        return "บอกเราเกี่ยวกับตัวคุณ";
      case 3:
        return "ข้อมูลเพิ่มเติมเพื่อประสบการณ์ที่ดีขึ้น";
      default:
        return "";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${authBackground})` }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <Card className="w-full max-w-md relative z-10 border-0 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <BuzzlyLogo />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>

          <Progress value={progress} className="h-1" />

          <div className="text-center">
            <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                ย้อนกลับ
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
              >
                ถัดไป
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสมัคร...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    สมัครสมาชิก
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
