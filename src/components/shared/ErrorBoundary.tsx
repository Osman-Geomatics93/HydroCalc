import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                Something went wrong
              </h1>
              <p className="mt-2 text-[var(--color-text-muted)] text-sm">
                An unexpected error occurred. You can try reloading the page or go back to the home page.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4">
                <summary className="text-xs font-medium text-[var(--color-text-muted)] cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={this.handleHome}
                className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-[6px] text-sm font-medium hover:border-[var(--color-accent)]"
              >
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
