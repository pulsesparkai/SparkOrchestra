import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Settings, Workflow as WorkflowIcon } from "lucide-react";

export default function Workflow() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Workflow Management</h1>
            <p className="text-gray-400">Design and orchestrate AI agent workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              size="sm"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700 h-96">
            <CardHeader>
              <CardTitle className="text-white">Workflow Designer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WorkflowIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-300 text-lg mb-2">No workflows created yet</p>
                <p className="text-sm text-gray-500 mb-4">Create your first workflow to orchestrate AI agents</p>
                <Button className="bg-purple-600 text-white hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Available Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WorkflowIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No agents available</p>
                  <p className="text-sm text-gray-500 mt-1">Create agents first to use in workflows</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Workflow Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-gray-600 text-gray-400"
                    disabled
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Workflow
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-gray-600 text-gray-400"
                    disabled
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Workflow
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-gray-600 text-gray-400"
                    disabled
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}