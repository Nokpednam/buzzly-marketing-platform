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
import { useSocialPosts } from "@/hooks/useSocialPosts";

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
  postIds: z.array(z.string()),
});

type AdGroupFormValues = z.infer<typeof adGroupFormSchema>;

const getDefaultValues = (group?: AdGroupWithCount | null): AdGroupFormValues => ({
  name: group?.name ?? "",
  description: group?.description ?? "",
  groupType: group?.group_type ?? "seasonal",
  status: group?.status ?? "draft",
  postIds: [],
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
  const { createAdGroup, updateAdGroup, syncGroupPosts } = useAdGroups();
  const { posts, isLoading: postsLoading } = useSocialPosts({
    postChannels: ["social", "ad"],
  });
  const [searchValue, setSearchValue] = useState("");

  const form = useForm<AdGroupFormValues>({
    resolver: zodResolver(adGroupFormSchema),
    defaultValues: getDefaultValues(group),
  });

  const isPending =
    createAdGroup.isPending || updateAdGroup.isPending || syncGroupPosts.isPending;

  useEffect(() => {
    if (!open) {
      setSearchValue("");
      return;
    }

    const linkedPostIds = group
      ? posts
        .filter((post) => post.post_type !== "chat" && post.ad_group_id === group.id)
        .map((post) => post.id)
      : [];

    form.reset({
      ...getDefaultValues(group),
      postIds: linkedPostIds,
    });
    setSearchValue("");
  }, [form, group, open, posts]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return posts.filter((post) => {
      if (post.post_type === "chat") {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [post.display_title, post.content ?? "", post.ad_group_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [posts, searchValue]);

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
        await syncGroupPosts.mutateAsync({ groupId: group.id, postIds: values.postIds });
      } else {
        const createdGroup = await createAdGroup.mutateAsync(payload);
        await syncGroupPosts.mutateAsync({
          groupId: createdGroup.id,
          postIds: values.postIds,
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
            กำหนดรายละเอียดของกลุ่มและเลือกโพสต์จาก `social_posts` ทั้ง Organic และ Paid ไว้ด้วยกัน
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
              name="postIds"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FormLabel>โพสต์ในกลุ่ม</FormLabel>
                      <FormDescription>
                        เลือกได้จาก `social_posts` ทุกแถวที่เป็น `social` หรือ `ad` และย้ายจากกลุ่มอื่นได้ทันที
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
                      placeholder="ค้นหาจากชื่อโพสต์ เนื้อหา หรือชื่อกลุ่มเดิม"
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-80 rounded-md border">
                    <div className="space-y-2 p-3">
                      {postsLoading ? (
                        <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังโหลดโพสต์...
                        </div>
                      ) : filteredPosts.length === 0 ? (
                        <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                          ไม่พบโพสต์ตามคำค้นหา
                        </div>
                      ) : (
                        filteredPosts.map((post) => {
                          const checked = field.value.includes(post.id);
                          const currentGroupName = post.ad_group_name ?? null;
                          const isFromAnotherGroup =
                            Boolean(post.ad_group_id) && post.ad_group_id !== group?.id;
                          const channelLabel =
                            post.post_channel === "ad" ? "Paid Ad" : "Organic Post";
                          const channelClassName =
                            post.post_channel === "ad"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

                          return (
                            <label
                              key={post.id}
                              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value) {
                                    field.onChange([...field.value, post.id]);
                                    return;
                                  }

                                  field.onChange(
                                    field.value.filter((postId) => postId !== post.id)
                                  );
                                }}
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">{post.display_title}</span>
                                  <Badge className={`text-[10px] ${channelClassName}`}>
                                    {channelLabel}
                                  </Badge>
                                  {post.status && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {post.status}
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
                                {post.content && (
                                  <p className="truncate text-sm text-muted-foreground">
                                    {post.content}
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
