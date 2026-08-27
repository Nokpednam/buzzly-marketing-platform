import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoyaltyDashboard } from "../LoyaltyDashboard";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { useLoyaltyTier } from "@/hooks/useLoyaltyTier";
import { MemoryRouter } from "react-router-dom";

// Mock the hooks
vi.mock("@/hooks/useCustomerRewards", () => ({
    useCustomerRewards: vi.fn(),
}));

vi.mock("@/hooks/useLoyaltyTier", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/hooks/useLoyaltyTier")>();
    return {
        ...actual,
        useLoyaltyTier: vi.fn(),
    };
});

vi.mock("@/components/settings/LoyaltyMissionsList", () => ({
    LoyaltyMissionsList: () => <div data-testid="missions-list">Missions List</div>,
}));

describe("LoyaltyDashboard", () => {
    const mockRedeemReward = {
        mutateAsync: vi.fn(),
        isPending: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (useCustomerRewards as any).mockReturnValue({
            catalog: {
                data: [
                    {
                        id: "reward-1",
                        name: "10% Off Coupon",
                        description: "Get 10% off your next invoice",
                        points_cost: 500,
                        reward_type: "discount",
                        stock_quantity: 100,
                        image_url: null,
                    },
                    {
                        id: "reward-2",
                        name: "Free Pro Month",
                        description: "1 month of Pro plan",
                        points_cost: 5000,
                        reward_type: "subscription",
                        stock_quantity: 0,
                        image_url: null,
                    }
                ],
                isLoading: false,
            },
            redeemReward: mockRedeemReward,
        });

        (useLoyaltyTier as any).mockReturnValue({
            userLoyalty: {
                points_balance: 1500,
                total_spend_amount: 10000,
                tier: {
                    name: "Gold",
                    discount_percentage: 15,
                    point_multiplier: 1.5,
                    min_points: 1000,
                },
                recentTransactions: [
                    {
                        id: "tx-1",
                        transaction_type: "earn",
                        description: "Completed Mission",
                        points_amount: 100,
                        created_at: new Date().toISOString(),
                    }
                ],
            },
            getNextTier: () => ({ name: "Platinum", min_points: 5000 }),
            getProgressToNextTier: () => 12.5,
            loading: false,
        });
    });

    const queryClient = new QueryClient();

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>{ui}</MemoryRouter>
            </QueryClientProvider>
        );
    };

    it("renders current loyalty information correctly", () => {
        renderWithRouter(<LoyaltyDashboard />);

        // Check tier name
        expect(screen.getByText(/Gold/)).toBeInTheDocument();

        // Check point balance
        expect(screen.getByText("1,500")).toBeInTheDocument();

        // Check next tier progress text
        expect(screen.getByText(/Next: Platinum/)).toBeInTheDocument();
        
        // Check member benefits
        expect(screen.getByText("15%")).toBeInTheDocument();
        expect(screen.getByText("1.5x")).toBeInTheDocument();
    });

    it("renders available rewards and handles out-of-stock", () => {
        renderWithRouter(<LoyaltyDashboard />);

        expect(screen.getByText("10% Off Coupon")).toBeInTheDocument();
        expect(screen.getByText("Free Pro Month")).toBeInTheDocument();

        // Check buttons
        const redeemButtons = screen.getAllByRole("button", { name: /Redeem Now|Out of Stock|Insufficient Points/i });
        expect(redeemButtons[0]).toHaveTextContent("Redeem Now");
        expect(redeemButtons[0]).not.toBeDisabled();

        expect(redeemButtons[1]).toHaveTextContent("Out of Stock");
        expect(redeemButtons[1]).toBeDisabled();
    });

    it("redeem action opens dialog and uses the existing redemption path", async () => {
        mockRedeemReward.mutateAsync.mockResolvedValue({ success: true, coupon_code: "TESTCODE" });
        
        renderWithRouter(<LoyaltyDashboard />);

        const redeemButtons = screen.getAllByRole("button", { name: /Redeem Now/i });
        fireEvent.click(redeemButtons[0]);

        // Dialog should open
        expect(screen.getByText(/Confirm Redemption/i)).toBeInTheDocument();

        const confirmButton = screen.getByRole("button", { name: /ยืนยันการแลกรางวัล/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockRedeemReward.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: "reward-1" }));
        });
    });

    it("renders missions and recent activity", () => {
        renderWithRouter(<LoyaltyDashboard />);

        expect(screen.getByTestId("missions-list")).toBeInTheDocument();
        expect(screen.getByText("Completed Mission")).toBeInTheDocument();
        expect(screen.getByText("+100")).toBeInTheDocument();
    });
});
