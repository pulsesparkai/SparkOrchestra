import { Badge } from "@/components/ui/badge";
import { Key, Zap } from "lucide-react";

interface ApiKeyIndicatorProps {
  hasApiKey: boolean;
  className?: string;
}

export function ApiKeyIndicator({ hasApiKey, className = "" }: ApiKeyIndicatorProps) {
  return (
    <Badge 
      variant={hasApiKey ? "default" : "secondary"} 
      className={`${className} ${
        hasApiKey 
          ? "bg-green-600/20 text-green-300 border-green-600/30" 
          : "bg-purple-600/20 text-purple-300 border-purple-600/30"
      }`}
    >
      {hasApiKey ? (
        <>
          <Key className="w-3 h-3 mr-1" />
          Using your key
        </>
      ) : (
        <>
          <Zap className="w-3 h-3 mr-1" />
          Orchestra credits
        </>
      )}
    </Badge>
  );
}