import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Save, Bot, Key } from "lucide-react";

const agentFormSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Role selection is required"),
  prompt: z.string().min(10, "System prompt must be at least 10 characters"),
  model: z.string().min(1, "Model selection is required"),
  apiKey: z.string().optional(),
  usePlatformKey: z.boolean().default(true),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

interface AgentCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AgentCreateModal({ open, onOpenChange, onSuccess }: AgentCreateModalProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      role: "",
      prompt: "",
      model: "",
      apiKey: "",
      usePlatformKey: true,
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const agentData = {
        name: data.name,
        role: data.role,
        prompt: data.prompt,
        model: data.model,
        apiKey: data.usePlatformKey ? undefined : data.apiKey,
        conductorMonitoring: false,
        userId: user.id
      };
      
      const response = await apiRequest("POST", "/api/agents", agentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent Created",
        description: "Your agent has been successfully created!",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Agent creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AgentFormData) => {
    createAgentMutation.mutate(data);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-800 border border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Bot className="w-5 h-5 text-orange-400" />
            <span>Create New Agent</span>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Agent Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Agent Name <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Content Analyzer, Data Processor"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Role <span className="text-red-400">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500">
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Analyzer" className="text-white hover:bg-gray-600">Analyzer</SelectItem>
                      <SelectItem value="Writer" className="text-white hover:bg-gray-600">Writer</SelectItem>
                      <SelectItem value="Reviewer" className="text-white hover:bg-gray-600">Reviewer</SelectItem>
                      <SelectItem value="Custom" className="text-white hover:bg-gray-600">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    System Prompt <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the agent's role, capabilities, and instructions..."
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Selection */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Language Model <span className="text-red-400">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500">
                        <SelectValue placeholder="Select a model..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="claude-sonnet-4-20250514" className="text-white hover:bg-gray-600">
                        Claude Sonnet 4 (Latest)
                      </SelectItem>
                      <SelectItem value="gpt-4-turbo" className="text-white hover:bg-gray-600">
                        GPT-4 Turbo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Key Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="usePlatformKey"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-600 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-300">
                        Use Platform API Key
                      </FormLabel>
                      <p className="text-xs text-gray-400">
                        Use Orchestra credits instead of your own API key
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("usePlatformKey") && (
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Your API Key <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder="sk-ant-..."
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8 text-gray-400 hover:text-white"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>• Unlimited usage with your own Anthropic API key</p>
                        <p>• Encrypted and stored securely</p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModalClose(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={createAgentMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}