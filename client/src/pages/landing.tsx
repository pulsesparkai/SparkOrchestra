import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Clock,
  Database,
  Cloud,
  Cpu,
  Network,
  TrendingUp,
  Globe,
  Mail
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

  const infrastructureCapabilities = [
    {
      icon: Database,
      title: "Secure Data Layer",
      description: "PostgreSQL with Row Level Security ensuring complete data isolation"
    },
    {
      icon: Cloud,
      title: "Serverless Architecture",
      description: "Auto-scaling infrastructure that grows with your AI operations"
    },
    {
      icon: Cpu,
      title: "High-Performance Runtime",
      description: "Optimized execution engine for complex multi-agent workflows"
    },
    {
      icon: Network,
      title: "Real-time Communication",
      description: "WebSocket-powered live updates and agent coordination"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Encrypted API keys, secure authentication, and audit logging"
    },
    {
      icon: Zap,
      title: "Rate Limiting",
      description: "Intelligent resource management with usage tracking and controls"
    }
  ];

  const useCases = [
    {
      title: "Content Generation Pipeline",
      description: "Research → Analysis → Writing → Review",
      stats: "4x faster content creation",
      gradient: "from-orange-600/20 to-red-600/20"
    },
    {
      title: "Data Processing Workflows",
      description: "Extract → Transform → Analyze → Report",
      stats: "90% reduction in manual work",
      gradient: "from-amber-600/20 to-orange-600/20"
    },
    {
      title: "Customer Support Automation",
      description: "Classify → Route → Respond → Escalate",
      stats: "24/7 intelligent responses",
      gradient: "from-yellow-600/20 to-amber-600/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
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
              <a href="#infrastructure" className="text-gray-300 hover:text-white transition-colors">
                Infrastructure
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/30">
                Contact Sales
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Login →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-800">
        {/* Abstract Background Graphics */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-600/10 to-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-600/10 to-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-600/5 to-orange-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              The AI orchestrator
              <span className="block bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                engineered for automation
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              A full-stack platform for creating, managing, and monitoring intelligent AI agent workflows. 
              Build sophisticated automation with real-time conductor oversight and enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-10 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-10 py-4 text-lg rounded-lg"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            </div>
            
            {/* Live Demo Preview */}
            <div className="hidden lg:block">
              <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <h3 className="text-white font-semibold mb-2">Live Workflow Preview</h3>
                  <div className="text-sm text-orange-400 bg-orange-600/20 px-3 py-1 rounded-full inline-block">
                    ⚡ Executing in parallel...
                  </div>
                </div>
                
                {/* Mini Workflow Visualization */}
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 text-center">Level 1 - Simultaneous Execution</div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Research Agent', 'Analysis Agent', 'Writer Agent'].map((name, index) => (
                      <div key={index} className="bg-gray-600 border border-orange-600/30 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-xs text-white font-medium">{name}</div>
                        <div className="w-full bg-gray-500 rounded-full h-1 mt-2">
                          <div 
                            className="bg-orange-400 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${65 + (index * 10)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-400 font-medium">⚡ Time saved: ~30 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful AI Orchestration
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to build, deploy, and monitor sophisticated AI agent workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gray-700 border-gray-600 hover:border-orange-600/50 transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="py-24 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Orchestra's Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Orchestra manages every aspect of AI orchestration—from agent creation to workflow execution and real-time monitoring
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {infrastructureCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index} className="bg-gray-600 border-gray-500 hover:border-orange-600/50 transition-all duration-300 hover:shadow-xl group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">{capability.title}</h3>
                        <p className="text-gray-400 text-sm">{capability.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Use Case
            </h2>
            <p className="text-xl text-gray-400">
              From content generation to data processing, Orchestra handles complex AI workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className={`bg-gradient-to-br ${useCase.gradient} border-gray-700 hover:border-orange-600/50 transition-all duration-300 group overflow-hidden relative`}>
                <div className="absolute inset-0 bg-gray-700/90"></div>
                <CardContent className="relative z-10 p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                    <p className="text-gray-300 mb-6">{useCase.description}</p>
                    <div className="text-3xl font-bold text-orange-400 mb-2">{useCase.stats}</div>
                    <Badge className="bg-orange-600/20 text-orange-300 border-orange-600/30">
                      Proven Results
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free or unlock unlimited power with Early Adopter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-gray-600 border-gray-500 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl mb-2">Free Plan</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
                <p className="text-gray-400">Perfect for getting started</p>
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
                  <Button className="w-full bg-gray-500 hover:bg-gray-400 text-white transition-all duration-200">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Early Adopter Plan */}
            <Card className="bg-gray-600 border-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  RECOMMENDED
                </Badge>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-amber-600/10"></div>
              
              <CardHeader className="relative z-10 text-center">
                <CardTitle className="text-white text-2xl mb-2">Early Adopter</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$15</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
                <p className="text-gray-400">Unlimited power with your API</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">1,000 Orchestra credits per month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Bring your own API key for unlimited usage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Unlimited agents</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Full conductor orchestration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Real-time monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Priority support</span>
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Orchestrate Your AI?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the early adopters building the future of AI automation with Orchestra
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-pulse"
              >
                <Star className="w-6 h-6 mr-2" />
                Start Building Today
              </Button>
            </Link>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>Setup takes less than 2 minutes • No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={orchestraLogo}
                  alt="Orchestra" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The ultimate platform for AI agent orchestration and workflow automation.
              </p>
              <div className="text-gray-500 text-xs">
                © 2025 PulseSpark.ai. All rights reserved.
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-orange-400 transition-colors">Features</a>
                <a href="#pricing" className="block text-gray-400 hover:text-orange-400 transition-colors">Pricing</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">API Reference</a>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-white font-semibold mb-4">Solutions</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Content Generation</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Data Processing</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Customer Support</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Enterprise</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">About</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Careers</a>
                <a href="#" className="block text-gray-400 hover:text-orange-400 transition-colors">Contact</a>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-2">Stay Updated</h4>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter email" 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-sm focus:border-orange-600"
                  />
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}