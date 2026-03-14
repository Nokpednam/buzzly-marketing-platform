
import { Users, Crown, Zap } from "lucide-react";

export type PlanType = "free" | "pro" | "team";

export interface PlanFeature {
    name: string;
    included: boolean;
    tooltip?: string;
}

export interface PlanConfig {
    id: PlanType;
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: PlanFeature[];
    icon: React.ElementType; // Lucide icon
    color: string;
    bgGradient: string;
    popular?: boolean;
}

export const PLANS: Record<PlanType, PlanConfig> = {
    free: {
        id: "free",
        name: "Free",
        description: "เริ่มต้นใช้งานฟรี สำหรับบุคคลทั่วไป",
        price: {
            monthly: 0,
            yearly: 0,
        },
        icon: Zap,
        color: "text-muted-foreground",
        bgGradient: "from-muted/50 to-muted/20",
        features: [
            { name: "เชื่อมต่อ 2 Platforms", included: true },
            { name: "Dashboard พื้นฐาน", included: true },
            { name: "รายงาน 7 วันย้อนหลัง", included: true },
            { name: "Customer Persona", included: true },
            { name: "Campaigns & Ads Management", included: false },
            { name: "AI Insights", included: false },
            { name: "Custom Reports", included: false },
            { name: "Priority Support", included: false },
            { name: "Team Members", included: false },
        ],
    },
    pro: {
        id: "pro",
        name: "Pro",
        description: "สำหรับมืออาชีพและธุรกิจที่ต้องการเติบโต",
        price: {
            monthly: 999, // User saw 999 in one screenshot, let's standardize on this if it matches their expectation or revert to 29 if they prefer USD.
            // WAIT: User said "Look at the difference... 29 vs 999".
            // The screenshot with 999 has Thai text "999/เดือน".
            // The screenshot with 29 has English "$29/month".
            // I will standardize to the Thai pricing as it seems to be the intended "localized" version given the Thai UI.
            yearly: 9990, // Approx 10 months
        },
        popular: true,
        icon: Crown,
        color: "text-primary",
        bgGradient: "from-primary/20 to-primary/5",
        features: [
            { name: "เชื่อมต่อ Unlimited Platforms", included: true },
            { name: "Dashboard ขั้นสูง", included: true },
            { name: "รายงาน 90 วันย้อนหลัง", included: true },
            { name: "Customer Persona", included: true },
            { name: "Campaigns & Ads Management", included: true },
            { name: "AI Insights", included: true },
            { name: "Custom Reports", included: true },
            { name: "Priority Support", included: true },
            { name: "Team Members", included: false },
        ],
    },
    team: {
        id: "team",
        name: "Team",
        description: "สำหรับทีมที่ต้องการจัดการร่วมกัน",
        price: {
            monthly: 2499, // Consistent with screenshot ~2083/mo billed yearly or similar?
            // Screenshot says "2,083/mo (save 17%)". So 2083 * 12 = 25,000.
            // Monthly price in screenshot says "$2,499/เดือน".
            // Let's use 2499.
            yearly: 24990,
        },
        icon: Users,
        color: "text-violet-500",
        bgGradient: "from-violet-500/20 to-violet-500/5",
        features: [
            { name: "ทุกฟีเจอร์ใน Pro", included: true },
            { name: "เชื่อมต่อ Unlimited Platforms", included: true },
            { name: "Dashboard ขั้นสูง", included: true },
            { name: "รายงาน Unlimited ย้อนหลัง", included: true },
            { name: "Customer Persona", included: true },
            { name: "Campaigns & Ads Management", included: true },
            { name: "AI Insights", included: true },
            { name: "Custom Reports", included: true },
            { name: "Priority Support", included: true },
            { name: "Invite Team Members (5 คน)", included: true },
        ],
    },
};
