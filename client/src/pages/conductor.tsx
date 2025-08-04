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

  // Simulate real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const mockMessages = [
        "Processing data batch completed successfully",
        "Analyzing sentiment from 150 documents",
        "Generated content review completed",
        "Research query executed with 98% accuracy",
        "Workflow checkpoint reached",
        "Agent synchronization complete"
      ];

      const agentNames = agents?.map(a => a.name) || ["Research Agent", "Content Agent", "Analysis Agent"];
      const levels: Array<"info" | "warning" | "error" | "success"> = ["info", "success", "warning"];
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        agentName: agentNames[Math.floor(Math.random() * agentNames.length)],
        message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        level: levels[Math.floor(Math.random() * levels.length)]
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    }, 3000);

    return () => clearInterval(interval);
  }, [agents]);

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

  const handlePauseWorkflow = (workflowId: string) => {
    setActiveWorkflows(prev => 
      prev.map(w => w.id === workflowId ? { ...w, status: "paused" } : w)
    );
  };

  const handleResumeWorkflow = (workflowId: string) => {
    setActiveWorkflows(prev => 
      prev.map(w => w.id === workflowId ? { ...w, status: "running" } : w)
    );
  };

  const handleRetryFailed = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Conductor Dashboard</h1>
        <p className="text-gray-400">Real-time monitoring and control of Orchestra workflows</p>
      </div>

      {/* Top Row - Status and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Conductor Status */}
        <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Conductor Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 bg-purple-600">
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  <Bot className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    conductorStatus.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
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
                <p className="text-white font-medium">{conductorStatus.currentActivity}</p>
                <p className="text-sm text-gray-400">AI orchestration system online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Agents</p>
                  <p className="text-2xl font-bold text-white">{totalAgents}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Workflows</p>
                  <p className="text-2xl font-bold text-white">{activeWorkflows.length}</p>
                </div>
                <Workflow className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Agents</p>
                  <p className="text-2xl font-bold text-white">{activeAgents}</p>
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
          <Card className="bg-gray-900 border-gray-700 h-96">
            <CardHeader>
              <CardTitle className="text-white">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              {activeWorkflows.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No active workflows</p>
                  <p className="text-sm text-gray-500 mt-1">Start a workflow to begin monitoring</p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {activeWorkflows.map((workflow) => (
                      <div key={workflow.id} className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{workflow.name}</h4>
                          <Badge className={getWorkflowStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{workflow.progress}%</span>
                          </div>
                          <Progress value={workflow.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
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
          <Card className="bg-gray-900 border-gray-700 h-96">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Real-time Activity Log</CardTitle>
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
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400">Waiting for activity...</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded text-sm">
                        <div className="flex-shrink-0 mt-0.5">
                          {getLogIcon(log.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-400 font-mono">
                              {formatTime(log.timestamp)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {log.agentName}
                            </Badge>
                          </div>
                          <p className="text-gray-300">{log.message}</p>
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
      <Card className="bg-gray-900 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Intervention Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePauseWorkflow("all")}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "running").length === 0}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause All Workflows
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResumeWorkflow("all")}
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "paused").length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume All Workflows
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFailed}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              disabled={activeWorkflows.filter(w => w.status === "failed").length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Failed Agents
            </Button>
            <div className="flex-1" />
            <div className="text-sm text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              System uptime: 2h 34m
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}