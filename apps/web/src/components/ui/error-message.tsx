import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  showRetry?: boolean;
}

export function ErrorMessage({
  error,
  onRetry,
  retryLabel = "Try Again",
  className,
  showRetry = true,
}: ErrorMessageProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  // Extract user-friendly message from technical error messages
  const getUserFriendlyMessage = (message: string): string => {
    // Handle validation errors
    if (message.includes("Start date must be in the future")) {
      return "The start date you provided is in the past. Please choose a future date for your trip.";
    }
    if (message.includes("End date must be after start date")) {
      return "Your end date is before your start date. Please check your travel dates.";
    }
    if (
      message.includes("Invalid start date format") ||
      message.includes("Invalid end date format")
    ) {
      return "The date format you provided is invalid. Please use the format YYYY-MM-DD (e.g., 2025-12-25).";
    }
    if (message.includes("Destination must be specified")) {
      return "Please tell me where you'd like to travel to so I can help plan your trip.";
    }
    if (
      message.includes("Name must be at least") ||
      message.includes("Invalid email")
    ) {
      return "Please provide a valid name and email address for your booking.";
    }

    // Handle network/connection errors
    if (message.includes("Failed to fetch") || message.includes("Network")) {
      return "There was a connection problem. Please check your internet connection and try again.";
    }

    // Handle timeout errors
    if (message.includes("timeout") || message.includes("Timeout")) {
      return "The request took too long to complete. Please try again.";
    }

    // Handle API errors
    if (message.includes("API") || message.includes("Server Error")) {
      return "There was a problem with our travel service. Please try again in a moment.";
    }

    // Default fallback for unknown errors
    if (message.length > 100) {
      return "Sorry, something went wrong while processing your request. Please try again.";
    }

    return message;
  };

  const friendlyMessage = getUserFriendlyMessage(errorMessage);

  return (
    <div className={cn("my-4", className)}>
      <Alert
        variant="destructive"
        className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <p className="font-medium text-red-800 dark:text-red-200 mb-1">
              Oops! Something went wrong
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {friendlyMessage}
            </p>
          </div>
          {showRetry && onRetry && (
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
        </AlertDescription>
      </Alert>
    </div>
  );
}

interface StreamErrorMessageProps {
  error: string | Error;
  onRetry: () => void;
  className?: string;
}

export function StreamErrorMessage({
  error,
  onRetry,
  className,
}: StreamErrorMessageProps) {
  return (
    <ErrorMessage
      error={error}
      onRetry={onRetry}
      retryLabel="Retry Message"
      className={className}
      showRetry={true}
    />
  );
}

interface AgentErrorMessageProps {
  error: string | Error;
  onContinue?: () => void;
  className?: string;
}

export function AgentErrorMessage({
  error,
  onContinue,
  className,
}: AgentErrorMessageProps) {
  return (
    <ErrorMessage
      error={error}
      onRetry={onContinue}
      retryLabel="Continue"
      className={className}
      showRetry={!!onContinue}
    />
  );
}
