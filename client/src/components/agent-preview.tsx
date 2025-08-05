import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Brain, Key, Eye } from "lucide-react";
import type { Agent } from "@shared/schema";

interface AgentPreviewProps {
  agent: Partial<Agent> | null;
}

export default function AgentPreview({ agent }: AgentPreviewProps) {
  if (!agent) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Agent Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400">Fill out the form to preview your agent</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Agent Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-white truncate">
                  {agent.name || "Agent Name"}
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
                {agent.prompt || "Agent prompt will appear here..."}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>
                  <Brain className="w-3 h-3 mr-1 inline" />
                  Model: {agent.model || "Not selected"}
                </span>
                <span>
                  <Key className="w-3 h-3 mr-1 inline" />
                  API: {agent.encryptedApiKey ? "Custom" : "Environment"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 inline-block"></div>
                Ready
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
