import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Save, Trash2, Settings, Bot, Search, FileText, BarChart3, PenTool, Zap } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import type { Agent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import type { ExecutionMode } from "@shared/schema";

// Import React Flow hooks properly
import { useNodesState, useEdgesState } from 'reactflow';

// Workflow Canvas Component with proper React Flow hooks
function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // FIX: use onEdgesChange not onEdgesState
  
  // For now, return a simplified canvas
  return (
    <div className="h-96 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Workflow Canvas - React Flow integration ready</p>
    </div>
  );
}

export default function Workflow() {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('sequential');
  const [showParallelVisualization, setShowParallelVisualization] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run workflows.",
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
        agentIds,
        userId: user.id,
        executionMode
      });

      toast({
        title: "Workflow Started",
        description: `Running workflow with ${agentIds.length} agents in ${executionMode} mode`,
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

  const saveWorkflow = async () => {
    if (selectedAgents.length === 0) {
      toast({
        title: "No Agents to Save",
        description: "Add agents to the workflow before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        name: `Workflow ${new Date().toLocaleDateString()}`,
        agents: selectedAgents.map(a => ({ id: a.id, name: a.name, role: a.role })),
        createdAt: new Date().toISOString()
      };

      // Save to localStorage for now (could be enhanced to save to database)
      const savedWorkflows = JSON.parse(localStorage.getItem('orchestra-workflows') || '[]');
      savedWorkflows.push(workflowData);
      localStorage.setItem('orchestra-workflows', JSON.stringify(savedWorkflows));

      toast({
        title: "Workflow Saved",
        description: `Saved workflow with ${selectedAgents.length} agents`,
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Workflow Designer</h1>
            <p className="text-gray-600">Create and execute AI agent workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearWorkflow}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              disabled={selectedAgents.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Mode:</label>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
              >
                <option value="sequential">Sequential</option>
                <option value="parallel">Parallel</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={saveWorkflow}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              disabled={selectedAgents.length === 0 || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              onClick={runWorkflow}
              disabled={selectedAgents.length === 0 || isRunning}
              className="bg-orchestra-brown text-white hover:bg-orchestra-brown-hover"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : `Run ${executionMode === 'parallel' ? 'Parallel' : 'Sequential'}`}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Agents */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Available Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !agents || agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No agents available</p>
                <p className="text-sm text-gray-500">Create agents first to use in workflows</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orchestra-brown rounded-lg flex items-center justify-center">
                          {getRoleIcon(agent.role || "Custom")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{agent.name}</h3>
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
                        className="bg-orchestra-brown hover:bg-orchestra-brown-hover text-white"
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
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center justify-between">
              <span>Workflow {executionMode === 'parallel' ? 'Levels' : 'Sequence'}</span>
              {selectedAgents.length > 1 && executionMode === 'parallel' && (
                <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  ⚡ Time saved: ~{Math.max(0, (selectedAgents.length - 1) * 15)}s
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No agents in workflow</p>
                <p className="text-sm text-gray-500">Add agents from the left panel</p>
              </div>
            ) : (
              <div className={executionMode === 'parallel' ? 'space-y-2' : 'space-y-3'}>
                {executionMode === 'parallel' ? (
                  // Parallel visualization - all agents in one level
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Level 1 - All agents execute simultaneously
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedAgents.map((agent) => (
                        <div key={agent.id} className="p-3 bg-white border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-orchestra-brown rounded-lg flex items-center justify-center">
                                {getRoleIcon(agent.role || "Custom")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm truncate">{agent.name}</h3>
                                <p className="text-xs text-gray-600">{agent.role || "Custom"}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAgentFromWorkflow(agent.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Sequential visualization - existing layout
                  selectedAgents.map((agent, index) => (
                    <div key={agent.id} className="relative">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orchestra-brown rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 bg-orchestra-brown rounded-lg flex items-center justify-center">
                              {getRoleIcon(agent.role || "Custom")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm truncate">{agent.name}</h3>
                              <p className="text-xs text-gray-600">{agent.role || "Custom"}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAgentFromWorkflow(agent.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Arrow connector for sequential */}
                      {index < selectedAgents.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-4 bg-orchestra-brown"></div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Status */}
      {selectedAgents.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200 mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900">Workflow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{selectedAgents.length}</span> agents selected
                </div>
                <div className="text-sm text-gray-900">
                  {executionMode === 'parallel' ? 'Parallel execution' : 'Sequential execution order'}
                </div>
                {executionMode === 'parallel' && selectedAgents.length > 1 && (
                  <div className="text-sm text-green-600 font-medium">
                    ⚡ ~{Math.max(0, (selectedAgents.length - 1) * 15)}s faster
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">
                  {executionMode === 'parallel' ? 'All agents run simultaneously' : 'Agents run one after another'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  executionMode === 'parallel' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Mode Info */}
      {selectedAgents.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200 mt-8">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                executionMode === 'parallel' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {executionMode === 'parallel' ? (
                  <Zap className={`w-5 h-5 text-blue-600`} />
                ) : (
                  <div className="w-5 h-5 border-2 border-green-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {executionMode === 'parallel' ? 'Parallel Execution' : 'Sequential Execution'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {executionMode === 'parallel' 
                    ? 'All agents will execute simultaneously, sharing data through inter-agent communication.'
                    : 'Agents will execute one after another, passing data sequentially through the workflow.'
                  }
                </p>
                {executionMode === 'parallel' && selectedAgents.length > 1 && (
                  <div className="text-sm text-blue-600 font-medium">
                    ⚡ Estimated time savings: ~{Math.max(0, (selectedAgents.length - 1) * 15)} seconds
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    {executionMode === 'parallel' && selectedAgents.length > 1 && (
                      <div className="text-sm text-green-600 font-medium">
                        ⚡ Time saved: ~{Math.max(0, (selectedAgents.length - 1) * 15)}s
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Execution Time</div>
                    <div className="text-sm font-medium text-gray-900">
                      ~{executionMode === 'parallel' ? 30 : selectedAgents.length * 30}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}