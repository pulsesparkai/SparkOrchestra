import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAgentSchema, type InsertAgent, type Agent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ApiKeyValidator } from "@/components/ui/api-key-validator";
import { Eye, EyeOff, Save, Play } from "lucide-react";

interface AgentFormProps {
  onPreview: (agent: Partial<Agent> | null) => void;
  onSuccess?: () => void;
}

export default function AgentForm({ onPreview, onSuccess }: AgentFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertAgent>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues: {
      name: "",
      role: "Custom",
      prompt: "",
      model: "",
      apiKey: "",
      conductorMonitoring: false,
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: InsertAgent) => {
      const response = await apiRequest("POST", "/api/agents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent Created",
        description: "Your agent has been successfully created!",
      });
      form.reset();
      onPreview(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    const values = form.getValues();
    if (values.name && values.role && values.prompt && values.model) {
      onPreview({
        ...values,
        id: "preview",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast({
        title: "Preview Updated",
        description: "Agent preview has been updated",
      });
    } else {
      toast({
        title: "Incomplete Form",
        description: "Please fill in required fields to preview",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: InsertAgent) => {
    createAgentMutation.mutate(data);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Create New Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">
                    Agent Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Content Analyzer, Data Processor"
                      className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-orchestra-brown focus:border-orchestra-brown"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 bg-white text-gray-900 focus:ring-orchestra-brown focus:border-orchestra-brown">
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Researcher">Researcher</SelectItem>
                      <SelectItem value="Analyst">Analyst</SelectItem>
                      <SelectItem value="Writer">Writer</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">
                    Agent Prompt <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the agent's role, capabilities, and instructions..."
                      className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-orchestra-brown focus:border-orchestra-brown resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">
                    Language Model <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 bg-white text-gray-900 focus:ring-orchestra-brown focus:border-orchestra-brown">
                        <SelectValue placeholder="Select a model..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="claude-opus">Claude Opus</SelectItem>
                      <SelectItem value="claude-sonnet" disabled>Claude Sonnet (Coming Soon)</SelectItem>
                      <SelectItem value="claude-haiku" disabled>Claude Haiku (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ApiKeyValidator
                      value={field.value || ""}
                      onChange={field.onChange}
                      onValidationChange={setIsApiKeyValid}
                      disabled={createAgentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conductorMonitoring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-900">
                      Enable Conductor Monitoring
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-600">
                      Enable monitoring and intervention for this agent
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Agent
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orchestra-brown text-white hover:bg-orchestra-brown-hover"
                disabled={createAgentMutation.isPending || !isApiKeyValid}
              >
                <Save className="w-4 h-4 mr-2" />
                {createAgentMutation.isPending ? "Saving..." : "Save Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
