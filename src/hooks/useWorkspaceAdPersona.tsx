import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = (id: string) => `workspace_ad_persona_${id}`;

export interface WorkspaceAdPersona {
  id: string;
  workspace_id: string;
  avatar_url: string | null;
  custom_title: string | null;
  custom_bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceAdPersonaUpdate {
  avatar_url?: string | null;
  custom_title?: string | null;
  custom_bio?: string | null;
}

function getFromStorage(workspaceId: string): WorkspaceAdPersona | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceAdPersona;
    return { ...parsed, workspace_id: workspaceId };
  } catch {
    return null;
  }
}

function saveToStorage(workspaceId: string, payload: WorkspaceAdPersonaUpdate) {
  const existing = getFromStorage(workspaceId);
  const merged: WorkspaceAdPersona = {
    id: existing?.id ?? crypto.randomUUID(),
    workspace_id: workspaceId,
    avatar_url: payload.avatar_url !== undefined ? payload.avatar_url : (existing?.avatar_url ?? null),
    custom_title: payload.custom_title !== undefined ? payload.custom_title : (existing?.custom_title ?? null),
    custom_bio: payload.custom_bio !== undefined ? payload.custom_bio : (existing?.custom_bio ?? null),
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY(workspaceId), JSON.stringify(merged));
  return merged;
}

export function useWorkspaceAdPersona(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const { data: persona, isLoading } = useQuery({
    queryKey: ["workspace-ad-persona", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      try {
        const { data, error } = await supabase
          .from("workspace_ad_persona")
          .select("*")
          .eq("workspace_id", workspaceId)
          .maybeSingle();

        if (error) throw error;
        return data as WorkspaceAdPersona | null;
      } catch {
        return getFromStorage(workspaceId);
      }
    },
    enabled: !!workspaceId,
  });

  const upsertPersona = useMutation({
    mutationFn: async (payload: WorkspaceAdPersonaUpdate) => {
      if (!workspaceId) throw new Error("No workspace");
      try {
        const { data, error } = await supabase
          .from("workspace_ad_persona")
          .upsert(
            {
              workspace_id: workspaceId,
              ...payload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "workspace_id" }
          )
          .select()
          .single();

        if (error) throw error;
        return data as WorkspaceAdPersona;
      } catch {
        return saveToStorage(workspaceId, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-ad-persona", workspaceId] });
      toast.success("Saved", { description: "Persona updated successfully" });
    },
    onError: (err: Error) => {
      toast.error("Something went wrong", { description: err.message });
    },
  });

  const ensurePersonaFromApi = useMutation({
    mutationFn: async (autoData: { title: string; bio: string }) => {
      if (!workspaceId) throw new Error("No workspace");
      try {
        const { data, error } = await supabase
          .from("workspace_ad_persona")
          .upsert(
            {
              workspace_id: workspaceId,
              custom_title: autoData.title,
              custom_bio: autoData.bio,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "workspace_id" }
          )
          .select()
          .single();

        if (error) throw error;
        return data as WorkspaceAdPersona;
      } catch {
        return saveToStorage(workspaceId, {
          custom_title: autoData.title,
          custom_bio: autoData.bio,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-ad-persona", workspaceId] });
    },
  });

  return {
    persona,
    isLoading,
    upsertPersona,
    ensurePersonaFromApi,
  };
}
