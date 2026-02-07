# Testing Guide for BuzzlyDev

This project uses **Vitest** for unit and integration tests, and **Playwright** for end-to-end (E2E) tests.

## 🚀 Quick Start

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests with UI (recommended!)
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (see tests run in browser)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run specific browser
npx playwright test --project=chromium
```

## 📁 Test Structure

```
BuzzlyDev/
├── src/
│   ├── __tests__/              # Component tests
│   │   └── App.test.tsx
│   ├── hooks/
│   │   └── __tests__/          # Hook tests
│   │       └── useAnalyticsData.test.tsx
│   └── test/
│       ├── setup.ts            # Global test setup
│       └── utils/
│           └── test-utils.tsx  # Custom render utilities
├── e2e/                        # E2E tests
│   ├── auth.spec.ts           # Authentication tests
│   ├── customer-flow.spec.ts  # Customer user flow tests
│   ├── admin-flow.spec.ts     # Admin user flow tests
│   └── owner-flow.spec.ts     # Owner user flow tests
├── vitest.config.ts           # Vitest configuration
└── playwright.config.ts       # Playwright configuration
```

## 📝 Test Coverage

### Unit Tests

- **Hooks**: `useAnalyticsData` - Tests data fetching, calculations, and date range handling
- **Components**: `App` - Tests rendering and routing

### E2E Tests

#### Authentication (`e2e/auth.spec.ts`)
- ✅ Navigation to auth pages
- ✅ Login form display and validation
- ✅ Signup form display and validation
- ✅ Admin authentication flows

#### Customer Flow (`e2e/customer-flow.spec.ts`)
- ✅ Dashboard access and protection
- ✅ Campaign management
- ✅ Analytics pages (Social Analytics, Customer Journey, AARRR Funnel)
- ✅ Settings and team management

#### Admin Flow (`e2e/admin-flow.spec.ts`)
- ✅ Admin login and authentication
- ✅ Monitor dashboard
- ✅ Workspace and member management
- ✅ Audit logs and support pages
- ✅ Tier management

#### Owner Flow (`e2e/owner-flow.spec.ts`)
- ✅ Product usage analytics
- ✅ Business performance metrics
- ✅ User feedback
- ✅ Executive reports
- ✅ Customer tier management

## 🧪 Writing Tests

### Unit Tests Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

## 🔧 Configuration

### Vitest Configuration (`vitest.config.ts`)
- Environment: jsdom (for React testing)
- Global test setup with Supabase mocks
- Coverage reporting with v8
- Path aliases configured

### Playwright Configuration (`playwright.config.ts`)
- Tests run on Chromium, Firefox, and WebKit
- Auto-starts dev server on `http://localhost:5173`
- Screenshots on failure
- Trace on first retry

## 🛠️ Mocking

### Supabase Client
The Supabase client is automatically mocked in all tests. See `src/test/setup.ts` for details.

```typescript
// Supabase is already mocked globally
// You can customize mocks in individual tests:
vi.mocked(supabase.from).mockImplementation((table) => ({
  select: vi.fn().mockReturnThis(),
  // ... your mock implementation
}));
```

## 📊 Coverage Reports

After running `npm run test:coverage`, open `coverage/index.html` in your browser to see detailed coverage reports.

## 🐛 Debugging

### Vitest
```bash
# Run specific test file
npm test -- src/hooks/__tests__/useAnalyticsData.test.tsx

# Run tests matching pattern
npm test -- --grep "analytics"
```

### Playwright
```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Run in UI mode (best for debugging)
npm run test:e2e:ui

# Generate code (record browser actions)
npx playwright codegen http://localhost:5173
```

## 🎯 Best Practices

1. **Use custom render** from `test-utils.tsx` for component tests
2. **Mock Supabase** calls in unit tests
3. **Test user behavior**, not implementation details
4. **Keep tests focused** - one concept per test
5. **Use descriptive test names** that explain what's being tested
6. **Organize tests** in describe blocks by feature/component
7. **Clean up** after tests (handled automatically by test setup)

## 🔍 CI/CD Integration

Add these commands to your CI pipeline:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run unit tests
npm test

# Install Playwright browsers
npx playwright install --with-deps

# Run E2E tests
npm run test:e2e
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## ❓ Troubleshooting

### Tests fail with "Cannot find module"
- Make sure path aliases in `vitest.config.ts` match `tsconfig.json`

### E2E tests timeout
- Increase timeout in `playwright.config.ts`
- Make sure dev server is running on correct port

### Supabase mock not working
- Check that mock is defined before importing component
- Clear mock state between tests with `vi.clearAllMocks()`

---

Happy Testing! 🎉
