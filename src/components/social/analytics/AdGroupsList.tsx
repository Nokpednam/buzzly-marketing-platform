import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  FileText,
  Link2,
  Megaphone,
  Leaf,
} from "lucide-react";
import { useAdGroups } from "@/hooks/useAdGroups";

interface AdGroupsListProps {
  onGroupsChange?: (groups: { id: string; name: string }[]) => void;
}

export function AdGroupsList({ onGroupsChange }: AdGroupsListProps) {
  const { adGroups, isLoading } = useAdGroups();

  useEffect(() => {
    onGroupsChange?.(adGroups.map((group) => ({ id: group.id, name: group.name })));
  }, [adGroups, onGroupsChange]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">กำลังทำงาน</Badge>;
      case "paused":
        return <Badge className="bg-warning text-warning-foreground">หยุดชั่วคราว</Badge>;
      case "draft":
        return <Badge variant="secondary">แบบร่าง</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active":
        return <div className="h-2 w-2 rounded-full bg-success" />;
      case "paused":
        return <div className="h-2 w-2 rounded-full bg-warning" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{adGroups.length} Ad Groups</p>
          <p className="text-xs text-muted-foreground">
            Manual grouping overview for paid ads and linked organic posts
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(group.status)}
                  <CardTitle className="text-base">{group.name}</CardTitle>
                </div>
                {getStatusBadge(group.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-2">
                {group.group_type && (
                  <Badge variant="outline" className="capitalize">
                    {group.group_type.replace("-", " ")}
                  </Badge>
                )}
                <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                  <Megaphone className="h-3 w-3" />
                  Paid Group
                </Badge>
              </div>

              {group.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Megaphone className="h-4 w-4 text-blue-500" />
                    {group.ads_count} โฆษณา
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-emerald-500" />
                    {group.posts_count} โพสต์
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                อัปเดตล่าสุด:{" "}
                {new Date(group.updated_at).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Shared reporting entity
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Link2 className="h-3 w-3" />
                  Linked content summary
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {adGroups.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มีกลุ่มโฆษณา</p>
            <p className="text-sm">สร้างกลุ่มโฆษณาใหม่เพื่อเริ่มจัดหมวดหมู่ paid ads และ organic posts</p>
          </div>
        </Card>
      )}
    </div>
  );
}
