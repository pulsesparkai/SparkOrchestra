import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Key, Clock, Zap } from "lucide-react";

interface AutomatedWorkflowWarningProps {
  isScheduled?: boolean;
  isRecurring?: boolean;
  hasUserApiKey?: boolean;
  onAddApiKey?: () => void;
  className?: string;
}

export function AutomatedWorkflowWarning({
  isScheduled = false,
  isRecurring = false,
  hasUserApiKey = false,
  onAddApiKey,
  className
}: AutomatedWorkflowWarningProps) {
  const isAutomated = isScheduled || isRecurring;
  
  if (!isAutomated) return null;

  if (hasUserApiKey) {
    return (
      <Alert className={`border-green-500 bg-green-900/20 ${className}`}>
        <Key className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          <div className="flex items-center justify-between">
            <span>✓ Ready for automated execution with your API key</span>
            <div className="flex items-center space-x-1 text-xs">
              <Zap className="w-3 h-3" />
              <span>Unlimited</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <strong>Automated workflows require your own API key</strong>
          </div>
          
          <div className="flex items-start space-x-2 text-sm">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Why this restriction?</div>
              <div className="text-xs text-red-300 mt-1">
                Platform credits are limited and intended for manual testing. 
                Scheduled/recurring workflows could consume your monthly allowance quickly.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              onClick={onAddApiKey}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Key className="w-3 h-3 mr-1" />
              Add Your API Key
            </Button>
            
            <div className="text-xs text-red-300">
              Get unlimited usage with your Anthropic API key
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}