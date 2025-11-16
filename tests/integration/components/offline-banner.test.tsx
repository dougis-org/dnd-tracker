// Mock the service worker registration
jest.mock('../../../src/lib/sw/register', () => ({
  registerServiceWorker: jest.fn(),
}));

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OfflineBanner } from '../../../src/components/OfflineBanner/OfflineBanner';
import { registerServiceWorker, ServiceWorkerCallbacks } from '../../../src/lib/sw/register';

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when online', () => {
    // Mock navigator.onLine as true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    render(<OfflineBanner />);

    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
  });

  it('should render offline banner when offline', () => {
    // Mock navigator.onLine as false
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineBanner />);

    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('should show retry button when offline and onRetry is provided', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineBanner onRetry={() => {}} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should call retry handler when retry button is clicked', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const mockRetry = jest.fn();
    // Assuming the component accepts an onRetry prop
    render(<OfflineBanner onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalled();
  });

  it('should show sync progress when operations are pending', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Mock pending operations
    render(<OfflineBanner pendingOperations={5} />);

    expect(screen.getByText(/syncing 5 operations/i)).toBeInTheDocument();
  });

  it('should hide banner when coming back online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineBanner />);

    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Trigger online event
    act(() => {
      window.dispatchEvent(new window.Event('online'));
    });

    await waitFor(() => {
      expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();
    });
  });

  it('should register service worker on mount', () => {
    render(<OfflineBanner />);

    expect(registerServiceWorker).toHaveBeenCalledWith('/sw.js', {
      onUpdate: expect.any(Function),
      onReady: expect.any(Function),
    });
  });

  it('should handle update available event', () => {
    let updateCallback: ((registration: ServiceWorkerRegistration) => void) | undefined;

    // Mock navigator.onLine as true to show update banner
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    (registerServiceWorker as jest.MockedFunction<typeof registerServiceWorker>).mockImplementation((swPath?: string, callbacks?: ServiceWorkerCallbacks) => {
      updateCallback = callbacks?.onUpdate;
      return Promise.resolve(null);
    });

    render(<OfflineBanner />);

    // Simulate update available
    act(() => {
      updateCallback?.({} as ServiceWorkerRegistration);
    });

    expect(screen.getByText(/update available/i)).toBeInTheDocument();
  });
});