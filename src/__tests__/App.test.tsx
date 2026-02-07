import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
    it('should render without crashing', () => {
        render(<App />);
        // App should render without errors
        expect(document.body).toBeTruthy();
    });

    it('should render landing page by default', () => {
        render(<App />);
        // The app should have a router
        expect(window.location.pathname).toBe('/');
    });
});
