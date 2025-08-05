import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Brain, Key, Clock, MoreVertical, Eye } from "lucide-react";
import type { Agent } from "@shared/schema";

export default function AgentList() {
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "idle":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Existing Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 border border-gray-600 rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Existing Agents</CardTitle>
          <span className="text-sm text-gray-400">
            {agents?.length || 0} agent{agents?.length !== 1 ? 's' : ''} configured
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!agents || agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-300 text-lg mb-2">No agents created yet</p>
            <p className="text-sm text-gray-500">Create your first agent to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-white truncate">
                        {agent.name}
                      </h3>
                      {agent.role && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {agent.role}
                        </span>
                      )}
                      {agent.conductorMonitoring && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          <Eye className="w-3 h-3 mr-1 inline" />
                          Monitored
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                      {agent.prompt}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>
                        <Brain className="w-3 h-3 mr-1 inline" />
                        {agent.model}
                      </span>
                      <span>
                        <Key className="w-3 h-3 mr-1 inline" />
                        {agent.encryptedApiKey ? "Custom" : "Environment"}
                      </span>
                      <span>
                        <Clock className="w-3 h-3 mr-1 inline" />
                        Created {formatDate(agent.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${getStatusDot(agent.status)}`}></div>
                      {agent.status || "Unknown"}
                    </span>
                    <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
