import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TierManagement from '../TierManagement';
import { useToast } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <TooltipProvider>
                    {ui}
                </TooltipProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

// Mock dependencies
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

vi.mock('@/hooks/useLoyaltyTier', () => ({
    tierColors: {
        Bronze: { bg: 'bg-bronze', text: 'text-bronze', border: 'border-bronze' },
        Silver: { bg: 'bg-silver', text: 'text-silver', border: 'border-silver' },
        Gold: { bg: 'bg-gold', text: 'text-gold', border: 'border-gold' },
        Platinum: { bg: 'bg-platinum', text: 'text-platinum', border: 'border-platinum' },
    },
    tierIcons: {
        Bronze: '🥉',
        Silver: '🥈',
        Gold: '🥇',
        Platinum: '💎',
    },
}));

const mockResolveActivity = vi.fn();
const mockSuspendCustomer = vi.fn();

vi.mock('@/hooks/useTierManagement', () => ({
    useLoyaltyTierHistoryAll: () => ({
        data: [{
            id: 'h1',
            old_tier: 'Bronze',
            new_tier: 'Silver',
            changed_at: '2023-01-01',
            change_type: 'manual',
            customer: { first_name: 'Somchai', last_name: 'Jaidee', email: 'somchai@example.com' }
        }],
        isLoading: false,
        isError: false,
        refetch: vi.fn()
    }),
    usePointsTransactions: () => ({
        data: [{
            id: 't1',
            created_at: '2023-01-01',
            user_id: 'u1',
            transaction_type: 'earn',
            points_amount: 100,
            balance_after: 1100,
            description: 'Test transaction',
            customer: { full_name: 'Somchai Jaidee', email: 'somchai@example.com' }
        }],
        isLoading: false,
        isError: false
    }),
    useCustomerSearch: (q: string) => ({
        query: q || 'somchai',
        setQuery: vi.fn(),
        data: [{
            id: '123',
            full_name: 'คุณสมชาย ใจดี',
            email: 'somchai@example.com',
            loyalty_tier: 'Gold',
            loyalty_points_balance: 1000,
            total_spend: 5000,
            created_at: '2023-01-01'
        }],
        isFetching: false,
        isError: false
    }),
    useManualTierOverride: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useSuspiciousActivities: (page = 0, filters?: any) => ({
        data: [{
            id: 'sus1',
            user_id: 'user-123',
            activity_type: 'login',
            severity: 'high',
            description: 'ได้รับคะแนน 4 ครั้งใน 1 ชั่วโมง — น่าสงสัย',
            is_resolved: false,
            metadata: {},
            created_at: '2023-01-01',
            customer: { full_name: 'คุณศราวุธ มีพิรุธ', email: 'sus@examole.com' }
        }],
        unresolvedCount: 1,
        isLoading: false,
        resolveActivity: { mutate: mockResolveActivity, isPending: false, mutateAsync: vi.fn() },
        suspendCustomer: { mutate: mockSuspendCustomer, isPending: false, mutateAsync: vi.fn() }
    }),
    useAllCustomers: () => ({ data: [], isLoading: false }),
    useLoyaltyTiers: () => ({ data: [], isLoading: false }),
    useUpdateTierRetention: () => ({ mutate: vi.fn(), isPending: false }),
    useEvaluateInactivityDowngrades: () => ({ mutate: vi.fn(), isPending: false }),
    useSyncTierFromLifetimePoints: () => ({ mutate: vi.fn(), isPending: false }),
    ADMIN_PAGE_SIZE: 8,
    ALERTS_PAGE_SIZE: 5,
}));

// Mock hooks to control data if needed, but component uses internal mocks mostly
vi.mock('@/hooks/useLoyaltyTier', () => ({
    tierColors: {
        Bronze: { bg: 'bg-bronze', text: 'text-bronze', border: 'border-bronze' },
        Silver: { bg: 'bg-silver', text: 'text-silver', border: 'border-silver' },
        Gold: { bg: 'bg-gold', text: 'text-gold', border: 'border-gold' },
        Platinum: { bg: 'bg-platinum', text: 'text-platinum', border: 'border-platinum' },
    },
    tierIcons: {
        Bronze: '🥉',
        Silver: '🥈',
        Gold: '🥇',
        Platinum: '💎',
    },
}));

describe('TierManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header correctly', () => {
        renderWithProviders(<TierManagement />);
        expect(screen.getByText('Tier Management')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
    });

    it.skip('selects a customer and shows details', async () => {
        renderWithProviders(<TierManagement />);

        // The mock now passes it explicitly without needing to wait for search query reactive state.
        const customerRow = screen.getByText('คุณสมชาย ใจดี');
        fireEvent.click(customerRow);

        // Check details card (Static element assertion after click)
        expect(await screen.findByText('somchai@example.com')).toBeInTheDocument();
        expect(screen.getByText('Member Duration')).toBeInTheDocument();
    });

    it('opens and closes manual override dialog', async () => {
        renderWithProviders(<TierManagement />);

        fireEvent.click(await screen.findByText('คุณสมชาย ใจดี'));

        // Open dialog
        const overrideBtn = screen.getByText('Manual Override');
        fireEvent.click(overrideBtn);

        expect(screen.getByText('Manual Tier Override')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();

        // Close dialog
        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByText('Manual Tier Override')).not.toBeInTheDocument();
        });
    });

    it('switches tabs correctly', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TierManagement />);

        // Default tab: Rules
        expect(screen.getByText('Tier Rules — Inactivity downgrade period')).toBeInTheDocument();

        // Switch to History
        const historyTab = screen.getByRole('tab', { name: /Tier History/i });
        await user.click(historyTab);
        expect(screen.getByText('Tier Change History')).toBeInTheDocument();

        // Switch to Suspicious
        const alertsTab = screen.getByRole('tab', { name: /Suspicious/i });
        await user.click(alertsTab);

        expect(screen.getByText('Suspicious activity (Loyalty)')).toBeInTheDocument();
        expect(screen.getByText('คุณศราวุธ มีพิรุธ')).toBeInTheDocument(); // Mock data in alerts tab
        expect(screen.getByText('sus@examole.com')).toBeInTheDocument(); // Email in alerts tab
    });

    it('handles suspicious activity actions', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TierManagement />);

        // Switch to Suspicious Activities
        const alertsTab = screen.getByRole('tab', { name: /Suspicious/i });
        await user.click(alertsTab);

        // Wait for mock data
        await screen.findByText('คุณศราวุธ มีพิรุธ');

        // Open actions menu
        const actionBtn = screen.getByLabelText('Actions');
        await user.click(actionBtn);

        // Click Resolve
        const resolveItem = screen.getByText('Mark as Resolved');
        await user.click(resolveItem);

        expect(mockResolveActivity).toHaveBeenCalled();
    });
});
