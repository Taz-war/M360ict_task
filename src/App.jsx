import { SimpleMultiStepForm } from "./components/SimpleMultiStepForm";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <ErrorBoundary
      title="Application Error"
      message="We encountered an unexpected error. Your form data has been preserved and you can try again."
      showDetails={process.env.NODE_ENV === "development"}
      showRetry={true}
      showReset={true}
      onError={(error, errorInfo) => {
        // In production, you might want to log to an error reporting service
        console.error("Application Error:", error, errorInfo);
      }}
      onRetry={() => {
        // Clear any problematic state
        window.location.reload();
      }}
      onReset={() => {
        // Clear all stored data and reload
        localStorage.clear();
        window.location.reload();
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <SimpleMultiStepForm />
      </div>
    </ErrorBoundary>
  );
}

export default App;
