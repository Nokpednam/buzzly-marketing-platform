import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, BarChart2, Brain, Cpu, Target, Settings } from "lucide-react";
import type { CustomerPersonaInsert, CustomerPersona } from "@/hooks/useCustomerPersonas";
import type { Json } from "@/integrations/supabase/types";

interface Gender {
  id: string;
  name_gender: string;
}

interface CreatePersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerPersonaInsert) => void;
  teamId: string;
  genders: Gender[];
  isLoading: boolean;
  initialData?: CustomerPersona | null;
  isOwner?: boolean;
}

// ── Local helpers ─────────────────────────────────────────────────────────────

const SALARY_RANGES = [
  "ต่ำกว่า 15,000",
  "15,000 - 30,000",
  "30,001 - 50,000",
  "50,001 - 100,000",
  "100,001+",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const ACTIVE_HOURS = ["เช้า (6-12)", "บ่าย (12-18)", "เย็น (18-22)", "ดึก (22-6)"];
const DEVICE_OPTIONS = ["mobile", "desktop", "tablet"];
const BUYING_BEHAVIORS = [
  { value: "impulse", label: "Impulse Buyer" },
  { value: "research-heavy", label: "Research-Heavy" },
  { value: "deal-seeker", label: "Deal Seeker" },
  { value: "brand-loyal", label: "Brand Loyal" },
];

// ── JSONB shape interfaces ─────────────────────────────────────────────────────

interface PsychographicsData {
  values: string[];
  lifestyle: string[];
  buying_behavior: string;
  brand_affinity: string[];
  content_preferences: string[];
}

interface PlatformTargeting {
  interests: string[];
  behaviors: string[];
  custom_audiences: string[];
}

interface GoogleTargeting {
  keywords: string[];
  in_market: string[];
  affinity: string[];
}

interface TikTokTargeting {
  interest_categories: string[];
  behavior_categories: string[];
}

interface AdTargetingData {
  facebook: PlatformTargeting;
  google: GoogleTargeting;
  tiktok: TikTokTargeting;
}

const defaultPsychographics = (): PsychographicsData => ({
  values: [],
  lifestyle: [],
  buying_behavior: "",
  brand_affinity: [],
  content_preferences: [],
});

const defaultAdTargeting = (): AdTargetingData => ({
  facebook: { interests: [], behaviors: [], custom_audiences: [] },
  google: { keywords: [], in_market: [], affinity: [] },
  tiktok: { interest_categories: [], behavior_categories: [] },
});

function parsePsychographics(raw: Json | null): PsychographicsData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultPsychographics();
  const r = raw as Record<string, unknown>;
  return {
    values: Array.isArray(r.values) ? (r.values as string[]) : [],
    lifestyle: Array.isArray(r.lifestyle) ? (r.lifestyle as string[]) : [],
    buying_behavior: typeof r.buying_behavior === "string" ? r.buying_behavior : "",
    brand_affinity: Array.isArray(r.brand_affinity) ? (r.brand_affinity as string[]) : [],
    content_preferences: Array.isArray(r.content_preferences)
      ? (r.content_preferences as string[])
      : [],
  };
}

function parseAdTargeting(raw: Json | null): AdTargetingData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultAdTargeting();
  const r = raw as Record<string, unknown>;
  const parsePlatform = (obj: unknown): PlatformTargeting => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
      return { interests: [], behaviors: [], custom_audiences: [] };
    const p = obj as Record<string, unknown>;
    return {
      interests: Array.isArray(p.interests) ? (p.interests as string[]) : [],
      behaviors: Array.isArray(p.behaviors) ? (p.behaviors as string[]) : [],
      custom_audiences: Array.isArray(p.custom_audiences)
        ? (p.custom_audiences as string[])
        : [],
    };
  };
  const parseGoogle = (obj: unknown): GoogleTargeting => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
      return { keywords: [], in_market: [], affinity: [] };
    const p = obj as Record<string, unknown>;
    return {
      keywords: Array.isArray(p.keywords) ? (p.keywords as string[]) : [],
      in_market: Array.isArray(p.in_market) ? (p.in_market as string[]) : [],
      affinity: Array.isArray(p.affinity) ? (p.affinity as string[]) : [],
    };
  };
  const parseTikTok = (obj: unknown): TikTokTargeting => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
      return { interest_categories: [], behavior_categories: [] };
    const p = obj as Record<string, unknown>;
    return {
      interest_categories: Array.isArray(p.interest_categories)
        ? (p.interest_categories as string[])
        : [],
      behavior_categories: Array.isArray(p.behavior_categories)
        ? (p.behavior_categories as string[])
        : [],
    };
  };
  return {
    facebook: parsePlatform(r.facebook),
    google: parseGoogle(r.google),
    tiktok: parseTikTok(r.tiktok),
  };
}

