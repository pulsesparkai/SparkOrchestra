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
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const features = [
    {
      icon: <Bot className="w-5 h-5" />,
      title: "Unlimited Agents",
      description: "Create and deploy as many AI agents as you need"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Conductor Orchestration", 
      description: "Advanced AI workflow management and monitoring"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "1,000 Tokens/Month",
      description: "Generous token allowance for your AI operations"
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Real-time Monitoring",
      description: "Live dashboard with activity logs and metrics"
    },
    {
      icon: <Key className="w-5 h-5" />,
      title: "API Access",
      description: "Full programmatic access to Orchestra platform"
    }
  ];

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    try {
      // This would typically redirect to Stripe checkout
      // For now, we'll show a toast message
      toast({
        title: "Checkout Coming Soon",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started with Orchestra's powerful AI agent orchestration platform
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-sm max-w-lg w-full relative overflow-hidden">
            {/* Limited Time Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                Limited Time Offer
              </Badge>
            </div>

            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-20 blur-sm"></div>
            
            <CardHeader className="text-center pb-8 relative z-10">
              <CardTitle className="text-white text-2xl mb-2">Early Adopter Plan</CardTitle>
              <div className="mb-4">
                <span className="text-5xl font-bold text-white">$15</span>
                <span className="text-gray-400 text-lg">/month</span>
              </div>
              <p className="text-gray-300">
                Everything you need to orchestrate powerful AI workflows
              </p>
            </CardHeader>

            <CardContent className="relative z-10">
              {/* Features List */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mt-0.5">
                      <div className="text-purple-400">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>

              {/* Get Started Button */}
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 mb-2">
                  🔒 Secure payment powered by Stripe
                </p>
                <p className="text-xs text-gray-500">
                  Cancel anytime • No setup fees • 30-day money-back guarantee
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 text-center">
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

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">What happens when I exceed 1,000 tokens?</h4>
                <p className="text-gray-400 text-sm">
                  You'll receive a notification when approaching your limit. Additional tokens can be purchased at competitive rates.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">Can I upgrade or downgrade my plan?</h4>
                <p className="text-gray-400 text-sm">
                  Yes, you can change your plan at any time. Changes take effect at the next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">Is there a free trial available?</h4>
                <p className="text-gray-400 text-sm">
                  As an early adopter, you get a 30-day money-back guarantee to try Orchestra risk-free.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}