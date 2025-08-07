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

  const starterFeatures = [
    "2,500 Orchestra credits per month",
    "Bring your own API key for unlimited usage",
    "Up to 5 parallel agents", 
    "Basic monitoring",
    "Community resources"
  ];

  const proFeatures = [
    "10,000 Orchestra credits per month",
    "Bring your own API key for unlimited usage",
    "Unlimited parallel agents",
    "Advanced analytics",
    "API access",
    "Custom integrations",
    "Priority support"
  ];

  const enterpriseFeatures = [
    "Unlimited Orchestra credits",
    "Dedicated infrastructure", 
    "SLA guarantees",
    "White-glove onboarding",
    "Custom AI models",
    "24/7 dedicated support"
  ];

  const comparisonFeatures = [
    { name: "Orchestra Credits", starter: "2,500", pro: "10,000", enterprise: "Unlimited" },
    { name: "Bring Your Own API", starter: true, pro: true, enterprise: true },
    { name: "Parallel Agents", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Analytics", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
    { name: "API Access", starter: false, pro: true, enterprise: true },
    { name: "Support", starter: "Community", pro: "Priority", enterprise: "Dedicated" }
  ];

  const handleStartStarter = () => {
    // Redirect to login page for free signup
    window.location.href = "/login";
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement Stripe checkout
      toast({
        title: "Upgrade Coming Soon",
        description: "Stripe integration will be available shortly. Thanks for your interest!",
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
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Performance Level
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From getting started to enterprise scale - parallel execution for every need
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Starter Plan */}
          <Card className="bg-gray-700 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-white text-2xl mb-2">Starter</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$15</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <p className="text-gray-600">
                Perfect for small teams getting started
              </p>
            </CardHeader>

            <CardContent>
              {/* Features List */}
              <div className="space-y-3 mb-8">
                {starterFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Start Starter Button */}
              <Button
                onClick={handleStartStarter}
                className="w-full bg-gray-500 hover:bg-gray-400 text-white border-0 h-12 text-lg font-semibold transition-all duration-200"
              >
                Start Starter Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gray-700 border-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden scale-105">
            {/* Recommended Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0 px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                RECOMMENDED
              </Badge>
            </div>

            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 opacity-20 blur-sm"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-white text-2xl mb-2">Pro</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <p className="text-gray-600">
                For growing businesses that need scale
              </p>
            </CardHeader>

            <CardContent className="relative z-10">
              {/* Features List */}
              <div className="space-y-3 mb-8">
                {proFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0 h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Choose Pro</span>
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

          {/* Enterprise Plan */}
          <Card className="bg-gray-700 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-white text-2xl mb-2">Enterprise</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">Custom</span>
                <span className="text-gray-600 text-lg block">pricing</span>
              </div>
              <p className="text-gray-600">
                For large organizations with custom needs
              </p>
            </CardHeader>

            <CardContent>
              {/* Features List */}
              <div className="space-y-3 mb-8">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Contact Sales Button */}
              <Button
                onClick={() => window.open('mailto:sales@pulsespark.ai', '_blank')}
                variant="outline"
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white border-0 h-12 text-lg font-semibold transition-all duration-200 bg-blue-500/10"
              >
                Contact Sales
              </Button>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  🏢 Custom SLA • Dedicated support • Volume discounts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Detailed Feature Comparison</h3>
          <Card className="bg-gray-700/90 border-gray-600 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-4 text-white font-semibold">Feature</th>
                      <th className="text-center p-4 text-white font-semibold">Free Plan</th>
                      <th className="text-center p-4 text-orange-400 font-semibold">Early Adopter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b border-gray-600/50 hover:bg-gray-600/30 transition-colors">
                        <td className="p-4 text-gray-300 font-medium">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.starter === 'boolean' ? (
                            feature.starter ? (
                              <Check className="w-5 h-5 text-orange-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-300">{feature.starter}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <Check className="w-5 h-5 text-orange-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-orange-300 font-medium">{feature.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? (
                              <Check className="w-5 h-5 text-blue-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-blue-300 font-medium">{feature.enterprise}</span>
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
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <Bot className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">AI-First Platform</h4>
              <p className="text-gray-400 text-sm">
                Built specifically for orchestrating complex AI agent workflows
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-gray-400 text-sm">
                Real-time processing and monitoring for immediate insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <Eye className="w-6 h-6 text-orange-400" />
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
          <Card className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border-orange-500/30 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
                  <Key className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unlimited Power with Your Own API</h3>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Early Adopter members can connect their own Anthropic API key for unlimited usage. 
                Use our 1,000 monthly credits for convenience, or plug in your API key for unlimited power.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-400" />
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
          <Card className="bg-gray-700/90 border-gray-600 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">How does parallel execution work?</h4>
                  <p className="text-gray-300">
                    Orchestra analyzes your workflow dependencies and groups independent agents into execution levels. Agents in the same level run simultaneously, dramatically reducing total execution time.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">What are Orchestra credits?</h4>
                  <p className="text-gray-300">
                    Orchestra credits are units of AI computation that power your agents. Each interaction consumes credits based on input and output length. Pro members get 10,000 credits per month.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">How does "Bring Your Own API" work?</h4>
                  <p className="text-gray-300">
                    Connect your own Anthropic API key during agent creation for unlimited usage. Your API calls are billed directly to your Anthropic account, bypassing Orchestra credit limits entirely.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">How much faster is parallel execution?</h4>
                  <p className="text-gray-300">
                    Workflows with independent agents see 3-10x speed improvements. A 5-agent workflow that takes 2.5 minutes sequentially completes in 30 seconds with parallel execution.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
                  <p className="text-gray-300">
                    Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.
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