import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ChatErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  timestamp?: Date;
}

export function ChatErrorMessage({
  error,
  onRetry,
  retryLabel = "Try Again",
  className,
  timestamp = new Date(),
}: ChatErrorMessageProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  // Extract user-friendly message from technical error messages
  const getUserFriendlyMessage = (message: string): string => {
    // Handle specific error patterns
    if (message.includes("Start date must be in the future")) {
      return "The start date you provided is in the past. Please choose a future date for your trip.";
    }
    if (message.includes("End date must be after start date")) {
      return "Your end date is before your start date. Please check your travel dates.";
    }
    if (message.includes("Invalid") && message.includes("date format")) {
      return "The date format you provided is invalid. Please use the format YYYY-MM-DD (e.g., 2025-12-25).";
    }
    if (message.includes("Destination must be specified")) {
      return "Please tell me where you'd like to travel to so I can help plan your trip.";
    }
    if (message.includes("Name must be") || message.includes("Invalid email")) {
      return "Please provide a valid name and email address for your booking.";
    }
    if (message.includes("Failed to fetch") || message.includes("Network")) {
      return "There was a connection problem. Please check your internet connection and try again.";
    }
    if (message.includes("timeout") || message.includes("Timeout")) {
      return "The request took too long to complete. Please try again.";
    }
    if (message.includes("API") || message.includes("Server Error")) {
      return "There was a problem with our travel service. Please try again in a moment.";
    }

    // If message is already friendly, return as-is
    if (
      message.length <= 100 &&
      !message.includes("Error:") &&
      !message.includes("Exception")
    ) {
      return message;
    }

    // Default fallback for unknown errors
    return "Sorry, something went wrong while processing your request. Please try again.";
  };

  const friendlyMessage = getUserFriendlyMessage(errorMessage);

  return (
    <div className={cn("flex w-full mb-6", className)}>
      <div className="flex w-full max-w-3xl mx-auto">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3 mt-1">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Assistant
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>

          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
          >
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                    Something went wrong
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                    {friendlyMessage}
                  </p>
                </div>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="flex-shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {retryLabel}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
