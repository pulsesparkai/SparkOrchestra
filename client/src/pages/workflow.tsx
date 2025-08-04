import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Save, Trash2, Settings, Bot, Search, FileText, BarChart3, PenTool, Circle, Zap } from "lucide-react";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@shared/schema";
import { websocketClient, type WorkflowProgressEvent } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom Agent Node Component
const AgentNode = ({ data, selected }: { data: any; selected: boolean }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500 animate-pulse";
      case "complete":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "idle":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "running":
        return "Running";
      case "complete":
        return "Complete";
      case "error":
        return "Error";
      case "idle":
        return "Idle";
      default:
        return "Ready";
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-gray-800 border-2 min-w-[200px] ${
        selected ? "border-purple-500" : "border-gray-600"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400" />
      
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          {getRoleIcon(data.role)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white text-sm truncate">{data.name}</h3>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status || 'idle')}`} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{data.role}</p>
            <p className="text-xs text-gray-300">{getStatusLabel(data.status || 'idle')}</p>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-400" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
};

function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, "idle" | "running" | "complete" | "error">>({});
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // WebSocket setup for real-time updates
  useEffect(() => {
    const handleWorkflowProgress = (event: WorkflowProgressEvent) => {
      setNodeStatuses(prev => ({
        ...prev,
        [event.agentId]: event.status
      }));

      // Update node data with new status
      setNodes(nodes => nodes.map(node => {
        if (node.data.id === event.agentId) {
          return {
            ...node,
            data: {
              ...node.data,
              status: event.status,
              progress: event.progress
            }
          };
        }
        return node;
      }));

      // Show toast for status changes
      if (event.status === "complete") {
        toast({
          title: "Agent Completed",
          description: `${event.message || 'Agent finished processing'}`,
        });
      } else if (event.status === "error") {
        toast({
          title: "Agent Error",
          description: `${event.message || 'Agent encountered an error'}`,
          variant: "destructive",
        });
      }
    };

    websocketClient.onWorkflowProgress(handleWorkflowProgress);

    return () => {
      websocketClient.offWorkflowProgress(handleWorkflowProgress);
    };
  }, [setNodes, toast]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const agentData = event.dataTransfer.getData("application/reactflow");

      if (typeof agentData === "undefined" || !agentData || !reactFlowBounds) {
        return;
      }

      const agent = JSON.parse(agentData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${agent.id}-${Date.now()}`,
        type: "agentNode",
        position,
        data: agent,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast({
      title: "Canvas Cleared",
      description: "All nodes and connections have been removed.",
    });
  };

  const runWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Add agents to the canvas to create a workflow.",
        variant: "destructive",
      });
      return;
    }

    try {
      const workflowId = `workflow-${Date.now()}`;
      const agentIds = nodes.map(node => node.data.id);

      // Subscribe to this workflow's events
      websocketClient.subscribeToWorkflow(workflowId);

      // Start the workflow
      await apiRequest("POST", `/api/workflows/${workflowId}/start`, {
        agentIds,
        userId: 'demo-user' // TODO: Get from auth context
      });

      toast({
        title: "Workflow Started",
        description: `Running workflow with ${nodes.length} agent(s)...`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Start Workflow",
        description: error.message || "Unable to start workflow",
        variant: "destructive",
      });
    }
  };

  const saveWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to Save",
        description: "Add agents to the canvas before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved successfully.",
    });
  };

  return (
    <div className="h-screen flex bg-gray-950">
      {/* Left Sidebar - Available Agents */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Available Agents</h2>
          <p className="text-sm text-gray-400">Drag agents to the canvas to build workflows</p>
        </div>

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
          <div className="text-center py-8">
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
                className="p-3 bg-gray-800 border border-gray-600 rounded-lg cursor-grab hover:bg-gray-700 transition-colors"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("application/reactflow", JSON.stringify(agent));
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Workflow Designer</h1>
              <p className="text-sm text-gray-400">
                {nodes.length} agent{nodes.length !== 1 ? 's' : ''} • {edges.length} connection{edges.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Canvas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveWorkflow}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={runWorkflow}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Workflow
              </Button>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 flex">
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-950"
            >
              <Controls className="bg-gray-800 border-gray-600" />
              <MiniMap className="bg-gray-800 border-gray-600" />
              <Background color="#374151" gap={20} />
            </ReactFlow>
          </div>

          {/* Right Panel - Node Details */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Node Details</h2>
              <p className="text-sm text-gray-400">Select a node to view details</p>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center space-x-2">
                      <Bot className="w-5 h-5" />
                      <span>{selectedNode.data.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-400">Role</label>
                      <p className="text-sm text-white">{selectedNode.data.role || "Custom"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400">Model</label>
                      <p className="text-sm text-white">{selectedNode.data.model}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400">Status</label>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedNode.data.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm text-white capitalize">
                          {selectedNode.data.status || "unknown"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400">Prompt Preview</label>
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {selectedNode.data.prompt}
                      </p>
                    </div>
                    {selectedNode.data.conductorMonitoring && (
                      <div>
                        <Badge className="bg-orange-100 text-orange-800">
                          Monitored
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Node
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                      setSelectedNode(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Node
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No node selected</p>
                <p className="text-sm text-gray-500 mt-1">Click on a node to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Workflow() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}