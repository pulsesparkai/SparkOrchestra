import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, AlertTriangle, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenCounterProps {
  tokensUsed: number;
  tokensLimit: number;
  userPlan: "free" | "early_adopter";
  className?: string;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export function TokenCounter({
  tokensUsed,
  tokensLimit,
  userPlan,
  className,
  showUpgradePrompt = false,
  onUpgrade
}: TokenCounterProps) {
  const usagePercentage = Math.min((tokensUsed / tokensLimit) * 100, 100);
  const isNearLimit = usagePercentage >= 80;
  const isExceeded = tokensUsed >= tokensLimit;
  
  const getStatusColor = () => {
    if (isExceeded) return "text-red-400";
    if (isNearLimit) return "text-yellow-400";
    return "text-green-400";
  };

  const getProgressColor = () => {
    if (isExceeded) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getBadgeVariant = () => {
    if (isExceeded) return "destructive";
    if (isNearLimit) return "secondary";
    return "default";
  };

  return (
    <Card className={cn("bg-white shadow-sm border border-gray-200", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orchestra-brown" />
            <span className="text-sm font-medium text-gray-900">Orchestra Credits</span>
          </div>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {userPlan === "free" ? "Free Plan" : "Early Adopter"}
          </Badge>
        </div>

        {/* Usage Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn("text-lg font-bold", getStatusColor())}>
              {tokensUsed.toLocaleString()}/{tokensLimit.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">
              {usagePercentage.toFixed(0)}% used
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="h-2"
            // Custom progress bar color based on usage
            style={{
              "--progress-background": isExceeded 
                ? "rgb(239 68 68)" // red-500
                : isNearLimit 
                  ? "rgb(234 179 8)" // yellow-500  
                  : "rgb(200 90 58)" // orchestra-brown
            } as React.CSSProperties}
          />
        </div>

        {/* Status Messages */}
        {isExceeded && (
          <div className="flex items-start space-x-2 p-2 bg-red-900/20 border border-red-500/20 rounded">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-300">
              <p className="font-medium">Limit reached!</p>
              <p className="text-xs text-red-400">Add your API key or upgrade for more credits</p>
            </div>
          </div>
        )}

        {isNearLimit && !isExceeded && (
          <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 border border-yellow-500/20 rounded">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-300">
              <p className="font-medium">Approaching limit</p>
              <p className="text-xs text-yellow-400">Consider adding your API key for unlimited usage</p>
            </div>
          </div>
        )}

        {/* BYOAPI Prompt */}
        {showUpgradePrompt && (userPlan === "free" || isNearLimit) && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <Key className="w-4 h-4 text-green-400" />
              <span>Want unlimited usage?</span>
            </div>
            <div className="flex space-x-2">
              {userPlan === "free" && (
                <button
                  onClick={onUpgrade}
                  className="flex-1 px-3 py-1.5 bg-orchestra-brown hover:bg-orchestra-brown-hover text-white text-xs font-medium rounded transition-colors"
                >
                  Upgrade to Early Adopter
                </button>
              )}
              <button className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors">
                Add API Key
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}