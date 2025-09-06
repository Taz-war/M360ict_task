import React from "react";
import { AlertCircle, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export class FormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      formData: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture form data before error
    try {
      const formData = localStorage.getItem("form-data");
      this.setState({
        error,
        errorInfo,
        formData: formData ? JSON.parse(formData) : null,
      });
    } catch (e) {
      this.setState({ error, errorInfo });
    }

    // Log error for debugging
    console.error("Form Error Boundary:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleSaveAndRetry = () => {
    // Force save current form state
    if (this.state.formData && this.props.onForceSave) {
      this.props.onForceSave(this.state.formData);
    }
    this.handleRetry();
  };

  handleResetForm = () => {
    // Clear form data
    try {
      localStorage.removeItem("form-data");
    } catch (e) {
      // Ignore
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      formData: null,
      retryCount: 0,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const hasFormData = this.state.formData && Object.keys(this.state.formData).length > 0;
      const isRepeatedError = this.state.retryCount > 2;

      return (
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">Form Error Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  {isRepeatedError
                    ? "We're experiencing repeated issues with the form. Your data has been preserved."
                    : "Don't worry! Your form progress has been automatically saved and can be restored."}
                </AlertDescription>
              </Alert>

              {hasFormData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Save className="w-4 h-4" />
                    <span className="font-medium">Form Data Preserved</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    We've saved your progress including personal information, job details, and preferences.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>What happened?</strong> The form encountered an unexpected error, but your data is safe.
                </div>

                <div className="text-sm text-gray-600">
                  <strong>What can you do?</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Try again - most errors are temporary</li>
                    {hasFormData && <li>Your progress will be automatically restored</li>}
                    <li>If the problem persists, reset the form and start fresh</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                {hasFormData && (
                  <Button onClick={this.handleSaveAndRetry} variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save & Retry
                  </Button>
                )}

                <Button onClick={this.handleResetForm} variant="outline" className="flex-1">
                  Reset Form
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">Developer Information</summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                    <div className="text-red-600 font-semibold">{this.state.error.toString()}</div>
                    {this.state.errorInfo && (
                      <div className="mt-2 text-gray-600">{this.state.errorInfo.componentStack}</div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FormErrorBoundary;
