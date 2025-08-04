import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitDisplayProps {
  workflowRuns: {
    current: number;
    limit: number;
    resetTime: Date;
  };
  agentExecutions: {
    current: number;
    limit: number;
    resetTime: Date;
  };
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
  const workflowUsagePercentage = (workflowRuns.current / workflowRuns.limit) * 100;
  const agentUsagePercentage = (agentExecutions.current / agentExecutions.limit) * 100;
  
  const isWorkflowNearLimit = workflowUsagePercentage >= 80;
  const isAgentNearLimit = agentUsagePercentage >= 80;

  const formatTimeUntilReset = (resetTime: Date) => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatNextExecutionTime = () => {
    if (!nextExecutionAllowed) return null;
    
    const now = new Date();
    const diff = nextExecutionAllowed.getTime() - now.getTime();
    const seconds = Math.ceil(diff / 1000);
    
    if (seconds <= 0) return null;
    return `${seconds}s`;
  };

  return (
    <Card className={cn("bg-gray-900/50 border-gray-700", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Rate Limits</span>
          </div>
          {isBlocked && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Blocked
            </Badge>
          )}
        </div>

        {/* Workflow Runs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Play className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-gray-300">Workflow Runs</span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              workflowRuns.current >= workflowRuns.limit ? "text-red-400" :
              isWorkflowNearLimit ? "text-yellow-400" : "text-green-400"
            )}>
              {workflowRuns.current}/{workflowRuns.limit}
            </span>
          </div>
          
          <Progress 
            value={workflowUsagePercentage} 
            className="h-1.5"
            style={{
              "--progress-background": workflowRuns.current >= workflowRuns.limit
                ? "rgb(239 68 68)" // red-500
                : isWorkflowNearLimit 
                  ? "rgb(234 179 8)" // yellow-500  
                  : "rgb(59 130 246)" // blue-500
            } as React.CSSProperties}
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Per Hour</span>
            <span>Resets in {formatTimeUntilReset(workflowRuns.resetTime)}</span>
          </div>
        </div>

        {/* Agent Executions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span className="text-sm text-gray-300">Agent Executions</span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              agentExecutions.current >= agentExecutions.limit ? "text-red-400" :
              isAgentNearLimit ? "text-yellow-400" : "text-green-400"
            )}>
              {agentExecutions.current}/{agentExecutions.limit}
            </span>
          </div>
          
          <Progress 
            value={agentUsagePercentage} 
            className="h-1.5"
            style={{
              "--progress-background": agentExecutions.current >= agentExecutions.limit
                ? "rgb(239 68 68)" // red-500
                : isAgentNearLimit 
                  ? "rgb(234 179 8)" // yellow-500  
                  : "rgb(34 197 94)" // green-500
            } as React.CSSProperties}
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Per Day</span>
            <span>Resets in {formatTimeUntilReset(agentExecutions.resetTime)}</span>
          </div>
        </div>

        {/* Next Execution Timer */}
        {nextExecutionAllowed && (
          <div className="p-2 bg-yellow-900/20 border border-yellow-500/20 rounded text-center">
            <div className="flex items-center justify-center space-x-2 text-yellow-300">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">
                Next execution in {formatNextExecutionTime()}
              </span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {(isWorkflowNearLimit || isAgentNearLimit) && !isBlocked && (
          <div className="text-xs text-yellow-400 text-center">
            Approaching rate limits - executions may be delayed
          </div>
        )}
      </CardContent>
    </Card>
  );
}