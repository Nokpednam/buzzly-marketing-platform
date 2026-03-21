import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Pencil, Trash2, Zap, ToggleLeft, ToggleRight,
  AlertCircle, Tag, MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  useActivityCodes,
  useCreateActivityCode,
  useUpdateActivityCode,
  useToggleActivityCode,
  useDeleteActivityCode,
  type ActivityCode,
  type CreateActivityCodeInput,
} from "@/hooks/useActivityCodes";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const formSchema = z.object({
  action_code: z
    .string()
    .min(3, "Action code must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  reward_points: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Points must be 0 or more"),
  usage_limit: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ActivityCodes() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ActivityCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActivityCode | null>(null);

  const { data: codes = [], isLoading, isError, error } = useActivityCodes();
  const createCode = useCreateActivityCode();
  const updateCode = useUpdateActivityCode();
  const toggleCode = useToggleActivityCode();
  const deleteCode = useDeleteActivityCode();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action_code: "",
      name: "",
      description: "",
      reward_points: 0,
      usage_limit: null,
      is_active: true,
    },
  });

  const openCreate = () => {
    form.reset({
      action_code: "",
      name: "",
      description: "",
      reward_points: 0,
      usage_limit: null,
      is_active: true,
    });
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (code: ActivityCode) => {
    form.reset({
      action_code: code.action_code,
      name: code.name,
      description: code.description ?? "",
      reward_points: code.reward_points,
      usage_limit: code.usage_limit,
      is_active: code.is_active,
    });
    setEditTarget(code);
    setFormOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (editTarget) {
      await updateCode.mutateAsync({
        id: editTarget.id,
        updates: {
          name: values.name,
          description: values.description || null,
          reward_points: values.reward_points,
          usage_limit: values.usage_limit,
          is_active: values.is_active,
        },
      });
    } else {
      await createCode.mutateAsync(values as CreateActivityCodeInput);
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleToggle = (code: ActivityCode) => {
    toggleCode.mutate({ id: code.id, is_active: !code.is_active });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCode.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const safeLocale = th || undefined;
  const isPending = createCode.isPending || updateCode.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Reward</h1>
          <p className="text-muted-foreground mt-1">
            Manage Loyalty Rewards that customers can complete to earn Points
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{codes.length}</p>
                <p className="text-xs text-muted-foreground">Codes Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <ToggleRight className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{codes.filter((c) => c.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {codes.reduce((s, c) => s + c.reward_points, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Pts Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Reward Missions</CardTitle>
          <CardDescription>
            Activity Codes that customers can complete to earn Points — customers only see active ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10 flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="font-medium">Failed to load Loyalty Rewards</p>
              <p className="text-sm text-muted-foreground">{(error as Error)?.message}</p>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No Loyalty Rewards yet</p>
              <Button variant="outline" onClick={openCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Create First Mission
              </Button>
            </div>
          ) : (
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px]">Action Code</TableHead>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead className="text-right w-[100px]">Points</TableHead>
                  <TableHead className="text-center w-[70px]">Limit</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[110px]">Created</TableHead>
                  <TableHead className="text-right w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="w-[140px]">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {code.action_code}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium w-[180px] truncate">{code.name}</TableCell>
                    <TableCell className="w-[200px]">
                      <p className="text-sm text-muted-foreground truncate">
                        {code.description ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right w-[100px]">
                      <span className="font-bold text-yellow-600">
                        +{code.reward_points.toLocaleString()} pts
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-sm w-[70px]">
                      {code.usage_limit != null ? code.usage_limit.toLocaleString() : "∞"}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={code.is_active}
                          onCheckedChange={() => handleToggle(code)}
                          disabled={toggleCode.isPending}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                        <Badge
                          variant={code.is_active ? "default" : "destructive"}
                          className={code.is_active ? "bg-emerald-500 text-white" : "bg-red-500 text-white hover:bg-red-600"}
                        >
                          {code.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap w-[110px]">
                      {format(new Date(code.created_at), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right w-[60px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(code)} className="gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(code)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Mission" : "Create Mission"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? `Edit details of "${editTarget.action_code}"`
                : "Add new Activity Code that customers can complete to earn Points"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

              <FormField
                control={form.control}
                name="action_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="connect_line_oa"
                        {...field}
                        disabled={!!editTarget}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique key (lowercase, underscores). Cannot be changed after creation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Connect LINE OA" {...field} />
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this activity..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reward_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Points</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usage_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit (blank = ∞)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="∞ unlimited"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="cursor-pointer">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Customers will only see this Activity Code when it is active
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : editTarget ? "Save" : "Create Mission"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this Mission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="font-mono">{deleteTarget?.action_code}</strong>?
              This action cannot be undone and customers will no longer see this Mission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
