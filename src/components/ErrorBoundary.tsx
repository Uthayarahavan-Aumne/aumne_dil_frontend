import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error in development only
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  <div className="space-y-3">
                    <p className="font-medium">Something went wrong</p>
                    <p className="text-sm text-muted-foreground">
                      An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};