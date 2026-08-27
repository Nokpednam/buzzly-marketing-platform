import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuditLogs, useAuditLogStats } from '../useAuditLogs';
import { supabase } from '@/integrations/supabase/client';
import type { ReactNode } from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
    }
}));

describe('useAuditLogs', () => {
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
    });

    describe('useAuditLogs Data Fetching', () => {
        it('should fetch audit logs and map user details correctly (employees and customers)', async () => {
            const mockLogs = [
                {
                    id: '1',
                    user_email: 'employee@example.com',
                    user_role: 'Admin',
                    description: 'User logged in',
                    category: 'authentication',
                    status: 'success',
                },
                {
                    id: '2',
                    user_email: 'customer@example.com',
                    user_role: 'Customer',
                    description: 'Customer action',
                    category: 'data',
                    status: 'success',
                },
            ];

            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                range: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: mockLogs, error: null, count: mockLogs.length }).then(onfulfilled)
            };

            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'audit_logs_view') {
                    return mockQueryBuilder as any;
                }
                return { select: vi.fn().mockReturnThis() } as any;
            });

            const { result } = renderHook(() => useAuditLogs(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const logs = result.current.data?.logs;
            expect(logs).toHaveLength(2);

            // Employee
            expect(logs![0].user_email).toBe('employee@example.com');
            expect(logs![0].user_role).toBe('Admin');

            // Customer
            expect(logs![1].user_email).toBe('customer@example.com');
            expect(logs![1].user_role).toBe('Customer');
        });

        it('should use correct query key and mapping for category', async () => {
            const mockLogs = [
                { category: 'auth', status: 'success' }
            ];

            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                range: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: mockLogs, error: null, count: 1 }).then(onfulfilled)
            };

            vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as any);

            const { result } = renderHook(() => useAuditLogs('authentication'), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // Verify .in was called with mapped categories
            expect(mockQueryBuilder.in).toHaveBeenCalledWith('category', expect.arrayContaining(['authentication', 'auth', 'login']));
        });
    });

    describe('useAuditLogStats', () => {
        it('should calculate stats correctly', async () => {
            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: null, error: null, count: 3 }).then(onfulfilled)
            };

            vi.mocked(supabase.from).mockImplementation((table: string) => {
                if (table === 'audit_logs_enhanced') {
                    return mockQueryBuilder as any;
                }
                return {} as any;
            });

            const { result } = renderHook(() => useAuditLogStats(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const stats = result.current.data;
            expect(stats).toEqual({
                totalLogins: 3,
                failedLogins: 3,
                dataExports: 3,
                securityActions: 3,
                settingsChanges: 3,
                featureViews: 3,
            });
        });

        it('should handle empty logs', async () => {
            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: null, error: null, count: 0 }).then(onfulfilled)
            };

            vi.mocked(supabase.from).mockImplementation((table: string) => {
                if (table === 'audit_logs_enhanced') {
                    return mockQueryBuilder as any;
                }
                return {} as any;
            });

            const { result } = renderHook(() => useAuditLogStats(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const stats = result.current.data;
            expect(stats).toEqual({
                totalLogins: 0,
                failedLogins: 0,
                dataExports: 0,
                securityActions: 0,
                settingsChanges: 0,
                featureViews: 0,
            });
        });
    });
});
