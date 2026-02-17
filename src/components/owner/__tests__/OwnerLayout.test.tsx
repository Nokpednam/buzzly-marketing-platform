import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OwnerLayout } from '../OwnerLayout';
import { BrowserRouter } from 'react-router-dom';

// Mock owner sidebar and outlet
vi.mock('../OwnerSidebar', () => ({
    OwnerSidebar: () => <div data-testid="owner-sidebar">Sidebar</div>,
}));

// We need to mock Outlet behavior if we want to confirm it renders content
// but since OwnerLayout uses Outlet from react-router-dom, we can just test if the layout wrapper is there
// or use a wrapper with Routes to test outlet rendering.
// A simpler unit test just checks if SideBar is rendered and the main container format is correct.

describe('OwnerLayout', () => {
    it('renders sidebar and main content area', () => {
        render(
            <BrowserRouter>
                <OwnerLayout />
            </BrowserRouter>
        );

        expect(screen.getByTestId('owner-sidebar')).toBeInTheDocument();

        // Check for main content container classes
        const main = screen.getByRole('main');
        expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'bg-background');
    });
});
