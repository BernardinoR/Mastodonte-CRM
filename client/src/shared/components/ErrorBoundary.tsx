import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** "page" shows full-height centered layout, "section" shows compact inline with border */
  level?: "page" | "section";
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.level === "section") {
        return (
          <div className="flex items-center gap-3 rounded-md border border-border bg-background p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">Algo deu errado nesta seção.</p>
              {this.state.error && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="shrink-0 text-sm text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Tentar novamente
            </button>
          </div>
        );
      }

      // level="page" (default)
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold text-foreground">Algo deu errado</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente ou navegue para outra página.
            </p>
            {this.state.error && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleRetry}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
