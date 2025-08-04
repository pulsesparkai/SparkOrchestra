import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Crown, Sparkles } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: "tokens" | "agents" | "features";
  currentUsage?: {
    used: number;
    limit: number;
  };
}

export function UpgradePrompt({ open, onOpenChange, reason, currentUsage }: UpgradePromptProps) {
  const getTitle = () => {
    switch (reason) {
      case "tokens":
        return "Token Limit Reached";
      case "agents":
        return "Agent Limit Reached";
      case "features":
        return "Premium Feature Required";
      default:
        return "Upgrade Required";
    }
  };

  const getDescription = () => {
    switch (reason) {
      case "tokens":
        return `You've used ${currentUsage?.used || 0} of your ${currentUsage?.limit || 100} monthly tokens. Upgrade to continue.`;
      case "agents":
        return "Free plan is limited to 2 agents. Upgrade to create unlimited agents.";
      case "features":
        return "This feature requires an Early Adopter subscription.";
      default:
        return "Upgrade to unlock premium features.";
    }
  };

  const freePlanFeatures = [
    "100 tokens per month",
    "2 agents maximum",
    "Basic monitoring",
    "Community support"
  ];

  const earlyAdopterFeatures = [
    "1,000 tokens per month",
    "Unlimited agents",
    "Full conductor orchestration",
    "Real-time monitoring",
    "API access",
    "Priority support"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-white">{getTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400 text-lg">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Free Plan */}
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-2">
                Free Plan
                <Badge variant="secondary" className="text-xs">Current</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Basic features to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Early Adopter Plan */}
          <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500">
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Early Adopter
                <Badge className="bg-purple-600 text-white text-xs">Limited Time</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">
                <span className="text-3xl font-bold text-white">$15</span>
                <span className="text-gray-400">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {earlyAdopterFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-200 text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Maybe Later
          </Button>
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            onClick={() => {
              // TODO: Implement Stripe checkout
              console.log('Redirecting to Stripe checkout...');
            }}
          >
            <Zap className="w-4 h-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}