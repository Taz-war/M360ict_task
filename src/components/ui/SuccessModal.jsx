import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

export function SuccessModal({ isOpen, onClose, title = "Success!", message = "Operation completed successfully!" }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transform transition-all duration-300 animate-in slide-in-from-top-2 fade-in-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{message}</p>

            <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
