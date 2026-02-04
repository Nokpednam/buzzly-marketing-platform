import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";
export type WorkspaceMemberStatus = "active" | "pending" | "suspended";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string | null;
  email: string;
  fullName: string | null;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  invitedBy: string | null;
  inviterName: string;
  joinedAt: string | null;
  invitedAt: string;
  workspaceName: string;
}

// Mock data - will be replaced with DB integration when schema is updated
const mockMembers: WorkspaceMember[] = [
  {
    id: "wm-1",
    workspace_id: "ws-1",
    user_id: "user-1",
    email: "owner@shop.com",
    fullName: "เจ้าของร้าน ABC",
    role: "owner",
    status: "active",
    invitedBy: null,
    inviterName: "ระบบ",
    joinedAt: "2024-01-01T08:00:00Z",
    invitedAt: "2024-01-01T08:00:00Z",
    workspaceName: "ร้านขายของ ABC",
  },
  {
    id: "wm-2",
    workspace_id: "ws-1",
    user_id: "user-2",
    email: "admin@shop.com",
    fullName: "ผู้ช่วยดูแลร้าน",
    role: "admin",
    status: "active",
    invitedBy: "user-1",
    inviterName: "เจ้าของร้าน ABC",
    joinedAt: "2024-02-15T10:30:00Z",
    invitedAt: "2024-02-14T09:00:00Z",
    workspaceName: "ร้านขายของ ABC",
  },
];

export function useWorkspaceMembers() {
  const [localMembers, setLocalMembers] = useState<WorkspaceMember[]>(mockMembers);

  const { isLoading } = useQuery({
    queryKey: ["workspace-members"],
    queryFn: async () => mockMembers,
  });

  const inviteMember = {
    mutateAsync: async ({ email, role }: { email: string; role: WorkspaceMemberRole }) => {
      const newMember: WorkspaceMember = {
        id: `wm-${Date.now()}`,
        workspace_id: "ws-1",
        user_id: null,
        email,
        fullName: null,
        role,
        status: "pending",
        invitedBy: "current-user",
        inviterName: "คุณ",
        joinedAt: null,
        invitedAt: new Date().toISOString(),
        workspaceName: "ร้านขายของ ABC",
      };
      setLocalMembers(prev => [...prev, newMember]);
      toast.success("ส่งคำเชิญสำเร็จ");
      return newMember;
    },
    isPending: false,
  };

  const suspendMember = {
    mutateAsync: async (id: string) => {
      setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, status: "suspended" as const } : m));
      toast.success("ระงับสมาชิกสำเร็จ");
    },
  };

  const reactivateMember = {
    mutateAsync: async (id: string) => {
      setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, status: "active" as const } : m));
      toast.success("เปิดใช้งานสมาชิกอีกครั้ง");
    },
  };

  const removeMember = {
    mutateAsync: async (id: string) => {
      setLocalMembers(prev => prev.filter(m => m.id !== id));
      toast.success("นำสมาชิกออกสำเร็จ");
    },
  };

  return {
    members: localMembers,
    isLoading,
    error: null,
    inviteMember,
    suspendMember,
    reactivateMember,
    removeMember,
  };
}
