import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import AgentForm from "@/components/agent-form";
import AgentPreview from "@/components/agent-preview";
import AgentList from "@/components/agent-list";
import { useState } from "react";
import type { Agent } from "@shared/schema";

export default function Agents() {
  const [previewAgent, setPreviewAgent] = useState<Partial<Agent> | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Agent Management</h1>
            <p className="text-gray-400">Create and configure AI agents for your Orchestra workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Agents
            </Button>
            <Button 
              size="sm"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AgentForm onPreview={setPreviewAgent} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <AgentPreview agent={previewAgent} />
            <AgentList />
          </div>
        </div>
      </div>
    </div>
  );
}