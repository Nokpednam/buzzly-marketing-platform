import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLoyaltyTier, LoyaltyProvider } from '../useLoyaltyTier';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <LoyaltyProvider>{children}</LoyaltyProvider>
    </QueryClientProvider>
);

const { mockSelect, mockFrom } = vi.hoisted(() => {
    const defaultChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
    };

    const mockFrom = vi.fn((table: string) => {
        return defaultChain;
    });

    return {
        mockSelect: defaultChain.select,
        mockFrom,
    };
});

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: mockFrom,
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        })),
        removeChannel: vi.fn(),
        auth: {
            getUser: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
    },
}));

describe('useLoyaltyTier', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockTiers = [
        { id: '1', name: 'Bronze', priority_level: 1, min_points: 0 },
        { id: '2', name: 'Silver', priority_level: 2, min_points: 1000 },
        { id: '3', name: 'Gold', priority_level: 3, min_points: 5000 },
    ];

    const setupMocks = (user = { id: 'test-user' }, profileData = {}, tierData = null) => {
        // Mock Auth
        vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user } } as any);

        // Mock RPC
        const point_balance = (profileData as any).loyalty_points_balance || 0;
        if (tierData) {
            vi.mocked(supabase.rpc).mockResolvedValue({ data: { tier: tierData, point_balance }, error: null } as any);
        } else {
            vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any);
        }

        mockFrom.mockImplementation((table: string) => {
            const chain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn().mockReturnThis(),
            };
            
            if (table === 'loyalty_tiers') {
                chain.order = vi.fn().mockResolvedValue({ data: mockTiers, error: null });
                chain.single = vi.fn().mockResolvedValue({ data: tierData, error: null });
            }
            if (table === 'profile_customers') {
                chain.single = vi.fn().mockResolvedValue({ data: profileData, error: null });
                chain.maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'profile-id' }, error: null });
            }
            if (table === 'loyalty_points') {
                chain.maybeSingle = vi.fn().mockResolvedValue({ data: { point_balance, loyalty_tiers: tierData }, error: null });
            }
            return chain;
        });
    };

    it('should return initial state correctly', async () => {
        setupMocks({ id: 'u1' });
        const { result } = renderHook(() => useLoyaltyTier(), { wrapper });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should fetch user loyalty info', async () => {
        const mockProfile = {
            loyalty_tier_id: '1',
            loyalty_points_balance: 500,
            total_spend_amount: 1000,
            member_since: '2024-01-01',
        };
        const mockTier = mockTiers[0]; // Bronze

        setupMocks({ id: 'u1' }, mockProfile, mockTier);

        const { result } = renderHook(() => useLoyaltyTier(), { wrapper });

        await waitFor(() => {
            expect(result.current.userLoyalty?.points_balance).toBe(500);
            expect(result.current.userLoyalty?.tier?.name).toBe('Bronze');
        });
    });

    it('should calculate next tier correctly', async () => {
        const mockProfile = {
            loyalty_tier_id: '1', // Bronze
            loyalty_points_balance: 500,
        };
        const mockTier = mockTiers[0];

        setupMocks({ id: 'u1' }, mockProfile, mockTier);

        const { result } = renderHook(() => useLoyaltyTier(), { wrapper });

        await waitFor(() => {
            expect(result.current.getNextTier()?.name).toBe('Silver');
        });
    });

    it('should calculate progress correctly', async () => {
        // Bronze (0 pts) -> Silver (1000 pts)
        // User has 500 pts. Progress should be 50%.
        const mockProfile = {
            loyalty_tier_id: '1',
            loyalty_points_balance: 500,
        };
        const mockTier = mockTiers[0];

        setupMocks({ id: 'u1' }, mockProfile, mockTier);

        const { result } = renderHook(() => useLoyaltyTier(), { wrapper });

        await waitFor(() => {
            expect(result.current.getProgressToNextTier()).toBe(50);
        });
    });

    it('should return 100% progress if at max tier', async () => {
        // Gold (Max in mock)
        const mockProfile = {
            loyalty_tier_id: '3',
            loyalty_points_balance: 6000,
        };
        const mockTier = mockTiers[2];

        setupMocks({ id: 'u1' }, mockProfile, mockTier);

        const { result } = renderHook(() => useLoyaltyTier(), { wrapper });

        await waitFor(() => {
            // No tier > Gold (priority 3)
            expect(result.current.getNextTier()).toBeNull();
            expect(result.current.getProgressToNextTier()).toBe(100);
        });
    });
});
