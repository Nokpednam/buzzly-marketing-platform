import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserFeedback from '../UserFeedback';
import { BrowserRouter } from 'react-router-dom';
import * as OwnerMetricsHooks from '@/hooks/useOwnerMetrics';

// Mock hooks
vi.mock('@/hooks/useOwnerMetrics', () => ({
    useFeedbackMetrics: vi.fn(),
    useFeedbackList: vi.fn(),
}));

// Mock Recharts
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as any),
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    };
});

describe('UserFeedback Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        vi.mocked(OwnerMetricsHooks.useFeedbackMetrics).mockReturnValue({ isLoading: true } as any);
        vi.mocked(OwnerMetricsHooks.useFeedbackList).mockReturnValue({ isLoading: false } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <UserFeedback />
                </div>
            </BrowserRouter>
        );

        expect(screen.getByText(/Loading Feedback Data.../i)).toBeInTheDocument();
    });

    it('renders empty state', () => {
        vi.mocked(OwnerMetricsHooks.useFeedbackMetrics).mockReturnValue({
            isLoading: false,
            data: { totalReviews: 0 }
        } as any);
        vi.mocked(OwnerMetricsHooks.useFeedbackList).mockReturnValue({
            isLoading: false,
            data: []
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <UserFeedback />
                </div>
            </BrowserRouter>
        );

        expect(screen.getByText(/No Feedback Data Found/i)).toBeInTheDocument();
    });

    it('renders populated dashboard', () => {
        vi.mocked(OwnerMetricsHooks.useFeedbackMetrics).mockReturnValue({
            isLoading: false,
            data: {
                totalReviews: 100,
                avgRating: 4.5,
                npsScore: 50,
                openIssues: 5,
                sentimentBreakdown: [
                    { sentiment: 'Positive', count: 70, percentage: 70 },
                    { sentiment: 'Neutral', count: 20, percentage: 20 },
                    { sentiment: 'Negative', count: 10, percentage: 10 }
                ]
            }
        } as any);

        vi.mocked(OwnerMetricsHooks.useFeedbackList).mockReturnValue({
            isLoading: false,
            data: [
                {
                    id: '1',
                    rating: 5,
                    comment: 'Great app!',
                    created_at: new Date().toISOString(),
                    customer: { name: 'Happy User', avatarUrl: null },
                    workspace: { name: 'Acme Corp', businessType: 'Tech' }
                }
            ]
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <UserFeedback />
                </div>
            </BrowserRouter>
        );

        expect(screen.getByText('User Feedback')).toBeInTheDocument();

        // Use getAllByText for "4.5" since it appears in chart and card
        const ratingElements = screen.getAllByText('4.5');
        expect(ratingElements.length).toBeGreaterThan(0);

        // Use getAllByText for "+50" since it appears in card and large display
        const npsElements = screen.getAllByText('+50');
        expect(npsElements.length).toBeGreaterThan(0);

        // Assert breakdown is present (Promoters, etc.)
        const promoterElements = screen.getAllByText('Promoters');
        expect(promoterElements.length).toBeGreaterThan(0);

        // "70 (70%)"
        expect(screen.getAllByText(/70 \(70%\)/).length).toBeGreaterThan(0);
    });
});
