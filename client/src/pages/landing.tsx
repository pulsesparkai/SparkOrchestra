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
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from "wouter";
import { LiveDemoPreview } from "@/components/live-demo-preview";
import { MessageSquare } from "lucide-react";
import { ComparisonAnimation } from "@/components/comparison-animation";
import orchestraLogo from '@/assets/logos/orchestralogoO.png';
import mainLogo from '@/assets/logos/Lo (1).png';

// Animated section wrapper component
function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const features = [
    {
      icon: Zap,
      title: "Parallel Agent Execution",
      description: "Run multiple agents simultaneously with intelligent dependency management"
    },
    {
      icon: MessageSquare,
      title: "Inter-Agent Communication",
      description: "Agents share context and collaborate in real-time during execution"
    },
    {
      icon: Workflow,
      title: "Visual Workflow Builder",
      description: "Drag-and-drop interface with execution level visualization"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track time savings and optimization opportunities"
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
      title: "Content Generation",
      description: "Research + Fact-Check + Write simultaneously",
      stats: "3x faster content creation",
      gradient: "from-orange-600/20 to-red-600/20"
    },
    {
      title: "Data Processing",
      description: "Extract from multiple sources in parallel",
      stats: "Process 10k records in 2 minutes",
      gradient: "from-amber-600/20 to-orange-600/20"
    },
    {
      title: "Customer Support",
      description: "Classify + Sentiment + Response generation at once",
      stats: "Sub-second response times",
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
                className="h-12 w-auto"
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
          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-600/10 to-amber-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-600/10 to-orange-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-600/5 to-orange-600/5 rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center"
              >
                <img 
                  src={mainLogo}
                  alt="Orchestra" 
                  className="h-80 w-auto"
                />
              </motion.div>
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight text-center -mt-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.span 
                  className="block text-white text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Run AI Agents Parallel
                </motion.span>
              </motion.h1>
            
              <motion.p 
                className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Orchestra is the only platform that executes multiple AI agents simultaneously. 
                Build workflows that complete in seconds, not minutes. Watch agents collaborate in real-time with full conductor oversight.
              </motion.p>
            
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-10 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-10 py-4 text-lg rounded-lg"
                    >
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
            
            {/* Live Demo Preview */}
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <LiveDemoPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Parallel Performance
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The only platform designed from the ground up for simultaneous AI agent execution
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="bg-gray-700 border-gray-600 hover:border-orange-600/50 transition-all duration-300 hover:shadow-xl group h-full">
                    <CardHeader>
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Infrastructure Section */}
      <AnimatedSection id="infrastructure" className="py-24 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Orchestra's Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Orchestra manages every aspect of AI orchestration—from agent creation to workflow execution and real-time monitoring
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {infrastructureCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Card className="bg-gray-600 border-gray-500 hover:border-orange-600/50 transition-all duration-300 hover:shadow-xl group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <motion.div 
                          className="w-10 h-10 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-5 h-5 text-orange-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-white font-semibold mb-2">{capability.title}</h3>
                          <p className="text-gray-400 text-sm">{capability.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Use Cases Section */}
      <AnimatedSection className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Real-World Performance Gains
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              See how parallel execution transforms workflow performance across industries
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className={`bg-gradient-to-br ${useCase.gradient} border-gray-700 hover:border-orange-600/50 transition-all duration-300 group overflow-hidden relative h-full min-h-[280px]`}>
                  <motion.div 
                    className="absolute inset-0 bg-gray-700/90"
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.85)' }}
                  />
                  <CardContent className="relative z-10 p-6 flex flex-col justify-between h-full">
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <motion.h3 
                        className="text-xl font-bold text-white mb-3"
                        whileHover={{ scale: 1.05 }}
                      >
                        {useCase.title}
                      </motion.h3>
                      <p className="text-gray-300 mb-4 text-sm">{useCase.description}</p>
                      <motion.div 
                        className="text-2xl font-bold text-orange-400 mb-3"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {useCase.stats}
                      </motion.div>
                      <Badge className="bg-orange-600/20 text-orange-300 border-orange-600/30 text-xs">
                        Proven Results
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Sequential vs Parallel Comparison */}
      <AnimatedSection className="py-24 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Sequential vs Parallel: See the Difference
            </h2>
            <p className="text-xl text-gray-400">
              Orchestra's parallel execution delivers 70% faster workflows on average
            </p>
          </motion.div>
          
          <ComparisonAnimation />
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection id="pricing" className="py-24 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Performance Level
            </h2>
            <p className="text-xl text-gray-400">
              From getting started to enterprise scale - we have the right plan for you
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gray-600 border-gray-500 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl mb-2">Free</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <p className="text-gray-400">Try Orchestra risk-free</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">100 Orchestra credits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">2 parallel agents</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Basic workflow monitoring</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">BYOK supported</span>
                    </div>
                  </div>
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gray-500 hover:bg-gray-400 text-white transition-all duration-200">
                        Get Started Free
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gray-600 border-gray-500 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl mb-2">Starter</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">$15</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <p className="text-gray-400">Perfect for small teams</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">2,500 Orchestra credits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Up to 5 parallel agents</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Real-time monitoring</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">BYOK for unlimited usage</span>
                    </div>
                  </div>
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200">
                        Start Starter Plan
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <Card className="bg-gray-600 border-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full">
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      RECOMMENDED
                    </Badge>
                  </motion.div>
                </div>
              
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-amber-600/10"
                  animate={{ 
                    background: [
                      'linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(245, 158, 11, 0.1))',
                      'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.1))'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              
                <CardHeader className="relative z-10 text-center">
                  <CardTitle className="text-white text-2xl mb-2">Pro</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">$49</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <p className="text-gray-400">For growing businesses</p>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">10,000 Orchestra credits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">Unlimited parallel agents</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">Advanced analytics dashboard</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">Custom integrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">BYOK for unlimited usage</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Upgrade Coming Soon",
                        description: "Stripe integration will be available shortly. Thanks for your interest!",
                      });
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white transition-all duration-200"
                  >
                    Choose Pro
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gray-600 border-gray-500 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl mb-2">Enterprise</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">Custom</span>
                    <span className="text-gray-400 text-lg block">pricing</span>
                  </div>
                  <p className="text-gray-400">For large organizations</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300">Unlimited Orchestra credits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300">Dedicated infrastructure</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300">Custom AI models</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300">SLA guarantees</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300">White-glove onboarding</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-200"
                    onClick={() => window.open('mailto:sales@pulsespark.ai', '_blank')}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Call to Action */}
      <AnimatedSection className="py-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10"
          animate={{ 
            background: [
              'linear-gradient(90deg, rgba(234, 88, 12, 0.1), rgba(245, 158, 11, 0.1))',
              'linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.1))'
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Orchestrate Your AI?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join the early adopters building the future of AI automation with Orchestra
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    '0 10px 30px rgba(234, 88, 12, 0.3)',
                    '0 15px 40px rgba(234, 88, 12, 0.4)',
                    '0 10px 30px rgba(234, 88, 12, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Star className="w-6 h-6 mr-2" />
                  Start Building Today
                </Button>
              </motion.div>
            </Link>
            <motion.div 
              className="flex items-center text-sm text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span>Setup takes less than 2 minutes • No credit card required</span>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

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