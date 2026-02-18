import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLoyaltyTier } from '../useLoyaltyTier';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({
    select: mockSelect,
    update: vi.fn(() => ({ eq: vi.fn() })),
}));

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: mockFrom,
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

        // Mock Tiers fetch
        mockSelect.mockReturnValueOnce({ // For loyalty_tiers (fetchAllTiers)
            eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockTiers, error: null })
            })
        });

        // Mock Profile fetch
        mockSelect.mockReturnValueOnce({ // For customer profile
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: profileData, error: null })
            })
        });

        if (profileData && (profileData as any).loyalty_tier_id) {
            // Mock Tier detail fetch if user has a tier
            mockSelect.mockReturnValueOnce({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: tierData, error: null })
                })
            });
        }
    };

    it('should return initial state correctly', async () => {
        setupMocks({ id: 'u1' });
        const { result } = renderHook(() => useLoyaltyTier());

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

        const { result } = renderHook(() => useLoyaltyTier());

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

        const { result } = renderHook(() => useLoyaltyTier());

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

        const { result } = renderHook(() => useLoyaltyTier());

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

        const { result } = renderHook(() => useLoyaltyTier());

        await waitFor(() => {
            // No tier > Gold (priority 3)
            expect(result.current.getNextTier()).toBeNull();
            expect(result.current.getProgressToNextTier()).toBe(100);
        });
    });
});
