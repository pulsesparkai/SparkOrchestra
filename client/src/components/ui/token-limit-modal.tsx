import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, ArrowRight, TrendingUp } from "lucide-react";

interface TokenLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokensUsed: number;
  tokensLimit: number;
  userPlan: "free" | "early_adopter";
  onUpgrade: () => void;
  onTrackEvent?: (event: string, properties?: Record<string, any>) => void;
}

export function TokenLimitModal({
  open,
  onOpenChange,
  tokensUsed,
  tokensLimit,
  userPlan,
  onUpgrade,
  onTrackEvent
}: TokenLimitModalProps) {
  const usagePercentage = Math.min((tokensUsed / tokensLimit) * 100, 100);
  const isExceeded = tokensUsed >= tokensLimit;
  const isNearLimit = usagePercentage >= 80;

  const handleUpgrade = () => {
    onTrackEvent?.("upgrade_clicked", {
      source: "token_limit_modal",
      tokens_used: tokensUsed,
      tokens_limit: tokensLimit,
      usage_percentage: usagePercentage
    });
    onUpgrade();
  };

  const handleDismiss = () => {
    onTrackEvent?.("modal_dismissed", {
      source: "token_limit_modal",
      tokens_used: tokensUsed,
      usage_percentage: usagePercentage
    });
    onOpenChange(false);
  };

  if (userPlan !== "free") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-white text-xl">
            {isExceeded ? "You've Used Your Free Tokens!" : "Token Limit Warning"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            {isExceeded 
              ? "Upgrade for 10x more tokens and unlimited agents!" 
              : "You're approaching your monthly token limit"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tokens Used</span>
              <span className="text-white font-medium">{tokensUsed} / {tokensLimit}</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
            {isExceeded && (
              <p className="text-red-400 text-sm text-center">
                ⚠️ Token limit exceeded - upgrade to continue
              </p>
            )}
          </div>

          {/* Upgrade Benefits */}
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Crown className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-white font-semibold">Early Adopter Benefits</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-300">
                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                <span>10x more tokens (1,000/month)</span>
              </div>
              <div className="flex items-center text-gray-300">
                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                <span>Unlimited agents</span>
              </div>
              <div className="flex items-center text-gray-300">
                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                <span>Full conductor orchestration</span>
              </div>
              <div className="flex items-center text-gray-300">
                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                <span>Priority support</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-3xl font-bold text-white">$15</span>
              <span className="text-gray-400">/month</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                Limited Time
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Cancel anytime • 30-day guarantee</p>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-12 text-lg font-semibold"
          >
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Upgrade Now</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Button>
          {!isExceeded && (
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-gray-400 hover:text-white"
            >
              Continue with Free Plan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}