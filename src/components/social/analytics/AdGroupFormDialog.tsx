import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdGroups, type AdGroupWithCount } from "@/hooks/useAdGroups";
import { useAds } from "@/hooks/useAds";

const GROUP_TYPE_OPTIONS = [
  { value: "seasonal", label: "Seasonal" },
  { value: "ab-testing", label: "A/B Testing" },
  { value: "product-launch", label: "Product Launch" },
  { value: "remarketing", label: "Remarketing" },
  { value: "evergreen", label: "Evergreen" },
] as const;

const adGroupFormSchema = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อกลุ่มโฆษณา"),
  description: z.string().trim().max(500, "คำอธิบายต้องไม่เกิน 500 ตัวอักษร").optional(),
  groupType: z.string().min(1, "กรุณาเลือกประเภทของกลุ่ม"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
  adIds: z.array(z.string()),
});

type AdGroupFormValues = z.infer<typeof adGroupFormSchema>;

const getDefaultValues = (group?: AdGroupWithCount | null): AdGroupFormValues => ({
  name: group?.name ?? "",
  description: group?.description ?? "",
  groupType: group?.group_type ?? "seasonal",
  status: group?.status ?? "draft",
  adIds: [],
});

interface AdGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: AdGroupWithCount | null;
}

export const AdGroupFormDialog: React.FC<AdGroupFormDialogProps> = ({
  open,
  onOpenChange,
  group,
}) => {
  const isEditMode = Boolean(group);
  const { adGroups, createAdGroup, updateAdGroup, syncGroupAds } = useAdGroups();
  const { ads, isLoading: adsLoading } = useAds();
  const [searchValue, setSearchValue] = useState("");

  const form = useForm<AdGroupFormValues>({
    resolver: zodResolver(adGroupFormSchema),
    defaultValues: getDefaultValues(group),
  });

  const isPending =
    createAdGroup.isPending || updateAdGroup.isPending || syncGroupAds.isPending;

  useEffect(() => {
    if (!open) {
      setSearchValue("");
      return;
    }

    const linkedAdIds = group
      ? ads.filter((ad) => ad.ad_group_id === group.id).map((ad) => ad.id)
      : [];

    form.reset({
      ...getDefaultValues(group),
      adIds: linkedAdIds,
    });
    setSearchValue("");
  }, [ads, form, group, open]);

  const filteredAds = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return ads.filter((ad) => {
      if (!normalizedSearch) {
        return true;
      }

      return [ad.name, ad.headline ?? "", ad.ad_groups?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [ads, searchValue]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      onOpenChange(nextOpen);
    }
  };

  const handleSubmit = async (values: AdGroupFormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      group_type: values.groupType,
      status: values.status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (group) {
        await updateAdGroup.mutateAsync({
          id: group.id,
          updates: payload,
        });
        await syncGroupAds.mutateAsync({ groupId: group.id, adIds: values.adIds });
      } else {
        const createdGroup = await createAdGroup.mutateAsync(payload);
        await syncGroupAds.mutateAsync({
          groupId: createdGroup.id,
          adIds: values.adIds,
        });
      }

      onOpenChange(false);
      form.reset(getDefaultValues(null));
      setSearchValue("");
    } catch {
      // Toasts are already handled inside the mutations.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "แก้ไขกลุ่มโฆษณา" : "สร้างกลุ่มโฆษณาใหม่"}
          </DialogTitle>
          <DialogDescription>
            กำหนดรายละเอียดของกลุ่มและเลือกโฆษณาที่ต้องการจัดไว้ด้วยกัน
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-6 py-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อกลุ่ม</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Launch Retargeting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คำอธิบาย</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="อธิบายวัตถุประสงค์ กลุ่มเป้าหมาย หรือแนวคิดของ Ad Group นี้"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="groupType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category / Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภท" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GROUP_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สถานะ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสถานะ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">แบบร่าง</SelectItem>
                          <SelectItem value="active">เปิดใช้งาน</SelectItem>
                          <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="adIds"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FormLabel>โฆษณาในกลุ่ม</FormLabel>
                      <FormDescription>
                        เลือกหลายรายการได้ และสามารถย้ายโฆษณาจากกลุ่มอื่นเข้ามาได้ทันที
                      </FormDescription>
                    </div>
                    <Badge variant="secondary">
                      เลือกแล้ว {field.value.length} รายการ
                    </Badge>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="ค้นหาจากชื่อโฆษณา headline หรือชื่อกลุ่ม"
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-80 rounded-md border">
                    <div className="space-y-2 p-3">
                      {adsLoading ? (
                        <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังโหลดโฆษณา...
                        </div>
                      ) : filteredAds.length === 0 ? (
                        <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                          ไม่พบโฆษณาตามคำค้นหา
                        </div>
                      ) : (
                        filteredAds.map((ad) => {
                          const checked = field.value.includes(ad.id);
                          const currentGroupName = ad.ad_groups?.name ?? null;
                          const isFromAnotherGroup =
                            Boolean(ad.ad_group_id) && ad.ad_group_id !== group?.id;

                          return (
                            <label
                              key={ad.id}
                              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value) {
                                    field.onChange([...field.value, ad.id]);
                                    return;
                                  }

                                  field.onChange(
                                    field.value.filter((adId) => adId !== ad.id)
                                  );
                                }}
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">{ad.name}</span>
                                  {ad.status && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {ad.status}
                                    </Badge>
                                  )}
                                  {currentGroupName && (
                                    <Badge
                                      variant={isFromAnotherGroup ? "secondary" : "outline"}
                                      className="text-[10px]"
                                    >
                                      {isFromAnotherGroup
                                        ? `ย้ายจาก ${currentGroupName}`
                                        : currentGroupName}
                                    </Badge>
                                  )}
                                </div>
                                {ad.headline && (
                                  <p className="truncate text-sm text-muted-foreground">
                                    {ad.headline}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="lg:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : isEditMode ? (
                  "บันทึกการเปลี่ยนแปลง"
                ) : (
                  "สร้างกลุ่มโฆษณา"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
