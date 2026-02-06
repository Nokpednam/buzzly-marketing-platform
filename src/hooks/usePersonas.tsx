import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PersonaDefinition = Database["public"]["Tables"]["persona_definition"]["Row"];

export interface CreatePersonaInput {
    name: string;
    description?: string;
    demographics?: any;
    behaviors?: any;
    characteristics?: any;
}

export function usePersonas() {
    const queryClient = useQueryClient();

    const { data: personas = [], isLoading } = useQuery({
        queryKey: ["personas"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("persona_definition")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as PersonaDefinition[];
        },
    });

    const createPersona = useMutation({
        mutationFn: async (input: CreatePersonaInput) => {
            const { data, error } = await supabase
                .from("persona_definition")
                .insert({
                    name: input.name,
                    description: input.description,
                    demographics: input.demographics || {},
                    behaviors: input.behaviors || {},
                    characteristics: input.characteristics || {},
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personas"] });
        },
    });

    const deletePersona = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("persona_definition")
                .update({ is_active: false })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personas"] });
        },
    });

    return {
        personas,
        isLoading,
        createPersona,
        deletePersona,
    };
}
