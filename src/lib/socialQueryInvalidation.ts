import type { QueryClient } from "@tanstack/react-query";

export const invalidateSocialRealtimeQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["social_posts"] }),
    queryClient.invalidateQueries({ queryKey: ["social_comments"] }),
    queryClient.invalidateQueries({ queryKey: ["social_inbox"] }),
    queryClient.invalidateQueries({ queryKey: ["social_calendar"] }),
    queryClient.invalidateQueries({ queryKey: ["unified_calendar"] }),
    queryClient.invalidateQueries({ queryKey: ["ads"] }),
    queryClient.invalidateQueries({ queryKey: ["ad-groups"] }),
    queryClient.invalidateQueries({ queryKey: ["audience-discovery"] }),
  ]);
};
