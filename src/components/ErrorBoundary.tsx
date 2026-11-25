import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E6DDD7] rounded-2xl p-8 text-center space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#2C2220]">
              Something Went Wrong
            </h1>
            <p className="text-sm text-[#5A4C48]">
              We encountered an issue loading this view. Please refresh the page or return home.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
