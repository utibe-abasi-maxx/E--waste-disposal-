import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black">
              ♻️
            </div>
            <h2 className="text-xl font-black text-white">E-Waste Disposal System</h2>
            <p className="text-xs text-gray-400">
              The application encountered a temporary refresh hiccup, but your data is safe. Click below to continue smoothly.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reload & Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
