import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface RateLimitStats {
  current: number;
  limit: number;
  resetTime: Date;
}

interface RateLimitDisplayProps {
  workflowRuns: RateLimitStats;
  agentExecutions: RateLimitStats;
  isBlocked: boolean;
  nextExecutionAllowed?: Date;
  className?: string;
}

export function RateLimitDisplay({
  workflowRuns,
  agentExecutions,
  isBlocked,
  nextExecutionAllowed,
  className
}: RateLimitDisplayProps) {
  const formatTimeUntilReset = (resetTime: Date) => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Resetting now";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m`;
    }
    return `Resets in ${minutes}m`;
  };

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (current: number, limit: number) => {
    if (current >= limit) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    if (current >= limit * 0.8) {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  return (
    <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">Rate Limits</span>
          </div>
          
          {isBlocked ? (
            <Badge variant="destructive" className="bg-red-900/50 text-red-300 border-red-500/20">
              Blocked
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/20">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workflow Runs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(workflowRuns.current, workflowRuns.limit)}
              <span className="text-sm font-medium text-gray-300">
                Workflow Runs (Hourly)
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {workflowRuns.current}/{workflowRuns.limit}
              </div>
              <div className="text-xs text-gray-400">
                {formatTimeUntilReset(workflowRuns.resetTime)}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress 
              value={(workflowRuns.current / workflowRuns.limit) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{workflowRuns.limit} max</span>
            </div>
          </div>
        </div>

        {/* Agent Executions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(agentExecutions.current, agentExecutions.limit)}
              <span className="text-sm font-medium text-gray-300">
                Agent Executions (Daily)
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {agentExecutions.current}/{agentExecutions.limit}
              </div>
              <div className="text-xs text-gray-400">
                {formatTimeUntilReset(agentExecutions.resetTime)}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress 
              value={(agentExecutions.current / agentExecutions.limit) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{agentExecutions.limit} max</span>
            </div>
          </div>
        </div>

        {/* Next Execution Timer */}
        {nextExecutionAllowed && nextExecutionAllowed > new Date() && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">
                Next execution in {Math.ceil((nextExecutionAllowed.getTime() - Date.now()) / 1000)}s
              </span>
            </div>
            <div className="text-xs text-yellow-400 mt-1">
              5-second delay enforced between workflow executions
            </div>
          </div>
        )}

        {/* Status Messages */}
        {workflowRuns.current >= workflowRuns.limit && (
          <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="text-sm font-medium text-red-300">
              Hourly workflow limit reached
            </div>
            <div className="text-xs text-red-400 mt-1">
              {formatTimeUntilReset(workflowRuns.resetTime)}
            </div>
          </div>
        )}

        {agentExecutions.current >= agentExecutions.limit && (
          <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="text-sm font-medium text-red-300">
              Daily agent execution limit reached
            </div>
            <div className="text-xs text-red-400 mt-1">
              {formatTimeUntilReset(agentExecutions.resetTime)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}