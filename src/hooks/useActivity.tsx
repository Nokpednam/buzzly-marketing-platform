
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useActivity = () => {
    const trackActivity = useCallback(async (eventTypeSlug: string, eventData?: any, pageUrl?: string) => {
        try {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Not logged in

            // 2. Get Profile ID
            const { data: profile } = await supabase
                .from('profile_customers')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!profile) {
                console.warn('No profile found for tracking activity');
                return;
            }

            // 3. Get Event Type ID
            const { data: eventType } = await supabase
                .from('event_types')
                .select('id')
                .eq('slug', eventTypeSlug)
                .single();

            if (!eventType) {
                console.warn(`Event type '${eventTypeSlug}' not found`);
                return;
            }

            // 4. Insert Activity
            const { error } = await supabase
                .from('customer_activities')
                .insert({
                    profile_customer_id: profile.id,
                    event_type_id: eventType.id,
                    event_data: eventData || {},
                    page_url: pageUrl || window.location.pathname,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    browser: navigator.userAgent.substring(0, 100) // Simple browser string
                });

            if (error) throw error;

        } catch (error) {
            console.error('Failed to track activity:', error);
            // Optional: don't toast on background tracking errors to avoid annoying user
        }
    }, []);

    return { trackActivity };
};
