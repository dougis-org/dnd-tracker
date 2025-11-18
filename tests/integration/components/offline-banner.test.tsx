// Mock the service worker registration
jest.mock('../../../src/lib/sw/register', () => ({
  registerServiceWorker: jest.fn(),
}));

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OfflineBanner } from '../../../src/components/OfflineBanner/OfflineBanner';
import { registerServiceWorker, ServiceWorkerCallbacks } from '../../../src/lib/sw/register';

/**
 * Setup offline state
 */
function setOfflineState(isOffline: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: !isOffline,
  });
}

/**
 * Dispatch online/offline event
 */
function emitNetworkEvent(type: 'online' | 'offline') {
  act(() => {
    window.dispatchEvent(new window.Event(type));
  });
}

/**
 * Mock service worker registration callback
 */
function mockSWRegistration(callback: (cb: ServiceWorkerCallbacks | undefined) => void) {
  (registerServiceWorker as jest.MockedFunction<typeof registerServiceWorker>).mockImplementation(
    (swPath?: string, callbacks?: ServiceWorkerCallbacks) => {
      callback(callbacks);
      return Promise.resolve(null);
    }
  );
}

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when online', () => {
    setOfflineState(false);
    render(<OfflineBanner />);
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
  });

  it('should render offline banner when offline', () => {
    setOfflineState(true);
    render(<OfflineBanner />);
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('should show retry button when offline and onRetry is provided', () => {
    setOfflineState(true);
    render(<OfflineBanner onRetry={() => {}} />);
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should call retry handler when retry button is clicked', () => {
    setOfflineState(true);
    const mockRetry = jest.fn();
    render(<OfflineBanner onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalled();
  });

  it('should show sync progress when operations are pending', () => {
    setOfflineState(true);
    render(<OfflineBanner pendingOperations={5} />);
    expect(screen.getByText(/syncing 5 operations/i)).toBeInTheDocument();
  });

  it('should hide banner when coming back online', async () => {
    setOfflineState(true);
    render(<OfflineBanner />);
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();

    setOfflineState(false);
    emitNetworkEvent('online');

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
    setOfflineState(false);
    let updateCallback: ((registration: ServiceWorkerRegistration) => void) | undefined;

    mockSWRegistration((callbacks) => {
      updateCallback = callbacks?.onUpdate;
    });

    render(<OfflineBanner />);
    act(() => {
      updateCallback?.({} as ServiceWorkerRegistration);
    });

    expect(screen.getByText(/update available/i)).toBeInTheDocument();
  });
});