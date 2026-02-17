import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExecutiveReport from '../ExecutiveReport';

// Mock Toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

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

describe('ExecutiveReport Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ExecutiveReport />);
        expect(screen.getByText('Executive Report')).toBeInTheDocument();

        // Check for Generate Report button (which might be in a tab, but tabs content are mocked to be visible)
        // Actually, there are multiple "Generate Report" texts? 1 in header tab, 1 in button?
        // Tab trigger: "Generate Report"
        // Button: "Generate Report" inside

        // Let's be specific
        expect(screen.getByTestId('tab-trigger-generate')).toBeInTheDocument();
    });

    it('allows selecting metrics', () => {
        render(<ExecutiveReport />);

        const arrCheckbox = screen.getByLabelText(/Annual Recurring Revenue/i);
        expect(arrCheckbox).not.toBeChecked();

        fireEvent.click(arrCheckbox);
        expect(arrCheckbox).toBeChecked();
    });

    it('generates report triggers toast', () => {
        render(<ExecutiveReport />);

        // Button inside the tab content
        const generateBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Generate Report'));
        // One is the tab trigger (mocked as button), one is the actual button
        // The actual button has text "Generate Report" and an icon

        // The mocked trigger has text "Generate Report"
        // The actual button has text "Generate Report"

        // Let's pick the one that is NOT the testid tab-trigger
        const actionBtn = generateBtns.find(b => !b.getAttribute('data-testid')?.startsWith('tab-trigger'));

        if (actionBtn) {
            fireEvent.click(actionBtn);
        } else {
            // Fallback if filtering fails or logic changes
            // Try getting by specific class or other attribute if possible, but for now let's hope finding non-testid works
            // Or better:
            const btn = screen.getByRole('button', { name: /Generate Report/i }); // might return multiple
            // Since we mocked tabs content to be visible, both are visible.
        }

        // Alternative: Use the fact that the button is inside 'tab-content-generate'
        const tabContent = screen.getByTestId('tab-content-generate');
        const btnInTab = tabContent.querySelector('button.w-full'); // Based on className in source

        if (btnInTab) {
            fireEvent.click(btnInTab);
        }

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Generating Report",
            description: expect.stringContaining("PDF report"),
        }));
    });

    it('schedules report triggers toast', () => {
        render(<ExecutiveReport />);

        // Button "Schedule Report"
        const scheduleBtn = screen.getByText('Schedule Report', { selector: 'button' });
        fireEvent.click(scheduleBtn);

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Report Scheduled",
        }));
    });

    it('displays history tab content', async () => {
        render(<ExecutiveReport />);

        // With mocked tabs, content is always rendered
        expect(screen.getByText('Recent Reports')).toBeInTheDocument();
        expect(screen.getByText('Q4 2024 Executive Summary')).toBeInTheDocument();
    });
});
