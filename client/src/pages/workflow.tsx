import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Save, Trash2, Settings, Bot, Search, FileText, BarChart3, PenTool, Zap } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Simplified workflow without React Flow for now
export default function Workflow() {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const addAgentToWorkflow = (agent: Agent) => {
    if (!selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents(prev => [...prev, agent]);
      toast({
        title: "Agent Added",
        description: `${agent.name} added to workflow`,
      });
    }
  };

  const removeAgentFromWorkflow = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const runWorkflow = async () => {
    if (selectedAgents.length === 0) {
      toast({
        title: "No Agents Selected",
        description: "Add agents to the workflow before running.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      const workflowId = `workflow-${Date.now()}`;
      const agentIds = selectedAgents.map(a => a.id);

      await apiRequest("POST", "/api/workflows/run", {
        workflowId,
        agentIds
      });

      toast({
        title: "Workflow Started",
        description: `Running workflow with ${agentIds.length} agents`,
      });
    } catch (error: any) {
      toast({
        title: "Workflow Failed",
        description: error.message || "Failed to start workflow",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearWorkflow = () => {
    setSelectedAgents([]);
    toast({
      title: "Workflow Cleared",
      description: "All agents removed from workflow",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Researcher":
        return <Search className="w-4 h-4" />;
      case "Writer":
        return <PenTool className="w-4 h-4" />;
      case "Analyst":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Workflow Designer</h1>
            <p className="text-muted-foreground">Create and execute AI agent workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearWorkflow}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              disabled={selectedAgents.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              disabled={selectedAgents.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={runWorkflow}
              disabled={selectedAgents.length === 0 || isRunning}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Run Workflow"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Agents */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Available Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !agents || agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-2">No agents available</p>
                <p className="text-sm text-gray-500">Create agents first to use in workflows</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          {getRoleIcon(agent.role || "Custom")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">{agent.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {agent.role || "Custom"}
                            </Badge>
                            <span className={`w-2 h-2 rounded-full ${
                              agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addAgentToWorkflow(agent)}
                        disabled={selectedAgents.find(a => a.id === agent.id) !== undefined}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {selectedAgents.find(a => a.id === agent.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Builder */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Workflow Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-2">No agents in workflow</p>
                <p className="text-sm text-gray-500">Add agents from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedAgents.map((agent, index) => (
                  <div key={agent.id} className="relative">
                    <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            {getRoleIcon(agent.role || "Custom")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">{agent.name}</h3>
                            <p className="text-xs text-gray-400">{agent.role || "Custom"}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAgentFromWorkflow(agent.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Arrow connector */}
                    {index < selectedAgents.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-0.5 h-4 bg-purple-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Status */}
      {selectedAgents.length > 0 && (
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Workflow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  <span className="font-medium">{selectedAgents.length}</span> agents selected
                </div>
                <div className="text-sm text-gray-300">
                  Sequential execution order
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Ready to execute</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}