import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, XCircle, Key, Zap, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ApiKeyValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

export function ApiKeyValidator({ value, onChange, onValidationChange, disabled }: ApiKeyValidatorProps) {
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const validateApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setValidationResult(null);
      onValidationChange(true); // Empty is valid (optional field)
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      setValidationResult({
        isValid: false,
        message: "API key must start with 'sk-ant-'"
      });
      onValidationChange(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiRequest("POST", "/api/validate-api-key", { apiKey });
      const result = await response.json();
      
      setValidationResult({
        isValid: result.valid,
        message: result.valid ? "API key is valid" : result.error || "Invalid API key"
      });
      onValidationChange(result.valid);
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Failed to validate API key"
      });
      onValidationChange(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyChange = (newValue: string) => {
    onChange(newValue);
    // Reset validation when key changes
    if (validationResult && newValue !== value) {
      setValidationResult(null);
    }
  };

  const handleValidate = () => {
    validateApiKey(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey" className="text-white">
          Anthropic API Key (Optional)
        </Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="sk-ant-..."
            disabled={disabled}
            className="bg-gray-800 border-gray-600 text-white pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleValidate}
                disabled={isValidating || disabled}
                className="p-1 h-8 w-8 text-gray-400 hover:text-white"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              disabled={disabled}
              className="p-1 h-8 w-8 text-gray-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
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
      </div>

      {/* Benefits Card */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">Bring Your Own API Key</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span>Unlimited token usage (no platform limits)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span>Direct billing to your Anthropic account</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span>Encrypted and secure storage</span>
                </div>
              </div>
              {!value && (
                <div className="mt-3 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                  Without your API key, this agent will use Orchestra credits and count toward your plan's token limit.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}