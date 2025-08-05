import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Workflow, 
  Eye, 
  Activity, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Crown,
  Users,
  BarChart3,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import orchestraLogo from '@assets/Lo_1754349496969.png';

export default function Landing() {
  const features = [
    {
      icon: Bot,
      title: "AI Agent Management",
      description: "Create and configure intelligent AI agents with different roles and capabilities"
    },
    {
      icon: Workflow,
      title: "Workflow Designer", 
      description: "Visual workflow builder with drag-and-drop orchestration of your AI agents"
    },
    {
      icon: Eye,
      title: "Real-time Monitoring",
      description: "Monitor agent performance and workflow execution with live updates"
    },
    {
      icon: Activity,
      title: "Conductor Dashboard",
      description: "AI oversight with intervention controls and comprehensive activity logging"
    }
  ];

  const pricingFeatures = [
    "1,000 Orchestra credits per month",
    "Bring your own API key for unlimited usage",
    "Unlimited agents",
    "Full conductor orchestration", 
    "Real-time monitoring",
    "API access",
    "Priority support"
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={orchestraLogo}
                alt="Orchestra by PulseSpark.ai" 
                className="h-10 w-auto"
              />
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Orchestra
              <span className="block text-3xl md:text-4xl text-purple-400 mt-2">
                by PulseSpark.ai
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              The ultimate platform for orchestrating AI agents. Create, manage, and monitor 
              intelligent workflows with real-time conductor oversight.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 text-lg"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful AI Orchestration
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build, deploy, and monitor sophisticated AI agent workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Start free or unlock unlimited power with Early Adopter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl mb-2">Free Plan</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
                <p className="text-gray-300">Perfect for getting started</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">100 tokens per month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">2 agents maximum</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Basic monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Community support</span>
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Early Adopter Plan */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  RECOMMENDED
                </Badge>
              </div>
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl mb-2">Early Adopter</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$15</span>
                  <span className="text-gray-300 text-lg">/month</span>
                </div>
                <p className="text-gray-300">Unlimited power with your API</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  {pricingFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Orchestra?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built specifically for orchestrating complex AI agent workflows with enterprise-grade reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-300">
                Row-level security, encrypted API keys, and secure authentication with Supabase
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-300">
                Monitor token usage, workflow performance, and agent activity in real-time
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-gray-300">
                Share workflows, collaborate on agent development, and scale your AI operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Orchestrate Your AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the early adopters building the future of AI automation
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Star className="w-5 h-5 mr-2" />
                Start Building Today
              </Button>
            </Link>
            <div className="text-sm text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Setup takes less than 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={orchestraLogo}
                alt="Orchestra" 
                className="h-8 w-auto"
              />
              <span className="text-gray-400 text-sm">
                © 2025 PulseSpark.ai. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}