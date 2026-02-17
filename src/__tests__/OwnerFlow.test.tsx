import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OwnerLayout } from '@/components/owner/OwnerLayout';
import BusinessPerformance from '@/pages/owner/BusinessPerformance';
import ProductUsage from '@/pages/owner/ProductUsage';

// Mock Supabase client basic
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    },
}));

// Mock Recharts to avoid rendering issues
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as any),
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    };
});

// Mock UI components
vi.mock('@/components/ui/toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

// Mock Custom Hooks to avoid complex Supabase chaining in integration test
// We mock ALL hooks used by BusinessPerformance and ProductUsage to ensure they render
vi.mock('@/hooks/useOwnerMetrics', () => ({
    useProductUsageMetrics: () => ({
        data: { totalUsers: 100, dau: 50, mau: 80, dauMauRatio: 62 },
        isLoading: false
    }),
    useUserSegments: () => ({
        data: [{ type: 'Enterprise', count: 10, percentage: 10 }],
        isLoading: false
    }),
    useSubscriptionMetrics: () => ({
        data: {
            currentMrr: 1000,
            previousMrr: 900,
            mrrGrowth: 10,
            activeSubscriptions: 20,
            arr: 12000,
            monthlyData: [],
            breakdown: { newMrr: 100, expansion: 0, churn: 0 }
        },
        isLoading: false
    }),
    useCohortAnalysis: () => ({
        data: [],
        isLoading: false
    }),
    useSurvivalAnalysis: () => ({
        data: [],
        isLoading: false
    }),
    useFeedbackMetrics: () => ({ // Used in UserFeedback but good to mock if safe
        data: { avgRating: 4.5, npsScore: 50, totalReviews: 10, openIssues: 0, sentimentBreakdown: [] },
        isLoading: false
    })
}));

vi.mock('@/hooks/useFunnelData', () => ({
    useFunnelData: () => ({
        funnelStages: [],
        aarrrCategories: [],
        isLoading: false
    })
}));

vi.mock('@/hooks/usePersonas', () => ({
    usePersonas: () => ({
        personas: [],
        isLoading: false,
        createPersona: { mutateAsync: vi.fn() },
        deletePersona: { mutateAsync: vi.fn() }
    })
}));

vi.mock('@/hooks/useUserFeedback', () => ({ // Just in case used somewhere
    useFeedbackList: () => ({ data: [], isLoading: false })
}));

describe('Owner Integration Flow', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        const { supabase } = await import('@/integrations/supabase/client');

        // Setup default user
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
            data: {
                user: { email: 'owner@buzzly.com' }
            },
            error: null
        } as any);

        // No need to mock supabase.from implementation because hooks are mocked!
        // This is much safer for integration testing UI flow.
    });

    it('navigates between Business Performance and Product Usage', async () => {
        const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/owner/business-performance']}>
                    <Routes>
                        <Route path="/owner" element={<OwnerLayout />}>
                            <Route path="business-performance" element={<BusinessPerformance />} />
                            <Route path="product-usage" element={<ProductUsage />} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Check initial page - Business Performance (H1)
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Business Performance', level: 1 })).toBeInTheDocument();
        });

        // Find navigation link for Product Usage in Sidebar
        const productUsageLink = screen.getByRole('link', { name: /Product Usage/i });
        expect(productUsageLink).toBeInTheDocument();

        fireEvent.click(productUsageLink);

        // Verify navigation to Product Usage (H1)
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Product Usage', level: 1 })).toBeInTheDocument();
        }, { timeout: 3000 });

        // Verify content from mock hook is rendered
        expect(screen.getByText('Total Users')).toBeInTheDocument(); // Statistic card
    });
});
