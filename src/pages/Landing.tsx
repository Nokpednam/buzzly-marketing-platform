import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  GitCompareArrows, 
  Share2, 
  TrendingUp, 
  LogIn, 
  UserPlus,
  Route,
  ChevronDown,
  Globe,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import authBackground from "@/assets/auth-background.png";

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkRoleAndRedirect(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          checkRoleAndRedirect(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkRoleAndRedirect = async (userId: string) => {
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesData && rolesData.length > 0) {
      const hasOwnerRole = rolesData.some((r) => r.role === "owner");
      const hasAdminRole = rolesData.some((r) => r.role === "admin");
      
      if (hasOwnerRole) {
        navigate("/owner/product-usage", { replace: true });
        return;
      }
      
      if (hasAdminRole) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    }

    // All customers go to dashboard (free plan by default)
    navigate("/dashboard", { replace: true });
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">B</span>
                <Zap className="absolute -right-1 -top-1 h-4 w-4 text-accent fill-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs tracking-[0.3em] text-muted-foreground font-medium">PLATFORM</span>
                <span className="text-xl font-bold text-primary tracking-wide">BUZZLY</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            </div>

            {/* Auth Buttons */}
            {!user && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/login")}
                  className="text-muted-foreground hover:text-primary"
                >
                  Admin
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Width with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Blurred at top */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${authBackground})`,
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
          }}
        />
        
        {/* Gradient Overlay - Fades from light blue to cream */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              hsla(210, 40%, 85%, 0.7) 0%,
              hsla(210, 35%, 88%, 0.75) 20%,
              hsla(42, 38%, 95%, 0.85) 50%,
              hsla(42, 38%, 95%, 0.95) 70%,
              hsl(42, 38%, 95%) 100%
            )`,
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6 text-center pt-20">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold italic text-foreground mb-6 tracking-tight">
            Welcome
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Marketing Platform ที่ทันสมัยสำหรับธุรกิจยุคใหม่
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-10 max-w-xl mx-auto">
            วิเคราะห์ จัดการ และเติบโตไปพร้อมกับ Buzzly
          </p>

          {/* CTA Buttons */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <LogIn className="h-5 w-5" />
                เริ่มต้นใช้งาน
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/signup")}
                className="gap-2 px-8 py-6 text-lg rounded-full bg-card/80 backdrop-blur-sm border-border"
              >
                <UserPlus className="h-5 w-5" />
                สมัครสมาชิก
              </Button>
            </div>
          )}

          {/* Scroll Indicator */}
          <button 
            onClick={scrollToFeatures}
            className="animate-bounce text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronDown className="h-8 w-8 mx-auto" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ฟีเจอร์ที่จะช่วยให้ธุรกิจของคุณเติบโต
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              เครื่องมือครบครันสำหรับการตลาดยุคใหม่
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Dashboard ครบครัน</h3>
                <p className="text-muted-foreground">
                  ดูภาพรวมธุรกิจแบบ Real-time พร้อมกราฟวิเคราะห์ที่เข้าใจง่าย
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">จัดการลูกค้า</h3>
                <p className="text-muted-foreground">
                  เก็บข้อมูล Prospects และติดตามการโต้ตอบอย่างมีประสิทธิภาพ
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <GitCompareArrows className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">เปรียบเทียบ Campaigns</h3>
                <p className="text-muted-foreground">
                  เปรียบเทียบประสิทธิภาพแคมเปญ 2-5 รายการพร้อมกัน
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <Share2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Social Analytics</h3>
                <p className="text-muted-foreground">
                  วิเคราะห์ข้อมูลโซเชียลมีเดียจากทุกแพลตฟอร์ม
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Analytics</h3>
                <p className="text-muted-foreground">
                  รายงานเชิงลึกพร้อม Export ข้อมูลในรูปแบบที่ต้องการ
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-sidebar-accent rounded-full">
                  <Route className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Customer Journey</h3>
                <p className="text-muted-foreground">
                  ติดตามเส้นทางลูกค้าตั้งแต่รู้จักจนถึงซื้อซ้ำ
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              เข้าร่วมกับธุรกิจนับพันที่ไว้วางใจ Buzzly ในการขับเคลื่อนการตลาด
            </p>
            
            {!user && (
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="gap-2 px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="h-5 w-5" />
                เริ่มต้นฟรี
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Buzzly</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Buzzly Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
