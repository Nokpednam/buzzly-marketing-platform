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
  Zap,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import React, { Suspense } from "react";

// Lazy load 3D components for performance
const ThreeDHopper = React.lazy(() => import('@/components/landing/ThreeDHopper'));
const ThreeDDashboard = React.lazy(() => import('@/components/landing/ThreeDDashboard'));

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    // Check employees table first (for owner/admin/support/developer)
    const { data: employeeData } = await supabase
      .from("employees")
      .select(`
        *,
        role_employees (
          role_name
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (employeeData && employeeData.status === 'active' && employeeData.approval_status === 'approved') {
      const roleEmployee = employeeData.role_employees as any;
      const roleName = roleEmployee?.role_name;

      if (roleName === "owner") {
        navigate("/owner/product-usage", { replace: true });
        return;
      }

      if (["admin", "support", "developer"].includes(roleName)) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    }

    // Fallback to legacy user_roles check
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 font-sans overflow-x-hidden">

      {/* Dynamic 3D Ambient Background - Updated to Blue/Cyan Theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-cyan-400/20 blur-[130px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-sky-300/15 blur-[150px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite_2s]" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Navigation - Gamma-style floating pill */}
      <nav
        className={cn(
          "fixed top-6 left-0 right-0 z-50 transition-all duration-500 mx-auto max-w-6xl rounded-full px-6 py-3 border content-box",
          scrolled
            ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-white/20 dark:border-white/10 translate-y-0"
            : "bg-transparent border-transparent translate-y-2"
        )}
      >
        <div className="flex items-center justify-between h-10">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">B</span>
              <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] tracking-[0.3em] font-bold text-blue-500/80 uppercase leading-none mb-0.5">Platform</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">BUZZLY.</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 px-6 py-2 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/5 dark:border-white/5 backdrop-blur-sm">
            <a href="#features" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
            <a href="#pricing" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="hidden sm:flex font-bold tracking-tight rounded-full hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="font-bold tracking-tight rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/20 hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25 px-6"
                >
                  Start For Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/dashboard")}
                className="font-bold tracking-tight rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-105 transition-all duration-300 px-6"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - MetaMask Bold Typography + 3D Depth */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 z-10 px-6 lg:overflow-visible overflow-hidden">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Text & Mascot */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 lg:pt-20">

            {/* The Mascot tracking the mouse */}
            {/* Kept wrapper size large enough to avoid cutting off the 3D canvas */}
            <div className="absolute -top-32 lg:-top-56 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-left-12 z-20 scale-90 md:scale-100 opacity-95">
              <Suspense fallback={null}>
                <ThreeDHopper />
              </Suspense>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-[0.2em] mb-8 border border-blue-500/20 backdrop-blur-sm animate-fade-in-up mt-32 lg:mt-0 relative z-30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next Gen Marketing Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white mb-8 animate-fade-in-up [animation-delay:100ms] relative z-30">
              <span className="relative inline-block">
                ELEVATE YOUR
                <span className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-400 blur-2xl opacity-20 -z-10 rounded-full hidden lg:block" />
              </span>
              <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 relative z-10">ENTIRE BUSINESS.</span>
            </h1>

            <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed animate-fade-in-up [animation-delay:200ms] relative z-30">
              การสร้างและจัดการแคมเปญไม่เคยง่ายขนาดนี้มาก่อน วิเคราะห์ จัดการ และเติบโตไปพร้อมกับแพลตฟอร์มที่ทรงพลังที่สุด ผสาน 3D Intelligence
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:300ms] relative z-30 w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="h-16 px-10 text-lg font-bold rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  <Sparkles className="mr-2 h-5 w-5 text-amber-300 group-hover:animate-spin" />
                  เริ่มต้นใช้งานฟรี
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToFeatures()}
                  className="h-16 px-10 text-lg font-bold rounded-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-105 transition-all duration-300"
                >
                  ดูฟีเจอร์ <ChevronDown className="ml-2 h-5 w-5 text-blue-500" />
                </Button>
              </div>
            ) : null}
          </div>

          {/* Right Column: 3D Analytics Dashboard */}
          <div className="relative h-[450px] lg:h-[650px] w-full flex items-center justify-center animate-fade-in-up [animation-delay:400ms] z-10 perspective-1000">
            {/* Removed the hardcoded glass backdrop, moving it into the 3D Canvas for true depth */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <Suspense fallback={<div className="text-blue-400 animate-pulse font-bold tracking-widest uppercase text-sm">Loading Neural Engine...</div>}>
                <ThreeDDashboard />
              </Suspense>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section - Gamma 3D Glass Cards */}
      <section id="features" className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
              UNLEASH YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">POTENTIAL.</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              เครื่องมือครบครันที่ผสานดีไซน์แห่งโลกอนาคตเข้ากับประสิทธิภาพสูงสุด
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={BarChart3}
              title="Intelligent Dashboard"
              desc="ดูภาพรวมธุรกิจแบบ Real-time พร้อมกราฟวิเคราะห์ที่สวยงามและเข้าใจง่าย"
              color="from-cyan-400 to-blue-500"
            />
            <FeatureCard
              icon={Users}
              title="Customer Management"
              desc="เก็บข้อมูล Prospects และติดตามทุกปฏิสัมพันธ์ด้วย CRM อัจฉริยะ"
              color="from-sky-400 to-blue-600"
            />
            <FeatureCard
              icon={GitCompareArrows}
              title="Campaign Comparison"
              desc="เปรียบเทียบประสิทธิภาพแคมเปญ 2-5 รายการพร้อมกันแบบ 3D Visualization"
              color="from-blue-400 to-indigo-500"
            />
            <FeatureCard
              icon={Share2}
              title="Social Analytics"
              desc="กวาดข้อมูลโซเชียลมีเดียจากทุกแพลตฟอร์มมาแสดงใน UI เดียว"
              color="from-cyan-300 to-sky-500"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Advanced Reports"
              desc="ลดเวลาทำรายงานด้วยระบบ Generate อัตโนมัติพร้อม Export ทันที"
              color="from-sky-400 to-indigo-500"
            />
            <FeatureCard
              icon={Route}
              title="Customer Journey"
              desc="ติดตามเส้นทางเปลี่ยนจากผู้เข้าชมเป็นลูกค้าประจำ (Loyalty)"
              color="from-blue-400 to-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 dark:bg-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-blue-500/20 blur-[150px] rounded-full mix-blend-screen" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <Globe className="h-20 w-20 text-cyan-400 mx-auto mb-8 animate-[spin_20s_linear_infinite]" />
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
            THE FUTURE OF <br /> MARKETING IS HERE.
          </h2>
          <p className="text-xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto">
            เข้าร่วมกับธุรกิจนับพันที่เปลี่ยนมาใช้ Buzzly ในการขับเคลื่อนนวัตกรรมการตลาด
          </p>

          {!user ? (
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="h-16 px-12 text-lg font-black tracking-wider uppercase rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Start Free Trial
            </Button>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">B</span>
              </div>
              <span className="text-xl font-black text-white tracking-tighter">BUZZLY.</span>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              © 2026 Buzzly Intelligence. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="group relative">
      <div className={cn("absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-br opacity-0 blur-xl group-hover:opacity-100 transition duration-500", color)} />

      <Card className="relative h-full p-10 rounded-[2.5rem] border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
        {/* Subtle inner decorative mesh */}
        <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br opacity-10 pointer-events-none", color)} />

        <div className="relative z-10 flex flex-col items-start gap-6">
          <div className={cn("p-5 rounded-2xl bg-gradient-to-br shadow-lg", color)}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {desc}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
