import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, Bot, Shield, Brain, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Error Boundary Component
 * Catches JavaScript errors in the ComparisonAnimation component tree
 * Prevents entire page crashes and provides fallback UI
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details for debugging
    console.error('ComparisonAnimation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise default error message
      return this.props.fallback || (
        <Card className="bg-gray-700 border-gray-600 shadow-xl">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Animation Error</h3>
            <p className="text-gray-400 text-sm">
              Unable to load comparison animation. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Main ComparisonAnimation Component
 * Shows side-by-side comparison of sequential vs parallel AI agent execution
 * Features: Real-time progress simulation, error detection, performance metrics
 */
function ComparisonAnimationContent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  // State for sequential execution simulation
  const [sequentialStep, setSequentialStep] = useState<number>(0);
  
  // State for parallel execution simulation (progress for 3 agents)
  const [parallelProgress, setParallelProgress] = useState<number[]>([0, 0, 0]);
  
  // State for error simulation and resolution
  const [showError, setShowError] = useState<boolean>(false);
  const [errorResolved, setErrorResolved] = useState<boolean>(false);

  /**
   * Performance Optimization: Pre-calculate random values
   * Avoids calling Math.random() on every interval tick for better performance
   */
  const [randomMultipliers] = useState<number[]>(() => [
    Math.random() * 2, // Agent 0 variance multiplier
    Math.random() * 2, // Agent 1 variance multiplier
    Math.random() * 2  // Agent 2 variance multiplier
  ]);

  /**
   * Main animation effect
   * Handles both sequential and parallel execution simulations
   * Only runs when component is in view for performance
   */
  useEffect(() => {
    // Reset all states when component goes out of view
    if (!isInView) {
      setSequentialStep(0);
      setParallelProgress([0, 0, 0]);
      setShowError(false);
      setErrorResolved(false);
      return;
    }

    /**
     * Sequential Animation: Agents execute one after another
     * Each step represents one agent completing before the next starts
     */
    const sequentialInterval = setInterval(() => {
      setSequentialStep(prev => {
        if (prev >= 3) {
          // Reset after all agents complete
          setTimeout(() => setSequentialStep(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 2500); // 2.5 seconds per agent

    /**
     * Parallel Animation: All agents execute simultaneously
     * Uses pre-calculated random values for consistent performance
     */
    const parallelInterval = setInterval(() => {
      setParallelProgress(prev => {
        const newProgress = prev.map((currentProgress, agentIndex) => {
          // Use pre-calculated random values instead of Math.random() for performance
          const baseIncrement = 4.2;
          const variance = randomMultipliers[agentIndex]; // Pre-calculated value
          const staggerMultiplier = agentIndex === 0 ? 1.1 : agentIndex === 1 ? 1.0 : 0.9;
          const increment = (baseIncrement + variance) * staggerMultiplier;
          return Math.min(currentProgress + increment, 100);
        });
        
        /**
         * Error Simulation: Trigger error at 60% progress on Analysis agent (index 1)
         * Simulates real-world error detection and auto-recovery
         */
        if (newProgress[1] >= 60 && !showError && !errorResolved) {
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
            setErrorResolved(true);
          }, 2000);
        }
        
        /**
         * Reset Animation: When all agents complete, reset after 3 seconds
         */
        if (newProgress.every(progress => progress >= 100)) {
          setTimeout(() => {
            setParallelProgress([0, 0, 0]);
            setErrorResolved(false);
          }, 3000);
        }
        
        return newProgress;
      });
    }, 1200); // Update every 1.2 seconds

    /**
     * Cleanup Function: Clear intervals on component unmount or view change
     * Prevents memory leaks and ensures proper cleanup
     */
    return () => {
      clearInterval(sequentialInterval);
      clearInterval(parallelInterval);
    };
  }, [isInView, randomMultipliers]); // Only depend on isInView and pre-calculated values

  // Agent names for consistent labeling
  const agentNames: string[] = ['Research', 'Analysis', 'Writer'];

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
      {/* Traditional Sequential Execution Card */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -50 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gray-700 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              Traditional Sequential
              <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                Old Way
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6">
            {/* Sequential Agent Steps */}
            <div className="space-y-4 mb-6 flex-grow">
              {agentNames.map((agentName, index) => (
                <motion.div
                  key={index}
                  animate={{
                    opacity: sequentialStep > index ? 1 : 0.4,
                    scale: sequentialStep === index + 1 ? 1.02 : 1,
                    backgroundColor: sequentialStep === index + 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(75, 85, 99, 1)'
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-600 border border-gray-500 rounded-lg p-3 sm:p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      sequentialStep > index ? 'bg-green-500' : 
                      sequentialStep === index + 1 ? 'bg-blue-500' : 
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base">{agentName} Agent</div>
                      <div className="text-xs text-gray-400">Waits for previous agent</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sequentialStep === index + 1 && (
                      <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                    )}
                    {sequentialStep > index && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sequential Performance Metrics */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-300">45 seconds</div>
              <div className="text-sm text-gray-400">Total execution time</div>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div>• No cross-validation</div>
                <div>• Higher error rates</div>
                <div>• Potential hallucinations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orchestra Parallel Execution Card */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : 50 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-gray-700 border-2 border-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full flex flex-col">
          {/* Animated gradient background for visual appeal */}
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
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Orchestra Parallel
              <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white animate-pulse text-xs">
                70% Faster
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6">
            {/* Parallel Agent Execution */}
            <div className="text-center mb-4 flex-grow">
              <div className="text-xs sm:text-sm text-orange-400 mb-3">Level 1 - All Execute Together</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {agentNames.map((agentName, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: parallelProgress[index] > 0 && parallelProgress[index] < 10 ? 1.02 : 1,
                      borderColor: showError && index === 1 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 88, 12, 0.5)',
                      backgroundColor: showError && index === 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 88, 12, 0.1)'
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-2 sm:p-3 text-center relative"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          rotate: parallelProgress[index] > 0 && parallelProgress[index] < 100 ? [0, 360] : 0,
                          scale: parallelProgress[index] >= 100 ? [1, 1.2, 1] : 1
                        }}
                        transition={{ 
                          rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 0.6, ease: "easeOut", repeat: parallelProgress[index] >= 100 ? 3 : 0 }
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium mb-1">{agentName}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1 sm:h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-orange-400 to-amber-400 h-1 sm:h-1.5 rounded-full"
                        animate={{ width: `${parallelProgress[index]}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {parallelProgress[index] >= 100 ? 'Complete' : `${Math.round(parallelProgress[index])}%`}
                    </div>
                    
                    {/* Error indicator for Analysis agent */}
                    {showError && index === 1 && (
                      <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                      >
                        <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </motion.div>
                    )}
                    
                    {/* Success indicator when agent completes */}
                    {parallelProgress[index] >= 100 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Quality Metrics - Show as agents progress */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: parallelProgress.some(p => p > 20) ? 1 : 0,
                  height: parallelProgress.some(p => p > 20) ? 'auto' : 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[0] > 20 ? 1 : 0, 
                    y: parallelProgress[0] > 20 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-green-600/20 border border-green-500/30 rounded p-1.5 sm:p-2"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mb-1" />
                  <div className="text-xs text-green-400 font-medium">98% Accuracy</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[1] > 40 ? 1 : 0, 
                    y: parallelProgress[1] > 40 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-blue-600/20 border border-blue-500/30 rounded p-1.5 sm:p-2"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs text-blue-400 font-medium">Cross-Validated</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[2] > 60 ? 1 : 0, 
                    y: parallelProgress[2] > 60 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-purple-600/20 border border-purple-500/30 rounded p-1.5 sm:p-2"
                >
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs text-purple-400 font-medium">-73% Hallucinations</div>
                </motion.div>
              </motion.div>
            </div>

            {/* AI Conductor Oversight Messages */}
            {isInView && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mb-4 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-600"
              >
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <Bot className="w-3 h-3 mr-1 flex-shrink-0" />
                  AI Conductor Oversight:
                </div>
                <motion.div
                  key={`${showError}-${errorResolved}`} // Re-render when error state changes
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-xs space-y-1"
                >
                  {showError ? (
                    <div className="text-red-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">"Analysis agent error detected - implementing recovery protocol"</span>
                      <span className="sm:hidden">"Error detected - auto-correcting"</span>
                    </div>
                  ) : errorResolved ? (
                    <div className="text-green-400 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">"Cross-validation complete - accuracy improved by 15%"</span>
                      <span className="sm:hidden">"Validation complete - accuracy improved"</span>
                    </div>
                  ) : (
                    <div className="text-blue-400">
                      <span className="hidden sm:inline">"Agents collaborating in real-time - validating outputs for accuracy"</span>
                      <span className="sm:hidden">"Agents collaborating in real-time"</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Parallel Performance Metrics */}
            <div className="text-center">
              <motion.div 
                className="text-2xl sm:text-3xl font-bold text-orange-400"
                animate={{
                  scale: parallelProgress.every(p => p >= 100) ? [1, 1.05, 1] : 1
                }}
                transition={{ duration: 0.6, ease: "easeOut", repeat: parallelProgress.every(p => p >= 100) ? 2 : 0 }}
              >
                15 seconds
              </motion.div>
              <div className="text-sm text-orange-400 flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 inline mr-1 flex-shrink-0" />
                <motion.span
                  animate={{
                    opacity: parallelProgress.every(p => p >= 100) ? [1, 0.8, 1] : 1
                  }}
                  transition={{ duration: 1.2, repeat: parallelProgress.every(p => p >= 100) ? 2 : 0, ease: "easeInOut" }}
                >
                  30 seconds saved (3x faster)
                </motion.span>
              </div>
              <motion.div 
                className="text-xs sm:text-sm text-green-400 flex items-center justify-center font-medium"
                initial={{ opacity: 0, y: 5 }}
                animate={{ 
                  opacity: parallelProgress.every(p => p >= 100) ? 1 : 0,
                  y: parallelProgress.every(p => p >= 100) ? 0 : 5
                }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <TrendingUp className="w-4 h-4 inline mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">98% accuracy (vs 85% sequential)</span>
                <span className="sm:hidden">98% accuracy</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Main exported component with error boundary wrapper
 * Provides safe rendering with fallback UI in case of errors
 */
export function ComparisonAnimation() {
  return (
    <ErrorBoundary>
      <ComparisonAnimationContent />
    </ErrorBoundary>
  );
}

/**
 * Test Component for Development/Testing
 * Uncomment and use this to test the component in isolation
 */
/*
export function ComparisonAnimationTest() {
  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          ComparisonAnimation Test
        </h1>
        <ComparisonAnimation />
      </div>
    </div>
  );
}
*/