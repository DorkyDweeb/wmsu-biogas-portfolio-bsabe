import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-xs font-mono text-rose-700 font-semibold">
              RENDER RECOVERY
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Unable to render preview cleanly
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {this.state.error.message || 'An unexpected runtime error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('babe101_paes413_meta_v3');
                } catch {
                  // Ignore storage errors
                }
                window.location.reload();
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Reset Local Draft &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
