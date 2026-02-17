import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductUsage from '../ProductUsage';
import { BrowserRouter } from 'react-router-dom';
import * as OwnerMetricsHooks from '@/hooks/useOwnerMetrics';
import * as FunnelDataHooks from '@/hooks/useFunnelData';
import * as PersonasHooks from '@/hooks/usePersonas';

// Mock the hooks
vi.mock('@/hooks/useOwnerMetrics', () => ({
    useProductUsageMetrics: vi.fn(),
    useUserSegments: vi.fn(),
}));

vi.mock('@/hooks/useFunnelData', () => ({
    useFunnelData: vi.fn(),
}));

vi.mock('@/hooks/usePersonas', () => ({
    usePersonas: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock icon components
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
    };
});

// Mock UI Components that use Radix primitives
vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default={defaultValue}>{children}</div>,
    TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value, onClick }: any) => (
        <button data-testid={`tab-trigger-${value}`} onClick={onClick}>
            {children}
        </button>
    ),
    TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

describe('ProductUsage Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state when any hook is loading', () => {
        vi.mocked(OwnerMetricsHooks.useProductUsageMetrics).mockReturnValue({
            isLoading: true, data: undefined, refetch: vi.fn()
        } as any);
        vi.mocked(FunnelDataHooks.useFunnelData).mockReturnValue({
            isLoading: false, aarrrCategories: [], funnelStages: [], refetch: vi.fn()
        } as any);
        vi.mocked(OwnerMetricsHooks.useUserSegments).mockReturnValue({
            isLoading: false, data: [], refetch: vi.fn()
        } as any);
        vi.mocked(PersonasHooks.usePersonas).mockReturnValue({
            personas: [], createPersona: {} as any, deletePersona: {} as any
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <ProductUsage />
                </div>
            </BrowserRouter>
        );

        expect(screen.getByText(/Initializing Analytics Core.../i)).toBeInTheDocument();
    });

    it('renders empty state when no data is available', () => {
        vi.mocked(OwnerMetricsHooks.useProductUsageMetrics).mockReturnValue({
            isLoading: false, data: { totalUsers: 0 } as any, refetch: vi.fn()
        } as any);
        vi.mocked(FunnelDataHooks.useFunnelData).mockReturnValue({
            isLoading: false, aarrrCategories: [], funnelStages: [], refetch: vi.fn()
        } as any);
        vi.mocked(OwnerMetricsHooks.useUserSegments).mockReturnValue({
            isLoading: false, data: [], refetch: vi.fn()
        } as any);
        vi.mocked(PersonasHooks.usePersonas).mockReturnValue({
            personas: [], createPersona: {} as any, deletePersona: {} as any
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <ProductUsage />
                </div>
            </BrowserRouter>
        );

        expect(screen.getByText(/No Usage Data Detected/i)).toBeInTheDocument();
    });

    it('renders dashboard with data correctly', () => {
        // Mock Data
        vi.mocked(OwnerMetricsHooks.useProductUsageMetrics).mockReturnValue({
            isLoading: false,
            data: {
                totalUsers: 1250,
                mau: 800,
                dau: 200,
                dauMauRatio: 25
            } as any,
            refetch: vi.fn()
        } as any);

        vi.mocked(FunnelDataHooks.useFunnelData).mockReturnValue({
            isLoading: false,
            aarrrCategories: [
                { name: 'Acquisition', value: 1000, percentage: 100 },
                { name: 'Activation', value: 500, percentage: 50 }
            ],
            funnelStages: [],
            refetch: vi.fn()
        } as any);

        vi.mocked(OwnerMetricsHooks.useUserSegments).mockReturnValue({
            isLoading: false,
            data: [{ type: 'Enterprise', count: 50, percentage: 10 }],
            refetch: vi.fn()
        } as any);

        vi.mocked(PersonasHooks.usePersonas).mockReturnValue({
            personas: [
                { id: '1', name: 'Growth Marketer', description: 'Focus on scaling', characteristics: { list: ['Tech Savvy'] }, behaviors: { list: ['Daily Login'] }, createdAt: new Date() }
            ],
            createPersona: { mutateAsync: vi.fn(), isPending: false } as any,
            deletePersona: { mutateAsync: vi.fn() } as any
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <ProductUsage />
                </div>
            </BrowserRouter>
        );

        // Header
        expect(screen.getByText('Product Usage')).toBeInTheDocument();

        // Stats
        expect(screen.getByText('1,250')).toBeInTheDocument(); // Total Users
        expect(screen.getByText('800')).toBeInTheDocument();   // MAU

        // Funnel Tab (Default)
        expect(screen.getByText('Acquisition')).toBeInTheDocument();
        expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('can see personas content (via mocked tabs)', async () => {
        // Mock Data
        vi.mocked(OwnerMetricsHooks.useProductUsageMetrics).mockReturnValue({
            isLoading: false,
            data: { totalUsers: 100 } as any,
            refetch: vi.fn()
        } as any);

        vi.mocked(FunnelDataHooks.useFunnelData).mockReturnValue({
            isLoading: false,
            aarrrCategories: [],
            funnelStages: [],
            refetch: vi.fn()
        } as any);

        vi.mocked(OwnerMetricsHooks.useUserSegments).mockReturnValue({
            isLoading: false,
            data: [],
            refetch: vi.fn()
        } as any);

        vi.mocked(PersonasHooks.usePersonas).mockReturnValue({
            personas: [
                { id: '1', name: 'Power User', description: 'Uses all features', characteristics: { list: [] }, behaviors: { list: [] }, createdAt: new Date() }
            ],
            createPersona: { mutateAsync: vi.fn(), isPending: false } as any,
            deletePersona: { mutateAsync: vi.fn() } as any
        } as any);

        render(
            <BrowserRouter>
                <div id="root">
                    <ProductUsage />
                </div>
            </BrowserRouter>
        );

        // With mocked tabs, content is rendered directly in div
        expect(screen.getByText('Power User')).toBeInTheDocument();

        // Check if trigger is present
        expect(screen.getByTestId('tab-trigger-persona')).toBeInTheDocument();
    });
});
