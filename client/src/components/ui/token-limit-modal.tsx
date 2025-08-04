import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Key, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokensUsed: number;
  tokensLimit: number;
  userPlan: "free" | "early_adopter";
  nextResetDate?: string;
  onUpgrade?: () => void;
  onAddApiKey?: () => void;
}

export function TokenLimitModal({
  open,
  onOpenChange,
  tokensUsed,
  tokensLimit,
  userPlan,
  nextResetDate,
  onUpgrade,
  onAddApiKey
}: TokenLimitModalProps) {
  const usagePercentage = Math.min((tokensUsed / tokensLimit) * 100, 100);
  const isExceeded = tokensUsed >= tokensLimit;
  const isNearLimit = usagePercentage >= 80;

  const getNextResetDate = () => {
    if (nextResetDate) return nextResetDate;
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <DialogTitle className="text-xl font-semibold text-white">
            {isExceeded ? "Token Limit Reached" : "Approaching Token Limit"}
          </DialogTitle>
          
          <DialogDescription className="text-gray-400">
            {isExceeded 
              ? "You've used all your Orchestra credits for this month. Choose an option below to continue."
              : "You're running low on Orchestra credits. Consider upgrading or adding your API key."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Current Usage</span>
              </div>
              <Badge variant={isExceeded ? "destructive" : "secondary"} className="text-xs">
                {userPlan === "free" ? "Free Plan" : "Early Adopter"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={cn(
                  "font-medium",
                  isExceeded ? "text-red-400" : isNearLimit ? "text-yellow-400" : "text-green-400"
                )}>
                  {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()} tokens
                </span>
                <span className="text-gray-400">{usagePercentage.toFixed(0)}%</span>
              </div>
              
              <Progress 
                value={usagePercentage} 
                className="h-2"
                style={{
                  "--progress-background": isExceeded 
                    ? "rgb(239 68 68)" // red-500
                    : isNearLimit 
                      ? "rgb(234 179 8)" // yellow-500  
                      : "rgb(168 85 247)" // purple-500
                } as React.CSSProperties}
              />
            </div>

            {/* Reset Information */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
              <Calendar className="w-3 h-3" />
              <span>Resets on {getNextResetDate()}</span>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-300 mb-3">
              Choose your next step:
            </div>

            {/* Add API Key Option */}
            <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="font-medium text-white">Add Your API Key</div>
                    <div className="text-sm text-green-300">Get unlimited usage with your own Anthropic API key</div>
                  </div>
                  <Button 
                    onClick={onAddApiKey}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Add API Key
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Upgrade Option */}
            {userPlan === "free" && (
              <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="font-medium text-white">Upgrade to Early Adopter</div>
                      <div className="text-sm text-purple-300">Get 10x more tokens + unlimited agents</div>
                    </div>
                    <Button 
                      onClick={onUpgrade}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade for $15/month
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Wait Option */}
            <div className="p-4 bg-gray-800/50 border border-gray-600/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">Wait for Reset</div>
                  <div className="text-sm text-gray-400">
                    Your tokens will reset on {getNextResetDate()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            I'll Decide Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}