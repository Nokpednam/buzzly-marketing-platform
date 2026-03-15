import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePostPersonaLinks() {
  const queryClient = useQueryClient();

  const linkPersonas = useMutation({
    mutationFn: async ({
      postId,
      personaIds,
    }: {
      postId: string;
      personaIds: string[];
    }) => {
      const { error: deleteError } = await supabase
        .from("post_personas")
        .delete()
        .eq("post_id", postId);
      if (deleteError) throw deleteError;

      if (personaIds.length === 0) return;

      const { error: insertError } = await supabase
        .from("post_personas")
        .insert(personaIds.map((persona_id) => ({ post_id: postId, persona_id })));
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      queryClient.invalidateQueries({ queryKey: ["unified_calendar"] });
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลิงก์ Persona: ${error.message}`);
    },
  });

  return { linkPersonas };
}
