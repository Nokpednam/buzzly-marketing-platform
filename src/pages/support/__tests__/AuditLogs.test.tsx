import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuditLogs from '../AuditLogs';
import * as useAuditLogsHook from '@/hooks/useAuditLogs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('@/hooks/useAuditLogs', () => ({
    useAuditLogs: vi.fn(),
    useAuditLogStats: vi.fn(),
}));

describe('AuditLogs', () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        vi.clearAllMocks();

        // Default mock implementations
        vi.mocked(useAuditLogsHook.useAuditLogStats).mockReturnValue({
            data: {
                totalLogins: 10,
                failedLogins: 2,
                dataExports: 5,
                securityActions: 1,
                settingsChanges: 3,
            },
            isLoading: false,
            refetch: vi.fn(),
        } as any);

        vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
            data: [],
            isLoading: false,
            refetch: vi.fn(),
        } as any);
    });

    it('should render the audit logs header and stats', () => {
        render(<AuditLogs />, { wrapper });

        expect(screen.getByText('Audit Logs')).toBeInTheDocument();
        expect(screen.getByText('Total Logins')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Stats
        expect(screen.getByText('Failed Logins')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display loading state', () => {
        vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
            data: [],
            isLoading: true,
            refetch: vi.fn(),
        } as any);

        render(<AuditLogs />, { wrapper });

        expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
    });

    it('should display logs in the table', () => {
        const mockLogs = [
            {
                id: '1',
                action_name: 'Login',
                category: 'authentication',
                description: 'User login success',
                user_email: 'test@example.com',
                user_role: 'Admin',
                status: 'success',
                ip_address: '127.0.0.1',
                created_at: new Date().toISOString(),
            },
        ];

        vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
            data: mockLogs,
            isLoading: false,
            refetch: vi.fn(),
        } as any);

        render(<AuditLogs />, { wrapper });

        expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
        expect(screen.getByText('User login success')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should filter logs by client-side search', async () => {
        const mockLogs = [
            { id: '1', action_name: 'Login', description: 'User login', user_email: 'a@test.com' },
            { id: '2', action_name: 'Export', description: 'Data export', user_email: 'b@test.com' },
        ];

        vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
            data: mockLogs,
            isLoading: false,
            refetch: vi.fn(),
        } as any);

        const user = userEvent.setup();
        render(<AuditLogs />, { wrapper });

        const searchInput = screen.getByPlaceholderText(/ค้นหาตามรายละเอียด/i);
        await user.type(searchInput, 'Export');

        expect(screen.queryByText('User login')).not.toBeInTheDocument();
        expect(screen.getByText('Data export')).toBeInTheDocument();
    });

    it('should call refetch when refresh button is clicked', async () => {
        const refetchMock = vi.fn();
        vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
            data: [],
            isLoading: false,
            refetch: refetchMock,
        } as any);

        const user = userEvent.setup();
        render(<AuditLogs />, { wrapper });

        const refreshButton = screen.getByText('Refresh');
        await user.click(refreshButton);

        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
        });
    });
});
