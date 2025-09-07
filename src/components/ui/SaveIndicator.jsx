import React from "react";
import { Check, Save, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SaveIndicator = ({ status, lastSaved, className, showText = true, size = "sm" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "saving":
        return {
          icon: Loader2,
          text: "Saving...",
          className: "text-blue-600",
          bgClassName: "bg-blue-50 border-blue-200",
        };
      case "saved":
        return {
          icon: Check,
          text: "Saved",
          className: "text-green-600",
          bgClassName: "bg-green-50 border-green-200",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: "Save failed",
          className: "text-red-600",
          bgClassName: "bg-red-50 border-red-200",
        };
      default:
        return {
          icon: Save,
          text: "Not saved",
          className: "text-gray-400",
          bgClassName: "bg-gray-50 border-gray-200",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const formatLastSaved = (date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="inline-flex items-center space-x-1.5 px-1.5 rounded-full border transition-all duration-200">
      <div className={cn(config.bgClassName, sizeClasses[size], className)}>
        <Icon className={cn(iconSizes[size], config.className)} />
      </div>
      {showText && (
        <span className={cn("font-medium", config.className)}>
          {config.text}
          {status === "saved" && lastSaved && (
            <span className="font-normal text-gray-500 ml-1">{formatLastSaved(lastSaved)}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default SaveIndicator;
