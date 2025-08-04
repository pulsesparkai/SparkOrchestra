import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Crown, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface UpgradeBannerProps {
  userPlan: "free" | "early_adopter";
  agentCount: number;
  maxAgents: number;
  tokensUsed: number;
  tokensLimit: number;
  onUpgrade: () => void;
  onTrackEvent?: (event: string, properties?: Record<string, any>) => void;
}

export function UpgradeBanner({
  userPlan,
  agentCount,
  maxAgents,
  tokensUsed,
  tokensLimit,
  onUpgrade,
  onTrackEvent
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (userPlan !== "free" || isDismissed) return null;

  const isNearAgentLimit = agentCount >= maxAgents - 1;
  const isNearTokenLimit = (tokensUsed / tokensLimit) >= 0.7;
  const shouldShowBanner = isNearAgentLimit || isNearTokenLimit || agentCount > 0;

  if (!shouldShowBanner) return null;

  const handleUpgrade = () => {
    onTrackEvent?.("upgrade_clicked", {
      source: "dashboard_banner",
      agent_count: agentCount,
      tokens_used: tokensUsed,
      tokens_limit: tokensLimit
    });
    onUpgrade();
  };

  const handleDismiss = () => {
    onTrackEvent?.("banner_dismissed", {
      source: "dashboard_banner",
      agent_count: agentCount,
      tokens_used: tokensUsed
    });
    setIsDismissed(true);
  };

  const getBannerMessage = () => {
    if (isNearAgentLimit) {
      return {
        title: "Unlock Unlimited Agents",
        subtitle: `You have ${agentCount}/${maxAgents} agents. Upgrade for unlimited!`
      };
    }
    if (isNearTokenLimit) {
      return {
        title: "More Tokens Available",
        subtitle: `${tokensUsed}/${tokensLimit} tokens used. Get 10x more with Early Adopter!`
      };
    }
    return {
      title: "Unlock the Full Power of Orchestra",
      subtitle: "Upgrade to Early Adopter for unlimited agents and 10x more tokens"
    };
  };

  const { title, subtitle } = getBannerMessage();

  return (
    <div className="relative mb-6 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-purple-600/5 animate-pulse rounded-lg"></div>
      
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 h-8 w-8"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-semibold">{title}</h3>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs px-2 py-0.5">
                <Sparkles className="w-3 h-3 mr-1" />
                LIMITED TIME
              </Badge>
            </div>
            <p className="text-gray-300 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-white font-bold text-lg">$15/month</div>
            <div className="text-gray-400 text-xs">Cancel anytime</div>
          </div>
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-2 font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}