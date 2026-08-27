import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

import { useState } from 'react';

interface AllTheProvidersProps {
    children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    const [testQueryClient] = useState(() => createTestQueryClient());

    return (
        <QueryClientProvider client={testQueryClient}>
            <BrowserRouter>
                <TooltipProvider>{children}</TooltipProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

import { renderHook, RenderHookOptions } from '@testing-library/react';

const customRenderHook = <Result, Props>(
    render: (initialProps: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) => renderHook(render, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
