import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, Bot } from 'lucide-react';
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

    // Parallel animation - all agents progress together
    const parallelInterval = setInterval(() => {
      setParallelProgress(prev => {
        const newProgress = prev.map(p => Math.min(p + Math.random() * 12 + 8, 100));
        
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
    }, 600);

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
            </div>

            {/* Competitor logos */}
            <div className="pt-4 border-t border-gray-600">
              <div className="text-xs text-gray-400 mb-2">Used by:</div>
              <div className="flex flex-wrap gap-2">
                {competitors.map((comp, i) => (
                  <div key={i} className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                    {comp}
                  </div>
                ))}
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
                      scale: parallelProgress[i] > 0 ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.5, repeat: parallelProgress[i] < 100 ? Infinity : 0 }}
                    className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-3 text-center relative"
                  >
                    <div className="w-8 h-8 bg-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          rotate: parallelProgress[i] > 0 && parallelProgress[i] < 100 ? 360 : 0 
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 bg-white rounded-full"
                      />
                    </div>
                    <div className="text-xs text-white font-medium mb-1">{agent}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full"
                        animate={{ width: `${parallelProgress[i]}%` }}
                        transition={{ duration: 0.3 }}
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
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Inter-agent communication */}
            {isInView && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 1, duration: 0.5 }}
                className="bg-gray-600/50 rounded-lg p-3 mb-4"
              >
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <Bot className="w-3 h-3 mr-1" />
                  AI Conductor Oversight:
                </div>
                <motion.div
                  key={showError ? 'error' : 'normal'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
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
                      "Error resolved - all agents synchronized and continuing"
                    </div>
                  ) : (
                    <div className="text-blue-400">
                      "All agents executing optimally - monitoring performance metrics"
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">15 seconds</div>
              <div className="text-sm text-green-400 font-medium">
                <Zap className="w-4 h-4 inline mr-1" />
                30 seconds saved (3x faster)
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}