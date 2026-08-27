import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@/test/utils/test-utils';
import CustomerTiers from '../CustomerTiers';

import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

vi.mock('@/hooks/useWorkspace', () => ({
    useWorkspace: () => ({ workspace: { id: 'test-workspace' } })
}));

// Mock Recharts
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as any),
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    };
});

describe('CustomerTiers Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // Prevent useEffect from resolving immediately by returning a pending promise or just checking initial render
        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnValue(new Promise(() => { })) // Never resolves
        } as any);

        render(
            
                <CustomerTiers />
            
        );

        expect(screen.getByText(/Loading tier analytics.../i)).toBeInTheDocument();
    });

    it('fetch and renders data correctly', async () => {
        // Mock Tiers
        const mockTiers = [
            { name: 'Bronze', min_points: 0, min_spend_amount: 0 },
            { name: 'Silver', min_points: 1000, min_spend_amount: 1000 },
            { name: 'Gold', min_points: 5000, min_spend_amount: 5000 },
            { name: 'Platinum', min_points: 10000, min_spend_amount: 10000 }
        ];

        // Mock Customers
        const mockCustomers = [
            {
                user_id: '1', first_name: 'John', last_name: 'Doe',
                loyalty_points: {
                    total_points_earned: 500,
                    status: 'active',
                    loyalty_tiers: { name: 'Bronze', badge_color: '#A85823' }
                }
            },
            {
                user_id: '2', first_name: 'Jane', last_name: 'Smith',
                loyalty_points: {
                    total_points_earned: 12000,
                    status: 'active',
                    loyalty_tiers: { name: 'Platinum', badge_color: '#6366F1' }
                }
            }
        ];

        // Mock Transactions
        const mockTxs = [
            { amount: 500, user_id: '1', created_at: new Date().toISOString() },
            { amount: 15000, user_id: '2', created_at: new Date().toISOString() }
        ];

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'loyalty_tiers') {
                return {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockTiers, error: null })
                } as any;
            }
            if (table === 'profile_customers') {
                return {
                    select: vi.fn().mockResolvedValue({ data: mockCustomers, error: null })
                } as any;
            }
            if (table === 'payment_transactions') {
                return {
                    select: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockTxs, error: null })
                } as any;
            }
            if (table === 'tier_history') {
                return {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: [], error: null })
                } as any;
            }
            if (table === 'discounts') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: [], error: null })
                } as any;
            }
            return {} as any;
        });

        render(
            
                <CustomerTiers />
            
        );

        // Wait for Loading to disappear
        await waitFor(() => {
            expect(screen.queryByText(/Loading tier analytics.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Customer Tiers')).toBeInTheDocument();
        // Check Summary Cards
        // Total Customers: 2
        // Total Revenue: 15500 => 16K roughly
        // 15500 / 1000 = 15.5 => 16K
        expect(screen.getByText(/16K/i)).toBeInTheDocument();

        // Check Platinum Distribution Count
        // 1. Locate the tier distribution section by its unique description
        const distributionDesc = screen.getByText('Members segmented by loyalty tier');
        
        // 2. Traverse up to the card root which acts as the logical container for the section
        const distributionSection = distributionDesc.parentElement?.parentElement as HTMLElement;
        
        // 3. Scope the query to this section
        const platinumLabel = within(distributionSection).getByText('Platinum');
        
        // 4. The parent flex container holds both the value and label
        const platinumContainer = platinumLabel.parentElement as HTMLElement;
        expect(platinumContainer).toHaveTextContent('1');

        // Check List of Top Performers
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        // Check Tiers
        expect(screen.getByText('Bronze')).toBeInTheDocument();
        expect(screen.getByText('Platinum')).toBeInTheDocument();
    });
});

