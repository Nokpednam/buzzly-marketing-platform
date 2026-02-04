import { useState } from "react";
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
import { X } from "lucide-react";
import type { CustomerPersonaInsert } from "@/hooks/useCustomerPersonas";

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
}

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

export function CreatePersonaDialog({
  open,
  onOpenChange,
  onSubmit,
  teamId,
  genders,
  isLoading,
}: CreatePersonaDialogProps) {
  const [formData, setFormData] = useState({
    persona_name: "",
    description: "",
    gender_id: "",
    age_min: "",
    age_max: "",
    profession: "",
    industry: "",
    company_size: "",
    salary_range: "",
    active_hours: "",
    preferred_devices: [] as string[],
    interests: [] as string[],
    goals: [] as string[],
    pain_points: [] as string[],
  });

  const [interestInput, setInterestInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [painPointInput, setPainPointInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      preferred_devices: formData.preferred_devices.length > 0 ? formData.preferred_devices : null,
      interests: formData.interests.length > 0 ? formData.interests : null,
      goals: formData.goals.length > 0 ? formData.goals : null,
      pain_points: formData.pain_points.length > 0 ? formData.pain_points : null,
    };

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      persona_name: "",
      description: "",
      gender_id: "",
      age_min: "",
      age_max: "",
      profession: "",
      industry: "",
      company_size: "",
      salary_range: "",
      active_hours: "",
      preferred_devices: [],
      interests: [],
      goals: [],
      pain_points: [],
    });
    setInterestInput("");
    setGoalInput("");
    setPainPointInput("");
  };

  const addItem = (
    key: "interests" | "goals" | "pain_points",
    value: string,
    setter: (v: string) => void
  ) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [key]: [...prev[key], value.trim()],
      }));
      setter("");
    }
  };

  const removeItem = (key: "interests" | "goals" | "pain_points", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const toggleDevice = (device: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_devices: prev.preferred_devices.includes(device)
        ? prev.preferred_devices.filter((d) => d !== device)
        : [...prev.preferred_devices, device],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้าง Customer Persona ใหม่</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">ข้อมูลพื้นฐาน</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="persona_name">ชื่อ Persona *</Label>
                <Input
                  id="persona_name"
                  value={formData.persona_name}
                  onChange={(e) => setFormData({ ...formData, persona_name: e.target.value })}
                  placeholder="เช่น Young Professionals"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">เพศ</Label>
                <Select
                  value={formData.gender_id}
                  onValueChange={(v) => setFormData({ ...formData, gender_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเพศ" />
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
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายกลุ่มลูกค้านี้..."
              />
            </div>
          </div>

          {/* Demographics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Demographics</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age_min">อายุต่ำสุด</Label>
                <Input
                  id="age_min"
                  type="number"
                  value={formData.age_min}
                  onChange={(e) => setFormData({ ...formData, age_min: e.target.value })}
                  placeholder="18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_max">อายุสูงสุด</Label>
                <Input
                  id="age_max"
                  type="number"
                  value={formData.age_max}
                  onChange={(e) => setFormData({ ...formData, age_max: e.target.value })}
                  placeholder="35"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">ข้อมูลอาชีพ</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profession">อาชีพ</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="เช่น นักการตลาด"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">อุตสาหกรรม</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="เช่น Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_size">ขนาดบริษัท</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(v) => setFormData({ ...formData, company_size: v })}
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
                  onValueChange={(v) => setFormData({ ...formData, salary_range: v })}
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
          </div>

          {/* Behavioral */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">พฤติกรรม</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>อุปกรณ์ที่ใช้</Label>
                <div className="flex gap-2">
                  {DEVICE_OPTIONS.map((device) => (
                    <Badge
                      key={device}
                      variant={formData.preferred_devices.includes(device) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
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
                  onValueChange={(v) => setFormData({ ...formData, active_hours: v })}
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
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">ความสนใจ</h3>
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="พิมพ์แล้วกด Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("interests", interestInput, setInterestInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addItem("interests", interestInput, setInterestInput)}
                >
                  เพิ่ม
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem("interests", i)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Goals & Pain Points */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Goals</Label>
              <div className="flex gap-2">
                <Input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="เป้าหมาย"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("goals", goalInput, setGoalInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem("goals", goalInput, setGoalInput)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.goals.map((goal, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {goal}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeItem("goals", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pain Points</Label>
              <div className="flex gap-2">
                <Input
                  value={painPointInput}
                  onChange={(e) => setPainPointInput(e.target.value)}
                  placeholder="ปัญหา"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("pain_points", painPointInput, setPainPointInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addItem("pain_points", painPointInput, setPainPointInput)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.pain_points.map((point, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {point}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeItem("pain_points", i)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading || !formData.persona_name}>
              {isLoading ? "กำลังบันทึก..." : "สร้าง Persona"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
