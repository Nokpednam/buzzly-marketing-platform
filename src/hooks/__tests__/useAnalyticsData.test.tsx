import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalyticsData } from '../useAnalyticsData';
import { supabase } from '@/integrations/supabase/client';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useAnalyticsData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and return analytics data', async () => {
        // Mock data
        const mockCohortData = [
            {
                cohort_date: '2026-01-01',
                cohort_type: 'weekly',
                cohort_size: 100,
                retention_data: { week1: 90, week2: 80 },
                revenue_data: { week1: 1000, week2: 900 },
                average_retention: 0.85,
                churn_rate: 0.15,
                lifetime_value: 50,
            },
        ];

        const mockActivities = [
            {
                id: '1',
                event_type_id: 'event1',
                profile_customer_id: 'customer1',
                campaign_id: 'campaign1',
                device_type: 'mobile',
                browser: 'chrome',
                page_url: '/dashboard',
                referrer_url: '/home',
                created_at: '2026-02-01T00:00:00Z',
                event_data: { action: 'click' },
            },
        ];

        const mockConversions = [
            {
                id: '1',
                event_name: 'purchase',
                event_value: 99.99,
                occurred_at: '2026-02-01T00:00:00Z',
                processing_status: 'completed',
                ads_id: 'ad1',
            },
        ];

        // Mock Supabase responses
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'cohort_analysis') {
                return {
                    select: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    order: vi.fn(() => Promise.resolve({ data: mockCohortData, error: null })),
                } as any;
            }
            if (table === 'customer_activities') {
                return {
                    select: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    limit: vi.fn(() => Promise.resolve({ data: mockActivities, error: null })),
                } as any;
            }
            if (table === 'conversion_events') {
                return {
                    select: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    limit: vi.fn(() => Promise.resolve({ data: mockConversions, error: null })),
                } as any;
            }
            if (table === 'event_types') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
                } as any;
            }
            return {} as any;
        });

        const { result } = renderHook(() => useAnalyticsData('30d'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.cohortData).toHaveLength(1);
        expect(result.current.customerActivities).toHaveLength(1);
        expect(result.current.conversionEvents).toHaveLength(1);
        expect(result.current.aggregatedMetrics.totalActivities).toBe(1);
        expect(result.current.aggregatedMetrics.totalConversions).toBe(1);
    });

    it('should calculate aggregated metrics correctly', async () => {
        const mockCohortData = [
            {
                cohort_date: '2026-01-01',
                cohort_type: 'weekly',
                cohort_size: 100,
                retention_data: {},
                revenue_data: {},
                average_retention: 0.8,
                churn_rate: 0.2,
                lifetime_value: 100,
            },
            {
                cohort_date: '2026-01-08',
                cohort_type: 'weekly',
                cohort_size: 120,
                retention_data: {},
                revenue_data: {},
                average_retention: 0.6,
                churn_rate: 0.4,
                lifetime_value: 80,
            },
        ];

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'cohort_analysis') {
                return {
                    select: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    order: vi.fn(() => Promise.resolve({ data: mockCohortData, error: null })),
                } as any;
            }
            return {
                select: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            } as any;
        });

        const { result } = renderHook(() => useAnalyticsData('30d'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.aggregatedMetrics.avgRetention).toBe(0.7);
        expect(result.current.aggregatedMetrics.avgChurnRate).toBeCloseTo(0.3, 10);
        expect(result.current.aggregatedMetrics.avgLTV).toBe(90);
    });

    it('should handle different date ranges', async () => {
        vi.mocked(supabase.from).mockImplementation(() => ({
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        }) as any);

        const { result: result7d } = renderHook(() => useAnalyticsData('7d'), {
            wrapper: createWrapper(),
        });

        const { result: result90d } = renderHook(() => useAnalyticsData('90d'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result7d.current.isLoading).toBe(false);
            expect(result90d.current.isLoading).toBe(false);
        });

        // Verify both hooks loaded successfully
        expect(result7d.current.cohortData).toBeDefined();
        expect(result90d.current.cohortData).toBeDefined();
    });
});
