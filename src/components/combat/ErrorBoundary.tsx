/**
 * Error Boundary component for Combat Tracker
 * Feature 009: Combat Tracker
 * Catches render errors and displays fallback UI
 */

'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching render errors in combat components
 * Displays error message and provides recovery options
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Combat Tracker Error:', error);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="rounded-lg border border-destructive bg-destructive/10 p-4"
            role="alert"
          >
            <h2 className="mb-2 font-semibold text-destructive">Combat Tracker Error</h2>
            <p className="mb-4 text-sm text-destructive/80">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
