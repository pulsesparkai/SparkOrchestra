import { useQuery } from "@tanstack/react-query";
import { useUserUsage } from "@/hooks/use-user-data";
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

export function TokenUsageIndicator() {
  const { data: usage, isLoading, error } = useUserUsage();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
        <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
        <span className="text-sm text-gray-300">Loading tokens...</span>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <span className="text-sm text-red-300">0 / 100</span>
      </div>
    );
  }

  const percentageUsed = (usage.tokensUsed / usage.tokenLimit) * 100;
  const isLimitExceeded = usage.tokensUsed >= usage.tokenLimit;

  const getStatusColor = () => {
    if (isLimitExceeded) return "text-red-300";
    if (percentageUsed >= 80) return "text-yellow-300";
    return "text-green-300";
  };

  const getProgressColor = () => {
    if (isLimitExceeded) return "bg-red-500";
    if (percentageUsed >= 80) return "bg-yellow-500";
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
                value={Math.min(percentageUsed, 100)} 
                className="h-2"
              />
            </div>

            {isLimitExceeded && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                LIMIT EXCEEDED
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Token Usage - {usage.plan} plan</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Used: {usage.tokensUsed.toLocaleString()}</div>
              <div>Limit: {usage.tokenLimit.toLocaleString()}</div>
              <div>Remaining: {(usage.tokenLimit - usage.tokensUsed).toLocaleString()}</div>
              <div>Usage: {percentageUsed.toFixed(1)}%</div>
            </div>
            {isLimitExceeded && (
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
