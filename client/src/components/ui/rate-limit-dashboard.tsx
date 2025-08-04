import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RateLimitDisplay } from "./rate-limit-display";
import { useRateLimits } from "@/hooks/use-rate-limits";
import { Clock, Zap, TrendingUp } from "lucide-react";

export function RateLimitDashboard() {
  const { data: rateLimits, isLoading: rateLimitsLoading } = useRateLimits();

  if (rateLimitsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rate Limits Display */}
      {rateLimits && (
        <RateLimitDisplay
          workflowRuns={rateLimits.workflowRuns}
          agentExecutions={rateLimits.agentExecutions}
          isBlocked={rateLimits.isBlocked}
          nextExecutionAllowed={rateLimits.nextExecutionAllowed}
        />
      )}

      {/* Token Usage Display - Placeholder for future integration */}
      {/* <TokenCounter /> */}

      {/* Usage Summary Card */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">Usage Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">This Hour</span>
              </div>
              <div className="text-xl font-bold text-white">
                {rateLimits?.workflowRuns.current || 0}/10
              </div>
              <div className="text-xs text-blue-400">Workflow Runs</div>
            </div>

            <div className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Today</span>
              </div>
              <div className="text-xl font-bold text-white">
                {rateLimits?.agentExecutions.current || 0}/100
              </div>
              <div className="text-xs text-green-400">Agent Executions</div>
            </div>
          </div>

          {/* Status Messages */}
          {rateLimits?.isBlocked && (
            <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-center">
              <div className="text-sm font-medium text-red-300">
                Rate limits reached - executions are currently blocked
              </div>
              <div className="text-xs text-red-400 mt-1">
                Limits reset at the next hour/day boundary
              </div>
            </div>
          )}

          {rateLimits?.nextExecutionAllowed && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-center">
              <div className="text-sm font-medium text-yellow-300">
                Next execution available in a few seconds
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                5-second delay between workflow executions
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}