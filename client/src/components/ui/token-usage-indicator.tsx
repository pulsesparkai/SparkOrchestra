import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TokenUsageStats {
  userId: string;
  month: string;
  tokensUsed: number;
  tokenLimit: number;
  remainingTokens: number;
  percentageUsed: number;
  isLimitExceeded: boolean;
}

export function TokenUsageIndicator() {
  const { data: usage, isLoading, error } = useQuery<TokenUsageStats>({
    queryKey: ["/api/tokens/usage"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
        <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
        <span className="text-sm text-gray-300">Loading...</span>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <span className="text-sm text-red-300">Token info unavailable</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (usage.isLimitExceeded) return "text-red-300";
    if (usage.percentageUsed >= 80) return "text-yellow-300";
    return "text-green-300";
  };

  const getProgressColor = () => {
    if (usage.isLimitExceeded) return "bg-red-500";
    if (usage.percentageUsed >= 80) return "bg-yellow-500";
    return "bg-purple-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-3 px-3 py-1.5 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-2">
              <Zap className={`h-4 w-4 ${getStatusColor()}`} />
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {usage.tokensUsed.toLocaleString()}/{usage.tokenLimit.toLocaleString()}
              </span>
            </div>
            
            <div className="w-16">
              <Progress 
                value={Math.min(usage.percentageUsed, 100)} 
                className="h-2"
              />
            </div>

            {usage.isLimitExceeded && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                LIMIT EXCEEDED
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Token Usage - {usage.month}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Used: {usage.tokensUsed.toLocaleString()}</div>
              <div>Limit: {usage.tokenLimit.toLocaleString()}</div>
              <div>Remaining: {usage.remainingTokens.toLocaleString()}</div>
              <div>Usage: {usage.percentageUsed.toFixed(1)}%</div>
            </div>
            {usage.isLimitExceeded && (
              <p className="text-red-300 text-xs font-medium">
                Monthly limit exceeded. Upgrade to continue.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TokenLimitExceededDialog({ 
  open, 
  onOpenChange, 
  usage 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  usage: TokenUsageStats;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <DialogTitle className="text-white">Token Limit Exceeded</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            You've reached your monthly token limit and can't execute more workflows this month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Current Usage</span>
              <span className="text-white font-semibold">
                {usage.tokensUsed.toLocaleString()}/{usage.tokenLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={100} className="h-2" />
            <div className="text-sm text-red-300">
              Monthly limit exceeded by {(usage.tokensUsed - usage.tokenLimit).toLocaleString()} tokens
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Upgrade Options</h4>
            <div className="space-y-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Upgrade to Pro - 10,000 tokens/month
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                View Pricing Plans
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Your token usage resets on the 1st of each month
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}