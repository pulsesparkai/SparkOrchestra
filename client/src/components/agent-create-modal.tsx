import { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

const agentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  role: z.string().min(1, 'Role is required'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  model: z.string().min(1, 'Model is required'),
  apiKey: z.string().optional(),
  usePlatformKey: z.boolean().default(true)
});

type AgentFormData = z.infer<typeof agentSchema>;

interface AgentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentCreateModal({ isOpen, onClose }: AgentCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      role: 'Custom',
      prompt: '',
      model: 'claude-sonnet-4-20250514',
      apiKey: '',
      usePlatformKey: true
    }
  });

  const handleSubmit = async (data: AgentFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        role: data.role,
        prompt: data.prompt,
        model: data.model,
        apiKey: !data.usePlatformKey ? data.apiKey : undefined
      };

      await apiRequest('POST', '/api/agents', payload);
      
      toast({
        title: 'Agent Created',
        description: `${data.name} has been created successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create agent',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Agent Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Customer Support Agent"
            />
            {form.formState.errors.name && (
              <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-white">Role</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Analyzer">Analyzer</SelectItem>
                <SelectItem value="Writer">Writer</SelectItem>
                <SelectItem value="Reviewer">Reviewer</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt" className="text-white">System Prompt</Label>
            <Textarea
              id="prompt"
              {...form.register('prompt')}
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              placeholder="You are a helpful AI assistant that..."
            />
            {form.formState.errors.prompt && (
              <p className="text-red-400 text-sm mt-1">{form.formState.errors.prompt.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="model" className="text-white">Model</Label>
            <Select
              value={form.watch('model')}
              onValueChange={(value) => form.setValue('model', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usePlatformKey"
                checked={form.watch('usePlatformKey')}
                onCheckedChange={(checked) => form.setValue('usePlatformKey', checked as boolean)}
              />
              <Label htmlFor="usePlatformKey" className="text-white">
                Use Platform API Key
              </Label>
            </div>
            
            {!form.watch('usePlatformKey') && (
              <div>
                <Label htmlFor="apiKey" className="text-white">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  {...form.register('apiKey')}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="sk-ant-..."
                />
                <p className="text-gray-400 text-xs mt-1">
                  Using your own key provides unlimited usage
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}