// ── TagInput sub-component ─────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ tags, onChange, placeholder = "พิมพ์แล้วกด Enter" }: TagInputProps) => {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="shrink-0">
          เพิ่ม
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

export const CreatePersonaDialog = ({
  open,
  onOpenChange,
  onSubmit,
  teamId,
  genders,
  isLoading,
  initialData,
  isOwner = false,
}: CreatePersonaDialogProps) => {
  const isEditMode = !!initialData?.id;

  const getDefaultFormData = () => ({
    persona_name: initialData?.persona_name ?? "",
    description: initialData?.description ?? "",
    gender_id: initialData?.gender_id ?? "",
    age_min: initialData?.age_min?.toString() ?? "",
    age_max: initialData?.age_max?.toString() ?? "",
    profession: initialData?.profession ?? "",
    industry: initialData?.industry ?? "",
    company_size: initialData?.company_size ?? "",
    salary_range: initialData?.salary_range ?? "",
    active_hours: initialData?.active_hours ?? "",
    preferred_devices: (initialData?.preferred_devices ?? []) as string[],
    interests: (initialData?.interests ?? []) as string[],
    goals: (initialData?.goals ?? []) as string[],
    pain_points: (initialData?.pain_points ?? []) as string[],
    is_template: initialData?.is_template ?? false,
    psychographics: parsePsychographics(initialData?.psychographics ?? null),
    ad_targeting: parseAdTargeting(initialData?.ad_targeting_mapping ?? null),
  });

  const [formData, setFormData] = useState(getDefaultFormData);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (open) {
      setFormData(getDefaultFormData());
      setActiveTab("basic");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const toggleDevice = (device: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_devices: prev.preferred_devices.includes(device)
        ? prev.preferred_devices.filter((d) => d !== device)
        : [...prev.preferred_devices, device],
    }));
  };

  const setPsycho = (key: keyof PsychographicsData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      psychographics: { ...prev.psychographics, [key]: value },
    }));
  };

  const setFacebook = (key: keyof PlatformTargeting, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      ad_targeting: {
        ...prev.ad_targeting,
        facebook: { ...prev.ad_targeting.facebook, [key]: value },
      },
    }));
  };

  const setGoogle = (key: keyof GoogleTargeting, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      ad_targeting: {
        ...prev.ad_targeting,
        google: { ...prev.ad_targeting.google, [key]: value },
      },
    }));
  };

  const setTikTok = (key: keyof TikTokTargeting, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      ad_targeting: {
        ...prev.ad_targeting,
        tiktok: { ...prev.ad_targeting.tiktok, [key]: value },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const psychoPayload: PsychographicsData = {
      values: formData.psychographics.values,
      lifestyle: formData.psychographics.lifestyle,
      buying_behavior: formData.psychographics.buying_behavior,
      brand_affinity: formData.psychographics.brand_affinity,
      content_preferences: formData.psychographics.content_preferences,
    };

    const targetingPayload: AdTargetingData = formData.ad_targeting;

    const data: CustomerPersonaInsert = {
      team_id: teamId,
      persona_name: formData.persona_name,
      description: formData.description || null,
      gender_id: formData.gender_id || null,
      age_min: formData.age_min ? parseInt(formData.age_min) : null,
      age_max: formData.age_max ? parseInt(formData.age_max) : null,
      profession: formData.profession || null,
      industry: formData.industry || null,
      company_size: formData.company_size || null,
      salary_range: formData.salary_range || null,
      active_hours: formData.active_hours || null,
      preferred_devices:
        formData.preferred_devices.length > 0 ? formData.preferred_devices : null,
      interests: formData.interests.length > 0 ? formData.interests : null,
      goals: formData.goals.length > 0 ? formData.goals : null,
      pain_points: formData.pain_points.length > 0 ? formData.pain_points : null,
      is_template: formData.is_template,
      psychographics: psychoPayload as unknown as Json,
      ad_targeting_mapping: targetingPayload as unknown as Json,
      custom_fields: initialData?.custom_fields ?? null,
    };

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">
            {isEditMode ? "Edit Customer Persona" : "Create New Customer Persona"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          {initialData && !initialData.id && (
            <div className="mx-6 mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
              Pre-filled from Audience Discovery. Name your persona and review the details.
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="mx-6 mt-4 mb-0 shrink-0 grid grid-cols-6 h-auto gap-1 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="basic" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <User className="h-3.5 w-3.5" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="demo" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <BarChart2 className="h-3.5 w-3.5" />
                Demo
              </TabsTrigger>
              <TabsTrigger value="psycho" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <Brain className="h-3.5 w-3.5" />
                Psycho
              </TabsTrigger>
              <TabsTrigger value="behavioral" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <Cpu className="h-3.5 w-3.5" />
                Behavioral
              </TabsTrigger>
              <TabsTrigger value="targeting" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <Target className="h-3.5 w-3.5" />
                Ad Targeting
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg flex-col gap-0.5 h-auto py-1.5 text-xs">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* ── BASIC INFO ── */}
              <TabsContent value="basic" className="mt-0 space-y-4">
                <SectionHeading>Basic Information</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="persona_name">Persona Name *</Label>
                    <Input
                      id="persona_name"
                      value={formData.persona_name}
                      onChange={(e) =>
                        setFormData({ ...formData, persona_name: e.target.value })
                      }
                      placeholder="e.g., Young Professionals"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender_id}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gender_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name_gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this customer group..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* ── DEMOGRAPHICS ── */}
              <TabsContent value="demo" className="mt-0 space-y-4">
                <SectionHeading>Demographics</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age_min">อายุต่ำสุด</Label>
                    <Input
                      id="age_min"
                      type="number"
                      value={formData.age_min}
                      onChange={(e) =>
                        setFormData({ ...formData, age_min: e.target.value })
                      }
                      placeholder="18"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_max">อายุสูงสุด</Label>
                    <Input
                      id="age_max"
                      type="number"
                      value={formData.age_max}
                      onChange={(e) =>
                        setFormData({ ...formData, age_max: e.target.value })
                      }
                      placeholder="35"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">อาชีพ</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData({ ...formData, profession: e.target.value })
                      }
                      placeholder="เช่น นักการตลาด"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">อุตสาหกรรม</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      placeholder="เช่น Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">ขนาดบริษัท</Label>
                    <Select
                      value={formData.company_size}
                      onValueChange={(v) =>
                        setFormData({ ...formData, company_size: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกขนาด" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} พนักงาน
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">ช่วงรายได้</Label>
                    <Select
                      value={formData.salary_range}
                      onValueChange={(v) =>
                        setFormData({ ...formData, salary_range: v })
                      }
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
                </div>
              </TabsContent>

              {/* ── PSYCHOGRAPHICS ── */}
              <TabsContent value="psycho" className="mt-0 space-y-5">
                <SectionHeading>Psychographics</SectionHeading>

                <div className="space-y-2">
                  <Label>Values</Label>
                  <TagInput
                    tags={formData.psychographics.values}
                    onChange={(tags) => setPsycho("values", tags)}
                    placeholder="เช่น Freedom, Innovation..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lifestyle</Label>
                  <TagInput
                    tags={formData.psychographics.lifestyle}
                    onChange={(tags) => setPsycho("lifestyle", tags)}
                    placeholder="เช่น Active, Urban..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buying_behavior">Buying Behavior</Label>
                  <Select
                    value={formData.psychographics.buying_behavior}
                    onValueChange={(v) => setPsycho("buying_behavior", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพฤติกรรมการซื้อ" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUYING_BEHAVIORS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand Affinity</Label>
                  <TagInput
                    tags={formData.psychographics.brand_affinity}
                    onChange={(tags) => setPsycho("brand_affinity", tags)}
                    placeholder="เช่น Nike, Apple..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content Preferences</Label>
                  <TagInput
                    tags={formData.psychographics.content_preferences}
                    onChange={(tags) => setPsycho("content_preferences", tags)}
                    placeholder="เช่น Video, Long-form articles..."
                  />
                </div>
              </TabsContent>

              {/* ── BEHAVIORAL ── */}
              <TabsContent value="behavioral" className="mt-0 space-y-5">
                <SectionHeading>พฤติกรรม</SectionHeading>

                <div className="space-y-2">
                  <Label>อุปกรณ์ที่ใช้</Label>
                  <div className="flex gap-2">
                    {DEVICE_OPTIONS.map((device) => (
                      <Badge
                        key={device}
                        variant={
                          formData.preferred_devices.includes(device)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer capitalize px-3 py-1"
                        onClick={() => toggleDevice(device)}
                      >
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active_hours">ช่วงเวลาที่ active</Label>
                  <Select
                    value={formData.active_hours}
                    onValueChange={(v) =>
                      setFormData({ ...formData, active_hours: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกช่วงเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_HOURS.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <TagInput
                    tags={formData.interests}
                    onChange={(tags) => setFormData({ ...formData, interests: tags })}
                    placeholder="เช่น Marketing, Travel..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Goals</Label>
                    <TagInput
                      tags={formData.goals}
                      onChange={(tags) => setFormData({ ...formData, goals: tags })}
                      placeholder="เป้าหมาย"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pain Points</Label>
                    <TagInput
                      tags={formData.pain_points}
                      onChange={(tags) => setFormData({ ...formData, pain_points: tags })}
                      placeholder="ปัญหา"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ── AD TARGETING ── */}
              <TabsContent value="targeting" className="mt-0 space-y-4">
                <SectionHeading>Ad Targeting Mapping</SectionHeading>
                <p className="text-xs text-muted-foreground -mt-2">
                  กำหนด targeting parameters สำหรับแต่ละ platform เพื่อนำไปใช้กับ ad campaigns
                </p>

                <Tabs defaultValue="facebook" className="border rounded-xl">
                  <TabsList className="w-full rounded-t-xl rounded-b-none bg-muted/30 p-1 grid grid-cols-3">
                    <TabsTrigger value="facebook" className="rounded-lg text-xs">
                      Facebook / IG
                    </TabsTrigger>
                    <TabsTrigger value="google" className="rounded-lg text-xs">
                      Google
                    </TabsTrigger>
                    <TabsTrigger value="tiktok" className="rounded-lg text-xs">
                      TikTok
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-4 space-y-4">
                    <TabsContent value="facebook" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Interests</Label>
                        <TagInput
                          tags={formData.ad_targeting.facebook.interests}
                          onChange={(tags) => setFacebook("interests", tags)}
                          placeholder="เช่น Digital Marketing, E-commerce..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Behaviors</Label>
                        <TagInput
                          tags={formData.ad_targeting.facebook.behaviors}
                          onChange={(tags) => setFacebook("behaviors", tags)}
                          placeholder="เช่น Online shoppers, Small business owners..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custom Audiences</Label>
                        <TagInput
                          tags={formData.ad_targeting.facebook.custom_audiences}
                          onChange={(tags) => setFacebook("custom_audiences", tags)}
                          placeholder="เช่น Lookalike 1%, Retargeting..."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="google" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Keywords</Label>
                        <TagInput
                          tags={formData.ad_targeting.google.keywords}
                          onChange={(tags) => setGoogle("keywords", tags)}
                          placeholder="เช่น buy running shoes, best CRM software..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>In-Market Segments</Label>
                        <TagInput
                          tags={formData.ad_targeting.google.in_market}
                          onChange={(tags) => setGoogle("in_market", tags)}
                          placeholder="เช่น Business Services, Consumer Electronics..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Affinity Audiences</Label>
                        <TagInput
                          tags={formData.ad_targeting.google.affinity}
                          onChange={(tags) => setGoogle("affinity", tags)}
                          placeholder="เช่น Sports & Fitness Enthusiasts..."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="tiktok" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Interest Categories</Label>
                        <TagInput
                          tags={formData.ad_targeting.tiktok.interest_categories}
                          onChange={(tags) => setTikTok("interest_categories", tags)}
                          placeholder="เช่น Beauty & Personal Care, Technology..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Behavior Categories</Label>
                        <TagInput
                          tags={formData.ad_targeting.tiktok.behavior_categories}
                          onChange={(tags) => setTikTok("behavior_categories", tags)}
                          placeholder="เช่น App users, Video creators..."
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

              {/* ── SETTINGS ── */}
              <TabsContent value="settings" className="mt-0 space-y-6">
                <SectionHeading>Settings</SectionHeading>

                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Template Persona</Label>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        เมื่อเปิดใช้งาน Persona นี้จะมองเห็นได้จากทุก workspace แต่แก้ไขได้เฉพาะ workspace เจ้าของเท่านั้น
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_template}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_template: checked })
                      }
                      disabled={!isOwner}
                    />
                  </div>
                  {!isOwner && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      เฉพาะ workspace owner เท่านั้นที่สามารถสร้าง template persona ได้
                    </p>
                  )}
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.persona_name}
              >
                {isLoading
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Persona"}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
      {children}
    </h3>
  );
}
