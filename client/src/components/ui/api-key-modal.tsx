import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Key, Zap, CheckCircle, XCircle, Loader2, Shield, Infinity } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasExistingKey?: boolean;
}

export function ApiKeyModal({ open, onOpenChange, hasExistingKey = false }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateApiKey = (key: string) => {
    if (!key.trim()) {
      setValidationResult(null);
      return false;
    }

    if (!key.startsWith('sk-ant-')) {
      setValidationResult({
        isValid: false,
        message: "API key must start with 'sk-ant-'"
      });
      return false;
    }

    if (key.length < 20) {
      setValidationResult({
        isValid: false,
        message: "API key format appears invalid"
      });
      return false;
    }

    setValidationResult({
      isValid: true,
      message: "API key format is valid"
    });
    return true;
  };

  const handleTestConnection = async () => {
    if (!validateApiKey(apiKey)) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await apiRequest('POST', '/api/validate-api-key', { apiKey });
      const result = await response.json();

      setTestResult({
        success: result.valid,
        message: result.valid ? 'Connection successful!' : result.error || 'Connection failed'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test connection'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateApiKey(apiKey)) {
      toast({
        title: 'Invalid API Key',
        description: 'Please enter a valid Anthropic API key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('POST', '/api/users/me/api-key', { apiKey });
      
      toast({
        title: 'API Key Added',
        description: 'Your API key has been securely stored and is ready to use.',
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/usage'] });
      
      // Reset form and close modal
      setApiKey('');
      setValidationResult(null);
      setTestResult(null);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm('Are you sure you want to remove your API key? This will revert to using Orchestra credits.')) {
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('DELETE', '/api/users/me/api-key');
      
      toast({
        title: 'API Key Removed',
        description: 'Your API key has been removed. You\'ll now use Orchestra credits.',
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/usage'] });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            {hasExistingKey ? 'Manage API Key' : 'Add Your API Key'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {hasExistingKey 
              ? 'Update or remove your Anthropic API key'
              : 'Connect your Anthropic API key for unlimited usage'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Card */}
        <Card className="bg-gray-700/50 border-gray-600">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Infinity className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-medium">Unlimited token usage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Encrypted secure storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">No rate limits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasExistingKey ? (
          /* Existing Key Management */
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                API key is configured and active. You have unlimited usage.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setApiKey('');
                  setValidationResult(null);
                  setTestResult(null);
                }}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Update Key
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveKey}
                disabled={isLoading}
                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
              >
                {isLoading ? 'Removing...' : 'Remove Key'}
              </Button>
            </div>
          </div>
        ) : (
          /* Add New Key Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-white">
                Anthropic API Key
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    validateApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="sk-ant-..."
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div className="flex items-center space-x-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {validationResult.message}
                  </span>
                </div>
              )}

              {/* Test Result */}
              {testResult && (
                <Alert className={testResult.success ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-300' : 'text-red-300'}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={!validationResult?.isValid || isTesting}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={!validationResult?.isValid || isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Save API Key
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}