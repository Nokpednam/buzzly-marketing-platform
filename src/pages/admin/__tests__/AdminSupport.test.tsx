import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminSupport from '../AdminSupport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/services/errorLogger';
import { useAdminLogStats } from '@/hooks/useAdminSupport';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();

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

// Mock hooks
vi.mock('@/hooks/useAdminSupport', async () => {
    const actual = await vi.importActual('@/hooks/useAdminSupport');
    return {
        ...actual as any,
        useAdminLogStats: vi.fn(),
    };
});

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

        // Create a mock builder that handles chaining nicely
        const mockBuilder = {
            select: mockSelect,
            order: mockOrder,
            limit: mockLimit,
            eq: mockEq,
            in: mockIn,
            then: (resolve: any) => resolve({ data: [], count: 0, error: null })
        };

        // Setup mock implementations
        mockSelect.mockReturnValue(mockBuilder);
        mockOrder.mockReturnValue(mockBuilder);
        mockLimit.mockReturnValue(mockBuilder);
        mockEq.mockReturnValue(mockBuilder);
        mockIn.mockReturnValue(mockBuilder);

        // Default stats mock
        (useAdminLogStats as any).mockReturnValue({
            data: {
                total: 0,
                critical: 0,
                error: 0,
                warning: 0,
                info: 0
            },
            isLoading: false
        });
    });

    // Helper to mock Supabase response while maintaining builder chain
    const mockSupabaseResponse = (response: any) => {
        const builder = {
            eq: mockEq,
            order: mockOrder,
            limit: mockLimit,
            in: mockIn,
            then: (resolve: any) => resolve(response)
        };
        mockLimit.mockReturnValue(builder);
    };

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
        // Use regex for robust finding of text next to icon
        expect(screen.getByRole('heading', { name: /Critical/i })).toBeInTheDocument();
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

        mockSupabaseResponse({ data: mockLogs, error: null });

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

        mockSupabaseResponse({ data: mockLogs, error: null });

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

    it('filters logs by critical level', async () => {
        const mockLogs = [
            {
                id: '1',
                level: 'critical',
                message: 'Critical Error',
                user_id: 'u1',
                request_id: 'r1',
                created_at: new Date().toISOString(),
            },
            {
                id: '2',
                level: 'error',
                message: 'Normal Error',
                user_id: 'u2',
                request_id: 'r2',
                created_at: new Date().toISOString(),
            },
        ];

        // Mock stats response - should be constant regardless of filter
        (useAdminLogStats as any).mockReturnValue({
            data: {
                total: 10,
                critical: 5,
                error: 3,
                warning: 1,
                info: 1
            },
            isLoading: false
        });

        // First call with default (all)
        const builder1 = {
            eq: mockEq,
            in: mockIn,
            then: (resolve: any) => resolve({ data: mockLogs, error: null })
        };

        // Second call with critical filter
        const builder2 = {
            eq: mockEq,
            in: mockIn,
            then: (resolve: any) => resolve({ data: [mockLogs[0]], error: null })
        };

        mockLimit.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

        renderComponent();

        await waitFor(() => {
            // Stats should show total 10 even if logs are just 2 in the unfiltered mock
            expect(screen.getByText('10')).toBeInTheDocument(); // Total
            expect(screen.getByText('5')).toBeInTheDocument();  // Critical Stats

            // Logs in table
            expect(screen.getByText('Critical Error')).toBeInTheDocument();
            expect(screen.getByText('Normal Error')).toBeInTheDocument();
        });

        // Open filter dropdown (combobox trigger)
        const filterTrigger = screen.getByRole('combobox');
        fireEvent.click(filterTrigger);

        // Select Critical Only
        const criticalOption = screen.getByText('Critical Only');
        fireEvent.click(criticalOption);

        await waitFor(() => {
            expect(mockEq).toHaveBeenCalledWith('level', 'critical');
            // Stats should definitely still verify as present/unchanged visually
            expect(screen.getByText('10')).toBeInTheDocument();
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

        mockSupabaseResponse({ data: mockLogs, error: null });

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
