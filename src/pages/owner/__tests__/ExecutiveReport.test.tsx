import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ExecutiveReport from '../ExecutiveReport';

// Mock Toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

// Mock html2canvas and jsPDF to avoid JSDOM errors
vi.mock('html2canvas', () => ({
    default: vi.fn().mockResolvedValue({
        toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mock'),
        height: 100,
        width: 100
    })
}));
vi.mock('jspdf', () => ({
    jsPDF: vi.fn().mockImplementation(() => ({
        internal: { pageSize: { getWidth: () => 210 } },
        addImage: vi.fn(),
        output: vi.fn().mockReturnValue(new Blob())
    }))
}));

// Mock hooks
const mockCreateScheduledReport = vi.fn();
vi.mock('@/hooks/useScheduledReports', () => ({
    useScheduledReports: vi.fn(() => ({
        scheduledReports: [],
        isLoading: false,
        toggleActive: { mutate: vi.fn() },
        deleteScheduledReport: { mutate: vi.fn(), isPending: false },
        createScheduledReport: { mutateAsync: mockCreateScheduledReport }
    }))
}));

vi.mock('@/hooks/useReports', () => ({
    useReports: vi.fn(() => ({
        reports: [
            { id: '1', name: 'Q4 2024 Executive Summary', created_at: '2024-10-01T00:00:00Z', status: 'completed', report_type: 'executive', file_url: '#' }
        ],
        isLoading: false,
        deleteReport: { mutate: vi.fn(), isPending: false },
        createReport: { mutateAsync: vi.fn() }
    }))
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

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

describe('ExecutiveReport Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ExecutiveReport />);
        expect(screen.getByText('Executive Report')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-generate')).toBeInTheDocument();
    });

    it('allows selecting metrics', () => {
        render(<ExecutiveReport />);
        
        // Business Performance starts checked
        const businessCheckbox = screen.getByLabelText(/Business Performance/i);
        expect(businessCheckbox).toBeChecked();

        fireEvent.click(businessCheckbox);
        expect(businessCheckbox).not.toBeChecked();
    });

    it('generates report triggers toast', async () => {
        const user = userEvent.setup();
        render(<ExecutiveReport />);

        const generateBtns = screen.getAllByRole('button', { name: /Generate Report/i });
        const actionBtn = generateBtns[generateBtns.length - 1]; // The actual button is the last one
        
        await user.click(actionBtn);

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Generating Report",
            description: "Compiling document and data...",
        }));
    });

    it('schedules report triggers mutation', async () => {
        const user = userEvent.setup();
        render(<ExecutiveReport />);

        const scheduleBtn = screen.getByText('Schedule Report', { selector: 'button' });
        await user.click(scheduleBtn);

        // Fill modal
        const nameInput = screen.getByPlaceholderText('e.g. Weekly Stakeholder Update');
        await user.clear(nameInput);
        await user.type(nameInput, 'My Schedule');

        const emailInput = screen.getByPlaceholderText('CEO@buzzly.com, investors@buzzly.com');
        await user.clear(emailInput);
        await user.type(emailInput, 'test@example.com');

        const saveBtn = screen.getByText('Save Schedule', { selector: 'button' });
        await user.click(saveBtn);

        await waitFor(() => {
            expect(mockCreateScheduledReport).toHaveBeenCalledWith(expect.objectContaining({
                name: 'My Schedule',
                recipients: ['test@example.com']
            }));
        });
    });

    it('displays history tab content', async () => {
        render(<ExecutiveReport />);
        expect(screen.getByText('Recent Reports')).toBeInTheDocument();
        expect(screen.getByText('Q4 2024 Executive Summary')).toBeInTheDocument();
    });
});
