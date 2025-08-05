import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Search, Bot, Edit, Trash2, Calendar, Zap } from "lucide-react";
import AgentForm from "@/components/agent-form";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { TokenCounter } from "@/components/ui/token-counter";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { TokenLimitModal } from "@/components/ui/token-limit-modal";
import { ApiKeyIndicator } from "@/components/ui/api-key-indicator";
import type { Agent } from "@shared/schema";

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<{ open: boolean; reason: "agents" | "tokens" | "features" }>({ open: false, reason: "agents" });
  const [tokenLimitModalOpen, setTokenLimitModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Mock user data - would come from API/context in real app
  const userPlan = "free" as const;
  const agentCount = agents?.length || 0;
  const maxAgents = 2;
  const tokensUsed = 95; // Near limit to show prompts
  const tokensLimit = 100;

  useEffect(() => {
    // Track page view
    trackEvent("agents_page_viewed", {
      user_plan: userPlan,
      agent_count: agentCount,
      tokens_used: tokensUsed
    });
  }, [agentCount]);

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent Deleted",
        description: "The agent has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      if (error?.status === 403) {
        trackEvent("agent_limit_hit", {
          source: "delete_attempt",
          agent_count: agentCount,
          max_agents: maxAgents
        });
        setUpgradePrompt({ open: true, reason: "agents" });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete agent. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || agent.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteAgentMutation.mutate(id);
    }
  };

  const handleUpgrade = () => {
    trackEvent("upgrade_initiated", {
      source: "agents_page",
      user_plan: userPlan,
      agent_count: agentCount,
      tokens_used: tokensUsed
    });
    
    // TODO: Redirect to upgrade flow/Stripe
    console.log("Redirecting to upgrade...");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Agent Management</h1>
            <p className="text-muted-foreground">Create and configure AI agents for your Orchestra workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Agents
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  data-tour="create-agent-button"
                  className="bg-orchestra-brown text-white hover:bg-orchestra-brown-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Agent</DialogTitle>
                </DialogHeader>
                <AgentForm 
                  onPreview={() => {}} 
                  onSuccess={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Token Counter */}
        <div className="mb-6">
          <TokenCounter
            tokensUsed={tokensUsed}
            tokensLimit={tokensLimit}
            userPlan={userPlan}
            showUpgradePrompt={true}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-orchestra-brown focus:border-orchestra-brown"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48 border-border bg-input text-foreground focus:ring-orchestra-brown focus:border-orchestra-brown">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Researcher">Researcher</SelectItem>
              <SelectItem value="Analyst">Analyst</SelectItem>
              <SelectItem value="Writer">Writer</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-muted rounded"></div>
                    <div className="h-8 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            {agents?.length === 0 ? "No agents created yet" : "No agents match your search"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {agents?.length === 0 
              ? "Create your first agent to get started with Orchestra workflows"
              : "Try adjusting your search terms or filters"
            }
          </p>
          {agents?.length === 0 && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orchestra-brown text-white hover:bg-orchestra-brown-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Agent</DialogTitle>
                </DialogHeader>
                <AgentForm 
                  onPreview={() => {}} 
                  onSuccess={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="bg-card border-border hover:border-orchestra-brown/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-orchestra-brown rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate mb-1">
                        {agent.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {agent.role || "Custom"}
                        </span>
                        {agent.conductorMonitoring && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Monitored
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-foreground">
                    <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{agent.model}</span>
                  </div>

                  <div className="flex items-center text-sm text-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Created {formatDate(agent.createdAt || new Date())}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-foreground">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>1,234 tokens used this month</span>
                    </div>
                    <ApiKeyIndicator hasApiKey={!!(agent as any).hasApiKey} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    {agent.status || "Unknown"}
                  </span>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDelete(agent.id, agent.name)}
                      disabled={deleteAgentMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Prompt Dialog */}
      <UpgradePrompt
        open={upgradePrompt.open}
        onOpenChange={(open) => setUpgradePrompt({ ...upgradePrompt, open })}
        reason={upgradePrompt.reason}
        currentUsage={{ used: agentCount, limit: maxAgents }}
        onUpgrade={() => {
          trackEvent("upgrade_clicked", {
            source: "upgrade_prompt",
            reason: upgradePrompt.reason,
            agent_count: agentCount,
            tokens_used: tokensUsed
          });
          // TODO: Redirect to upgrade flow
        }}
      />

      </div>
    </div>

      {/* Token Limit Modal */}
      <TokenLimitModal
        open={tokenLimitModalOpen}
        onOpenChange={setTokenLimitModalOpen}
        tokensUsed={tokensUsed}
        tokensLimit={tokensLimit}
        userPlan={userPlan}
        onUpgrade={() => {
          trackEvent("upgrade_clicked", {
            source: "token_limit_modal",
            tokens_used: tokensUsed,
            tokens_limit: tokensLimit
          });
          // TODO: Redirect to upgrade flow
        }}

      />
    </div>
  );
}