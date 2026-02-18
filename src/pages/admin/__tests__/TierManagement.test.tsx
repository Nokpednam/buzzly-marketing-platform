import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TierManagement from '../TierManagement';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
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
        render(<TierManagement />);
        expect(screen.getByText('Tier Management')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ค้นหาด้วยชื่อ/i)).toBeInTheDocument();
    });

    it('filters customers based on search query', async () => {
        const user = userEvent.setup();
        render(<TierManagement />);

        const searchInput = screen.getByPlaceholderText(/ค้นหาด้วยชื่อ/i);

        // Type "somchai" (matches mock data)
        await user.type(searchInput, 'somchai');

        // Check if result appears
        await waitFor(() => {
            expect(screen.getByText('คุณสมชาย ใจดี')).toBeInTheDocument();
        });

        // Type nonsense
        await user.clear(searchInput);
        await user.type(searchInput, 'xyz_loading_non_existent');

        // Check if result disappears
        await waitFor(() => {
            expect(screen.queryByText('คุณสมชาย ใจดี')).not.toBeInTheDocument();
        });
    });

    it('selects a customer and shows details', async () => {
        const user = userEvent.setup();
        render(<TierManagement />);

        const searchInput = screen.getByPlaceholderText(/ค้นหาด้วยชื่อ/i);
        await user.type(searchInput, 'somchai');

        const customerRow = await screen.findByText('คุณสมชาย ใจดี');
        await user.click(customerRow);

        // Check details card
        expect(screen.getByText('Manual Override')).toBeInTheDocument();
        expect(screen.getByText('Total Spend')).toBeInTheDocument();

        // Check specific data points from mock
        expect(screen.getByText('somchai@example.com')).toBeInTheDocument();
    });

    it('opens and closes manual override dialog', async () => {
        const user = userEvent.setup();
        render(<TierManagement />);

        // Select customer first
        const searchInput = screen.getByPlaceholderText(/ค้นหาด้วยชื่อ/i);
        await user.type(searchInput, 'somchai');
        await user.click(await screen.findByText('คุณสมชาย ใจดี'));

        // Open dialog
        const overrideBtn = screen.getByText('Manual Override');
        await user.click(overrideBtn);

        expect(screen.getByText('Manual Tier Override')).toBeInTheDocument();
        expect(screen.getByText('บันทึกการเปลี่ยนแปลง')).toBeInTheDocument();

        // Close dialog
        const cancelBtn = screen.getByText('ยกเลิก');
        await user.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByText('Manual Tier Override')).not.toBeInTheDocument();
        });
    });

    it('switches tabs correctly', async () => {
        const user = userEvent.setup();
        render(<TierManagement />);

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
        render(<TierManagement />);

        // Switch to Suspicious Activities
        const alertsTab = screen.getByRole('tab', { name: /Suspicious Activities/i });
        await user.click(alertsTab);

        // Click Inspect
        const inspectBtn = screen.getAllByText('ตรวจสอบ')[0];
        await user.click(inspectBtn);

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'ตรวจสอบกิจกรรม',
            description: expect.stringContaining('กำลังเปิดรายละเอียดกิจกรรม'),
        }));

        // Click Suspend
        const suspendBtn = screen.getAllByText('ระงับ')[0];
        await user.click(suspendBtn);

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'ระงับบัญชีผู้ใช้',
            variant: 'destructive',
        }));
    });
});
