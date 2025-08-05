import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Workflow,
  TrendingUp,
  AlertTriangle,
  Zap,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@shared/schema";
import { websocketClient, type LogEvent, type ConductorEvent, type TokenUsageEvent } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";

interface LogEntry {
  id: string;
  timestamp: Date;
  agentName: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "failed";
  progress: number;
  agents: string[];
  startTime: Date;
}

export default function Conductor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowStatus[]>([
    {
      id: "wf-001",
      name: "Content Generation Pipeline",
      status: "running",
      progress: 65,
      agents: ["Research Agent", "Writer Agent"],
      startTime: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: "wf-002", 
      name: "Data Analysis Workflow",
      status: "paused",
      progress: 40,
      agents: ["Analysis Agent", "Report Agent"],
      startTime: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    }
  ]);
  const [conductorStatus, setConductorStatus] = useState({
    status: "active",
    currentActivity: "Monitoring 2 workflows",
    lastUpdate: new Date()
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // WebSocket setup for real-time updates
  useEffect(() => {
    websocketClient.subscribeToConductor();

    const handleNewLog = (event: LogEvent) => {
      const logEntry: LogEntry = {
        id: event.id,
        timestamp: new Date(event.timestamp),
        agentName: event.agentName,
        message: event.message,
        level: event.level
      };
      setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    };

    const handleConductorEvent = (event: ConductorEvent) => {
      const logEntry: LogEntry = {
        id: `conductor-${Date.now()}`,
        timestamp: new Date(event.timestamp),
        agentName: "Conductor",
        message: event.message,
        level: "info"
      };
      setLogs(prev => [logEntry, ...prev.slice(0, 49)]);
    };

    const handleTokenUsage = (event: TokenUsageEvent) => {
      // Update token usage for agents (could be expanded to show in UI)
      console.log(`Token usage update: Agent ${event.agentId} used ${event.tokensUsed} tokens`);
    };

    websocketClient.onNewLog(handleNewLog);
    websocketClient.onConductorEvent(handleConductorEvent);
    websocketClient.onTokenUsage(handleTokenUsage);

    return () => {
      websocketClient.offNewLog(handleNewLog);
      websocketClient.offConductorEvent(handleConductorEvent);
      websocketClient.offTokenUsage(handleTokenUsage);
    };
  }, []);

  // Update conductor status
  useEffect(() => {
    setConductorStatus({
      status: "active",
      currentActivity: `Monitoring ${activeWorkflows.length} workflows`,
      lastUpdate: new Date()
    });
  }, [activeWorkflows.length]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePauseWorkflow = async (workflowId: string) => {
    try {
      await apiRequest("POST", `/api/workflows/${workflowId}/pause`);
      setActiveWorkflows(prev => 
        prev.map(w => w.id === workflowId ? { ...w, status: "paused" } : w)
      );
    } catch (error: any) {
      console.error("Failed to pause workflow:", error);
    }
  };

  const handleResumeWorkflow = async (workflowId: string) => {
    try {
      await apiRequest("POST", `/api/workflows/${workflowId}/resume`);
      setActiveWorkflows(prev => 
        prev.map(w => w.id === workflowId ? { ...w, status: "running" } : w)
      );
    } catch (error: any) {
      console.error("Failed to resume workflow:", error);
    }
  };

  const handleRetryFailed = async () => {
    const failedWorkflows = activeWorkflows.filter(w => w.status === "failed");
    
    for (const workflow of failedWorkflows) {
      try {
        await apiRequest("POST", `/api/workflows/${workflow.id}/resume`);
      } catch (error: any) {
        console.error(`Failed to retry workflow ${workflow.id}:`, error);
      }
    }
    
    setActiveWorkflows(prev => 
      prev.map(w => w.status === "failed" ? { ...w, status: "running", progress: 0 } : w)
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const totalAgents = agents?.length || 0;
  const activeAgents = agents?.filter(a => a.status === 'active').length || 0;
  const successRate = totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Conductor Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring and control of Orchestra workflows</p>
      </div>

      {/* Top Row - Status and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Conductor Status */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Conductor Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 bg-orchestra-brown">
                <AvatarFallback className="bg-orchestra-brown text-white text-xl">
                  <Bot className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    conductorStatus.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${
                      conductorStatus.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    {conductorStatus.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Last update: {formatTime(conductorStatus.lastUpdate)}
                  </span>
                </div>
                <p className="text-foreground font-medium">{conductorStatus.currentActivity}</p>
                <p className="text-sm text-muted-foreground">AI orchestration system online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold text-foreground">{totalAgents}</p>
                </div>
                <Users className="w-8 h-8 text-orchestra-brown" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                  <p className="text-2xl font-bold text-foreground">{activeWorkflows.length}</p>
                </div>
                <Workflow className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold text-foreground">{activeAgents}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Workflows */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border h-96">
            <CardHeader>
              <CardTitle className="text-foreground">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              {activeWorkflows.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No active workflows</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a workflow to begin monitoring</p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {activeWorkflows.map((workflow) => (
                      <div key={workflow.id} className="p-3 bg-input rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground text-sm">{workflow.name}</h4>
                          <Badge className={getWorkflowStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{workflow.progress}%</span>
                          </div>
                          <Progress value={workflow.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{workflow.agents.length} agents</span>
                          <span>{formatTime(workflow.startTime)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Log Stream */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-96">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Real-time Activity Log</CardTitle>
              <Badge className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Waiting for activity...</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-muted rounded text-sm">
                        <div className="flex-shrink-0 mt-0.5">
                          {getLogIcon(log.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatTime(log.timestamp)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {log.agentName}
                            </Badge>
                          </div>
                          <p className="text-foreground">{log.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Intervention Panel */}
      <Card className="bg-card border-border mt-8">
        <CardHeader>
          <CardTitle className="text-foreground">Intervention Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePauseWorkflow("all")}
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "running").length === 0}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause All Workflows
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResumeWorkflow("all")}
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "paused").length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume All Workflows
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFailed}
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "failed").length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Failed Agents
            </Button>
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              System uptime: 2h 34m
            </div>
          </div>
        </CardContent>
      </Card>

      </div>
    </div>
  );
}