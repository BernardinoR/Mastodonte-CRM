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
          <div className="flex items-center gap-3 p-4 border border-border rounded-md bg-background">
            <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">Algo deu errado nesta seção.</p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="text-sm text-foreground underline underline-offset-2 hover:text-muted-foreground shrink-0"
            >
              Tentar novamente
            </button>
          </div>
        );
      }

      // level="page" (default)
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Ocorreu um erro inesperado. Tente novamente ou navegue para outra página.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground font-mono mt-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
