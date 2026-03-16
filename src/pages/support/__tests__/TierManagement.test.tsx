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
    useTierHistory: () => ({ data: [], isLoading: false, isError: false }),
    useLoyaltyTierHistory: () => ({ data: [], isLoading: false, isError: false }),
    usePointsTransactions: () => ({ data: [], isLoading: false, isError: false }),
    useCustomerSearch: () => ({
        query: 'somchai',
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
        isFetching: false
    }),
    useManualTierOverride: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useSuspiciousActivities: () => ({
        data: [{
            id: 'sus1',
            user_id: 'u1',
            activity_type: 'login',
            severity: 'high',
            is_resolved: false,
            created_at: '2023-01-01',
            customer: { full_name: 'คุณศราวุธ มีพิรุธ', email: 'sus@examole.com' }
        }],
        unresolvedCount: 1,
        isLoading: false,
        resolveActivity: { mutate: mockResolveActivity, isPending: false, mutateAsync: vi.fn() },
        suspendCustomer: { mutate: mockSuspendCustomer, isPending: false, mutateAsync: vi.fn() }
    }),
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
        expect(screen.getByPlaceholderText(/ค้นหาด้วยชื่อ/i)).toBeInTheDocument();
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
        expect(screen.getByText('บันทึกการเปลี่ยนแปลง')).toBeInTheDocument();

        // Close dialog
        const cancelBtn = screen.getByText('ยกเลิก');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByText('Manual Tier Override')).not.toBeInTheDocument();
        });
    });

    it('switches tabs correctly', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TierManagement />);

        // Default tab: History
        expect(screen.getByText('ประวัติการเปลี่ยน Tier')).toBeInTheDocument();

        // Switch to Suspicious Activities
        const alertsTab = screen.getByRole('tab', { name: /Suspicious Activities/i });
        await user.click(alertsTab);

        expect(screen.getByText('กิจกรรมที่น่าสงสัยและต้องตรวจสอบ')).toBeInTheDocument();
        expect(screen.getByText('คุณศราวุธ มีพิรุธ')).toBeInTheDocument(); // Mock data in alerts tab
    });

    it('handles suspicious activity actions', async () => {
        const user = userEvent.setup();
        renderWithProviders(<TierManagement />);

        // Switch to Suspicious Activities
        const alertsTab = screen.getByRole('tab', { name: /Suspicious Activities/i });
        await user.click(alertsTab);

        // Click Inspect
        const inspectBtn = screen.getByRole('button', { name: /แก้ไขแล้ว/i });
        await user.click(inspectBtn);

        expect(mockResolveActivity).toHaveBeenCalledWith({ activityId: 'sus1' });

        // Click Suspend
        const suspendBtn = screen.getByRole('button', { name: /ระงับ/i });
        await user.click(suspendBtn);

        expect(mockSuspendCustomer).toHaveBeenCalledWith('u1');
    });
});
