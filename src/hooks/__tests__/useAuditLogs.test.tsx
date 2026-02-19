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
    },
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
                    user_id: 'user1',
                    action_type_id: 'action1',
                    description: 'User logged in',
                    category: 'authentication',
                    status: 'success',
                    created_at: '2024-01-01',
                    action_type: { action_name: 'Login' },
                    metadata: {}
                },
                {
                    id: '2',
                    user_id: 'customer1',
                    action_type_id: 'action2',
                    description: 'Customer action',
                    category: 'data',
                    status: 'success',
                    created_at: '2024-01-02',
                    action_type: { action_name: 'Export' },
                    metadata: {}
                },
            ];

            const mockEmployees = [
                {
                    user_id: 'user1',
                    email: 'employee@example.com',
                    role_employees: { role_name: 'Admin' }
                }
            ];

            const mockCustomers = [
                {
                    id: 'customer1',
                    email: 'customer@example.com',
                    full_name: 'John Customer'
                }
            ];

            // Mock query chain
            const mockQueryBuilder = {
                select: vi.fn(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: mockLogs, error: null }).then(onfulfilled)
            };

            // Mock employees query
            const mockEmployeesQuery = {
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({ data: mockEmployees, error: null })
            };

            // Mock customers query
            const mockCustomersQuery = {
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({ data: mockCustomers, error: null })
            };

            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'audit_logs_enhanced') {
                    // Start of chain
                    mockQueryBuilder.select.mockReturnThis();
                    return mockQueryBuilder as any;
                }
                if (table === 'employees') {
                    return mockEmployeesQuery as any;
                }
                if (table === 'customer') {
                    return mockCustomersQuery as any;
                }
                return { select: vi.fn().mockReturnThis() } as any;
            });

            const { result } = renderHook(() => useAuditLogs(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const logs = result.current.data;
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
                then: (onfulfilled: any) => Promise.resolve({ data: mockLogs, error: null }).then(onfulfilled)
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
            const mockLogs = [
                { category: 'authentication', status: 'success', created_at: '2024-01-01' },
                { category: 'authentication', status: 'success', created_at: '2024-01-01' },
                { category: 'authentication', status: 'failed', created_at: '2024-01-01' },
                { category: 'data', status: 'success', created_at: '2024-01-01' },
                { category: 'security', status: 'success', created_at: '2024-01-01' },
                { category: 'settings', status: 'success', created_at: '2024-01-01' },
            ];

            vi.mocked(supabase.from).mockImplementation((table: string) => {
                if (table === 'audit_logs_enhanced') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        limit: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
                    } as any;
                }
                return {} as any;
            });

            const { result } = renderHook(() => useAuditLogStats(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const stats = result.current.data;
            expect(stats).toEqual({
                total: 6,
                totalLogins: 3,
                successfulLogins: 2,
                failedLogins: 1,
                dataExports: 1,
                securityActions: 1,
                settingsChanges: 1,
            });
        });

        it('should handle empty logs', async () => {
            vi.mocked(supabase.from).mockImplementation((table: string) => {
                if (table === 'audit_logs_enhanced') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                    } as any;
                }
                return {} as any;
            });

            const { result } = renderHook(() => useAuditLogStats(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const stats = result.current.data;
            expect(stats).toEqual({
                total: 0,
                totalLogins: 0,
                successfulLogins: 0,
                failedLogins: 0,
                dataExports: 0,
                securityActions: 0,
                settingsChanges: 0,
            });
        });
    });
});
