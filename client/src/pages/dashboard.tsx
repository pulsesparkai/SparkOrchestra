import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { TokenLimitModal } from "@/components/ui/token-limit-modal";
import { TokenCounter } from "@/components/ui/token-counter";
import { useAnalytics } from "@/hooks/use-analytics";
import { Bot, Zap, Clock, TrendingUp, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [tokenLimitModalOpen, setTokenLimitModalOpen] = useState(false);
  const { trackEvent, trackTokenUsage, trackAgentUsage } = useAnalytics();

  // Mock user data - would come from API/context in real app
  const userPlan = "free" as const;
  const agentCount = 1;
  const maxAgents = 2;
  const tokensUsed = 85;
  const tokensLimit = 100;

  useEffect(() => {
    // Track dashboard view
    trackEvent("dashboard_viewed", {
      user_plan: userPlan,
      agent_count: agentCount,
      tokens_used: tokensUsed
    });

    // Track usage metrics
    trackTokenUsage(tokensUsed, tokensLimit, userPlan);
    trackAgentUsage(agentCount, maxAgents, userPlan);

    // Auto-show token limit modal if exceeded
    if (tokensUsed >= tokensLimit && userPlan === "free") {
      setTokenLimitModalOpen(true);
    }
  }, []);

  const handleUpgrade = () => {
    trackEvent("upgrade_initiated", {
      source: "dashboard",
      user_plan: userPlan,
      agent_count: agentCount,
      tokens_used: tokensUsed
    });
    
    // TODO: Redirect to upgrade flow/Stripe
    console.log("Redirecting to upgrade...");
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Monitor your Orchestra workflows and agents</p>
      </div>

      {/* Upgrade Banner */}
      <UpgradeBanner
        userPlan={userPlan}
        agentCount={agentCount}
        maxAgents={maxAgents}
        tokensUsed={tokensUsed}
        tokensLimit={tokensLimit}
        onUpgrade={handleUpgrade}
        onTrackEvent={trackEvent}
      />

      {/* Token Counter */}
      <div className="mb-6">
        <TokenCounter
          tokensUsed={tokensUsed}
          tokensLimit={tokensLimit}
          userPlan={userPlan}
          showUpgradePrompt={true}
          onUpgrade={handleUpgrade}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Agents</CardTitle>
            <Bot className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agentCount}</div>
            <p className="text-xs text-gray-500">
              {userPlan === "free" ? `${agentCount}/${maxAgents} agents` : "Unlimited agents"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Workflows</CardTitle>
            <Zap className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500">No workflows running</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tasks Completed</CardTitle>
            <Clock className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500">No tasks completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Performance</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-500">No data available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">Create your first agent to get started</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API Services</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Agent Runtime</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Workflow Engine</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Ready
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/agents">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => trackEvent("quick_action_clicked", { action: "create_agent" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </Link>
            <Link href="/workflow">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => trackEvent("quick_action_clicked", { action: "design_workflow" })}
              >
                Design Workflow
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly Usage</span>
                <span className="text-white font-medium">{tokensUsed} / {tokensLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    tokensUsed >= tokensLimit ? 'bg-red-500' : 
                    tokensUsed >= tokensLimit * 0.8 ? 'bg-yellow-500' : 
                    'bg-purple-600'
                  }`}
                  style={{ width: `${Math.min((tokensUsed / tokensLimit) * 100, 100)}%` }}
                />
              </div>
              {tokensUsed >= tokensLimit * 0.8 && userPlan === "free" && (
                <p className="text-yellow-400 text-sm">
                  ⚠️ Approaching token limit
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Limit Modal */}
      <TokenLimitModal
        open={tokenLimitModalOpen}
        onOpenChange={setTokenLimitModalOpen}
        tokensUsed={tokensUsed}
        tokensLimit={tokensLimit}
        userPlan={userPlan}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}