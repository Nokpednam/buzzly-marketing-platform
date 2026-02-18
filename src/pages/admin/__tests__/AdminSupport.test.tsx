import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSupport from '../AdminSupport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/services/errorLogger';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: mockSelect,
        })),
    },
}));

// Mock error logger
vi.mock('@/services/errorLogger', () => ({
    logError: vi.fn(),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AdminSupport', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();

        // Setup default mock chain
        mockSelect.mockReturnValue({ order: mockOrder });
        mockOrder.mockReturnValue({ limit: mockLimit });
        mockLimit.mockResolvedValue({ data: [], error: null });
        mockEq.mockResolvedValue({ data: [], error: null }); // In case eq is used
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <AdminSupport />
            </QueryClientProvider>
        );
    };

    it('renders support page title and stats', async () => {
        renderComponent();
        expect(screen.getByText('Support & Error Logs')).toBeInTheDocument();
        expect(screen.getByText('Monitor and analyze system errors and issues')).toBeInTheDocument();
        expect(screen.getByText('Total Logs')).toBeInTheDocument();
        expect(screen.getByText('Errors')).toBeInTheDocument();
    });

    it('renders error logs from supabase', async () => {
        const mockLogs = [
            {
                id: '1',
                level: 'error',
                message: 'Test Error Message',
                user_id: 'user-123',
                request_id: 'req-456',
                created_at: new Date().toISOString(),
                stack_trace: 'Error stack...',
                metadata: { info: 'test' },
            },
        ];

        mockLimit.mockResolvedValueOnce({ data: mockLogs, error: null });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Test Error Message')).toBeInTheDocument();
            expect(screen.getByText('user-123...')).toBeInTheDocument();
            expect(screen.getByText('req-456...')).toBeInTheDocument();
        });
    });

    it('filters logs by search query', async () => {
        const mockLogs = [
            {
                id: '1',
                level: 'error',
                message: 'Unique Error',
                user_id: 'u1',
                request_id: 'r1',
                created_at: new Date().toISOString(),
            },
            {
                id: '2',
                level: 'info',
                message: 'Common Info',
                user_id: 'u2',
                request_id: 'r2',
                created_at: new Date().toISOString(),
            },
        ];

        mockLimit.mockResolvedValue({ data: mockLogs, error: null });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Unique Error')).toBeInTheDocument();
            expect(screen.getByText('Common Info')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search by message, request ID, or user ID...');
        fireEvent.change(searchInput, { target: { value: 'Unique' } });

        await waitFor(() => {
            expect(screen.getByText('Unique Error')).toBeInTheDocument();
            expect(screen.queryByText('Common Info')).not.toBeInTheDocument();
        });
    });

    it('handles simulate error button', async () => {
        renderComponent();

        const testErrorButton = screen.getByRole('button', { name: /Test Error/i });
        fireEvent.click(testErrorButton);

        await waitFor(() => {
            expect(logError).toHaveBeenCalledWith(
                'Manual Test Error Verification',
                expect.any(Error),
                expect.objectContaining({
                    component: 'AdminSupport',
                    action: 'simulate_error',
                })
            );
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Error Logged',
                })
            );
        });
    });

    it('opens details dialog when clicking details button', async () => {
        const mockLogs = [
            {
                id: '1',
                level: 'error',
                message: 'Detail Test Error',
                user_id: 'u1',
                request_id: 'r1',
                created_at: new Date().toISOString(),
                stack_trace: 'Detailed stack trace',
                metadata: { key: 'value' },
            },
        ];

        mockLimit.mockResolvedValue({ data: mockLogs, error: null });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Detail Test Error')).toBeInTheDocument();
        });

        const detailsButton = screen.getByRole('button', { name: /Details/i });
        fireEvent.click(detailsButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Error Log Details')).toBeInTheDocument();
            expect(screen.getByText('Detailed stack trace')).toBeInTheDocument();
        });
    });
});
