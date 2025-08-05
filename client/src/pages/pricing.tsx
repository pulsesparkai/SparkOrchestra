import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Zap, 
  Bot, 
  Eye, 
  Activity, 
  Key,
  Star,
  ArrowRight,
  Crown,
  X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const freeFeatures = [
    "100 tokens per month",
    "2 agents maximum", 
    "Basic monitoring",
    "Community support"
  ];

  const earlyAdopterFeatures = [
    "1,000 Orchestra credits per month",
    "Bring your own API key for unlimited usage",
    "Unlimited agents",
    "Full conductor orchestration",
    "Real-time monitoring",
    "API access",
    "Priority support"
  ];

  const comparisonFeatures = [
    { name: "Orchestra Credits", free: "100", earlyAdopter: "1,000" },
    { name: "Bring Your Own API", free: false, earlyAdopter: true },
    { name: "Agents", free: "2", earlyAdopter: "Unlimited" },
    { name: "Monitoring", free: "Basic", earlyAdopter: "Real-time" },
    { name: "Conductor", free: false, earlyAdopter: true },
    { name: "API Access", free: false, earlyAdopter: true },
    { name: "Support", free: "Community", earlyAdopter: "Priority" }
  ];

  const handleStartFree = () => {
    // TODO: Redirect to sign up with free plan
    toast({
      title: "Sign Up Coming Soon",
      description: "Free account creation will be available shortly!",
    });
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Redirect to Stripe checkout
      toast({
        title: "Stripe Checkout Coming Soon",
        description: "Payment processing will be available shortly. Thanks for your interest!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-orchestra-brown rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free or upgrade to unlock the full power of Orchestra
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="bg-white border-gray-200 shadow-lg relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-gray-900 text-2xl mb-2">Free Plan</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <p className="text-gray-600">
                Perfect for getting started with AI orchestration
              </p>
            </CardHeader>

            <CardContent>
              {/* Features List */}
              <div className="space-y-3 mb-8">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Start Free Button */}
              <Button
                onClick={handleStartFree}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 border-0 h-12 text-lg font-semibold"
              >
                Start Free
              </Button>
            </CardContent>
          </Card>

          {/* Early Adopter Plan */}
          <Card className="bg-white border-orchestra-brown shadow-lg relative overflow-hidden">
            {/* Recommended Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-orchestra-brown to-orange-600 text-white border-0 px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                RECOMMENDED
              </Badge>
            </div>

            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orchestra-brown via-orange-600 to-orchestra-brown opacity-10 blur-sm"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-gray-900 text-2xl mb-2">Early Adopter</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$15</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <p className="text-gray-600">
                Use our credits or connect your Anthropic API for unlimited power
              </p>
            </CardHeader>

            <CardContent className="relative z-10">
              {/* Features List */}
              <div className="space-y-3 mb-8">
                {earlyAdopterFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orchestra-brown flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orchestra-brown to-orange-600 hover:from-orchestra-brown-hover hover:to-orange-700 text-white border-0 h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Upgrade Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  🔒 Secure payment • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h3>
          <Card className="bg-gray-900/80 border-gray-600 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-white font-semibold">Feature</th>
                      <th className="text-center p-4 text-white font-semibold">Free Plan</th>
                      <th className="text-center p-4 text-purple-400 font-semibold">Early Adopter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="p-4 text-gray-300 font-medium">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-300">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.earlyAdopter === 'boolean' ? (
                            feature.earlyAdopter ? (
                              <Check className="w-5 h-5 text-purple-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-purple-300 font-medium">{feature.earlyAdopter}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Benefits */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-8">Why Choose Orchestra?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">AI-First Platform</h4>
              <p className="text-gray-400 text-sm">
                Built specifically for orchestrating complex AI agent workflows
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-gray-400 text-sm">
                Real-time processing and monitoring for immediate insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Full Visibility</h4>
              <p className="text-gray-400 text-sm">
                Complete transparency into your AI operations and performance
              </p>
            </div>
          </div>
        </div>

        {/* BYOAPI Highlight Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Key className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unlimited Power with Your Own API</h3>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Early Adopter members can connect their own Anthropic API key for unlimited usage. 
                Use our 1,000 monthly credits for convenience, or plug in your API key for unlimited power.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>1,000 Orchestra credits included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-green-400" />
                  <span>+ Unlimited with your API key</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
          <Card className="bg-gray-900/80 border-gray-600 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">What are Orchestra credits?</h4>
                  <p className="text-gray-300">
                    Orchestra credits are units of AI computation that power your agents. Each interaction consumes credits based on input and output length. Early Adopter members get 1,000 credits per month.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">How does "Bring Your Own API" work?</h4>
                  <p className="text-gray-300">
                    Connect your own Anthropic API key during agent creation for unlimited usage. Your API calls are billed directly to your Anthropic account, bypassing Orchestra credit limits entirely.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Can I use both Orchestra credits and my own API key?</h4>
                  <p className="text-gray-300">
                    Absolutely! You can set API keys on specific agents for unlimited usage while using Orchestra credits for others. Perfect for mixing high-volume and occasional-use agents.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
                  <p className="text-gray-300">
                    Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">What happens if I exceed my credit limit?</h4>
                  <p className="text-gray-300">
                    Agents using Orchestra credits will pause until the next billing cycle or until you upgrade. Agents with your own API keys continue running unlimited.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}