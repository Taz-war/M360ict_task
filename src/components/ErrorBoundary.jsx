import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo,
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    // Clear any stored form data that might be causing issues
    try {
      localStorage.removeItem("form-data");
    } catch (e) {
      // Ignore localStorage errors
    }

    this.handleRetry();

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const {
        title = "Something went wrong",
        message = "We encountered an unexpected error. Don't worry, your progress has been saved.",
        showDetails = false,
        showRetry = true,
        showReset = true,
        showHome = false,
      } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">{message}</p>

              {showDetails && this.state.error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Error Details (ID: {this.state.errorId})</summary>
                      <div className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        <div className="text-red-600 font-semibold">{this.state.error.toString()}</div>
                        {this.state.errorInfo && (
                          <div className="mt-2 text-gray-600">{this.state.errorInfo.componentStack}</div>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {showRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}

                {showReset && (
                  <Button onClick={this.handleReset} variant="outline" className="flex-1">
                    Reset Form
                  </Button>
                )}

                {showHome && (
                  <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-gray-500 pt-2">
                If this problem persists, please contact support with error ID: {this.state.errorId}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error boundary context
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    setError(error);
    // Re-throw to trigger error boundary
    throw error;
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

export default ErrorBoundary;
