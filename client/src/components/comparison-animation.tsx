import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, Bot, Shield, Brain, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ComparisonAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [sequentialStep, setSequentialStep] = useState(0);
  const [parallelProgress, setParallelProgress] = useState([0, 0, 0]);
  const [showError, setShowError] = useState(false);
  const [errorResolved, setErrorResolved] = useState(false);
  useEffect(() => {
    if (!isInView) {
      setSequentialStep(0);
      setParallelProgress([0, 0, 0]);
      setShowError(false);
      setErrorResolved(false);
      return;
    }

    // Sequential animation - slower, one at a time
    const sequentialInterval = setInterval(() => {
      setSequentialStep(prev => {
        if (prev >= 3) {
          // Reset after completion
          setTimeout(() => setSequentialStep(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    // Parallel animation - all agents progress together (much slower)
    const parallelInterval = setInterval(() => {
      setParallelProgress(prev => {
        const newProgress = prev.map((p, i) => {
          // Smaller, more consistent increments for smoother progress
          const baseIncrement = 4.2; // Base increment for ~24 updates to reach 100%
          const variance = Math.random() * 2; // 0 to 2 variance
          const staggerMultiplier = i === 0 ? 1.1 : i === 1 ? 1.0 : 0.9; // Research fastest, Analysis middle, Writer slowest
          const increment = (baseIncrement + variance) * staggerMultiplier;
          return Math.min(p + increment, 100);
        });
        
        // Simulate error detection at 60% on Analysis agent
        if (newProgress[1] >= 60 && !showError && !errorResolved) {
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
            setErrorResolved(true);
          }, 2000);
        }
        
        // Reset when all complete
        if (newProgress.every(p => p >= 100)) {
          setTimeout(() => {
            setParallelProgress([0, 0, 0]);
            setErrorResolved(false);
          }, 3000);
        }
        
        return newProgress;
      });
    }, 1200); // Slower updates for 13-14 second completion time

    return () => {
      clearInterval(sequentialInterval);
      clearInterval(parallelInterval);
    };
  }, [isInView, showError, errorResolved]);

  const competitors = ['Current Tools', 'GitHub Actions', 'Jenkins', 'CircleCI'];

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Traditional Sequential */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -50 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gray-700 border-gray-600 shadow-xl h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              Traditional Sequential
              <Badge variant="secondary" className="bg-gray-600 text-gray-300">Old Way</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {['Research Agent', 'Analysis Agent', 'Writer Agent'].map((agent, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: sequentialStep > i ? 1 : 0.4,
                    scale: sequentialStep === i + 1 ? 1.02 : 1,
                    backgroundColor: sequentialStep === i + 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(75, 85, 99, 1)'
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-600 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      sequentialStep > i ? 'bg-green-500' : 
                      sequentialStep === i + 1 ? 'bg-blue-500' : 
                      'bg-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{agent}</div>
                      <div className="text-xs text-gray-400">Waits for previous agent</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sequentialStep === i + 1 && (
                      <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                    )}
                    {sequentialStep > i && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-300">45 seconds</div>
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

      {/* Orchestra Parallel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : 50 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-gray-700 border-2 border-orange-600 shadow-xl h-full relative overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(45deg, rgba(234, 88, 12, 0.1), rgba(245, 158, 11, 0.1))',
                'linear-gradient(45deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.1))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0"
          />
          
          <CardHeader className="relative z-10 text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              Orchestra Parallel
              <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                70% Faster
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-sm text-orange-400 mb-3">Level 1 - All Execute Together</div>
              <div className="grid grid-cols-3 gap-2">
                {['Research', 'Analysis', 'Writer'].map((agent, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: parallelProgress[i] > 0 && parallelProgress[i] < 10 ? 1.02 : 1,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-3 text-center relative"
                  >
                    <div className="w-8 h-8 bg-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          rotate: parallelProgress[i] > 0 && parallelProgress[i] < 100 ? [0, 360] : 0,
                          scale: parallelProgress[i] >= 100 ? [1, 1.2, 1] : 1
                        }}
                        transition={{ 
                          rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 0.6, ease: "easeOut", repeat: parallelProgress[i] >= 100 ? 3 : 0 }
                        }}
                        className="w-4 h-4 bg-white rounded-full"
                      />
                    </div>
                    <div className="text-xs text-white font-medium mb-1">{agent}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full"
                        animate={{ width: `${parallelProgress[i]}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {parallelProgress[i] >= 100 ? 'Complete' : `${Math.round(parallelProgress[i])}%`}
                    </div>
                    
                    {/* Error indicator */}
                    {showError && i === 1 && (
                      <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                      >
                        <AlertCircle className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    
                    {/* Success indicator */}
                    {parallelProgress[i] >= 100 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Quality Metrics */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: parallelProgress.some(p => p > 20) ? 1 : 0,
                  height: parallelProgress.some(p => p > 20) ? 'auto' : 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-4 grid grid-cols-3 gap-2 text-center overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[0] > 20 ? 1 : 0, 
                    y: parallelProgress[0] > 20 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-green-600/20 border border-green-500/30 rounded p-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <div className="text-xs text-green-400 font-medium">98% Accuracy</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[1] > 40 ? 1 : 0, 
                    y: parallelProgress[1] > 40 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-blue-600/20 border border-blue-500/30 rounded p-2"
                >
                  <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs text-blue-400 font-medium">Cross-Validated</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: parallelProgress[2] > 60 ? 1 : 0, 
                    y: parallelProgress[2] > 60 ? 0 : 10 
                  }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-purple-600/20 border border-purple-500/30 rounded p-2"
                >
                  <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs text-purple-400 font-medium">-73% Hallucinations</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Inter-agent communication */}
            {isInView && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600"
              >
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <Bot className="w-3 h-3 mr-1" />
                  AI Conductor Oversight:
                </div>
                <motion.div
                  key={showError ? 'error' : 'normal'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-xs space-y-1"
                >
                  {showError ? (
                    <div className="text-red-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      "Analysis agent error detected - implementing recovery protocol"
                    </div>
                  ) : errorResolved ? (
                    <div className="text-green-400 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      "Cross-validation complete - accuracy improved by 15%"
                    </div>
                  ) : (
                    <div className="text-blue-400">
                      "Agents collaborating in real-time - validating outputs for accuracy"
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            <div className="text-center">
              <motion.div 
                className="text-3xl font-bold text-orange-400"
                animate={{
                  scale: parallelProgress.every(p => p >= 100) ? [1, 1.05, 1] : 1
                }}
                transition={{ duration: 0.6, ease: "easeOut", repeat: parallelProgress.every(p => p >= 100) ? 2 : 0 }}
              >
                15 seconds
              </motion.div>
              <div className="text-sm text-orange-400 flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 inline mr-1" />
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
                className="text-sm text-green-400 flex items-center justify-center font-medium"
                initial={{ opacity: 0, y: 5 }}
                animate={{ 
                  opacity: parallelProgress.every(p => p >= 100) ? 1 : 0,
                  y: parallelProgress.every(p => p >= 100) ? 0 : 5
                }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                98% accuracy (vs 85% sequential)
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}