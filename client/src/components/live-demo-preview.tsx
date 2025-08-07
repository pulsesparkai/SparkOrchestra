import { useState, useEffect } from 'react';
import { Eye, MessageSquare, Zap, Bot, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  from: string;
  to: string;
  text: string;
}

export function LiveDemoPreview() {
  const [progress, setProgress] = useState([0, 0, 0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conductorStatus, setConductorStatus] = useState('Monitoring workflow...');
  const [messageId, setMessageId] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Simulate progress - slower and more realistic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev.map((p, i) => {
          // Simulate different completion rates
          const increment = Math.random() * 8 + 4; // Slower: 4-12 instead of 5-20
          return Math.min(p + increment, 100);
        });
        
        // Check if all agents are complete
        if (newProgress.every(p => p >= 100) && !isComplete) {
          setIsComplete(true);
          setConductorStatus('✅ Workflow completed successfully');
        }
        
        return newProgress;
      });
    }, 800); // Slower: 800ms instead of 500ms
    
    // Reset demo every 15 seconds (longer cycle)
    const resetInterval = setInterval(() => {
      setProgress([0, 0, 0]);
      setMessages([]);
      setIsComplete(false);
      setHasError(false);
      setConductorStatus('Monitoring workflow...');
      setMessageId(0);
    }, 15000);
    
    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, [isComplete]);

  // Error detection simulation
  useEffect(() => {
    // Simulate error detection at 70% progress on Analysis agent
    if (progress[1] > 70 && !hasError && !isComplete) {
      setHasError(true);
      setConductorStatus('⚠️ Error detected in Analysis agent - Auto-correcting...');
      
      setTimeout(() => {
        setHasError(false);
        setConductorStatus('✅ Error resolved - All agents synchronized');
      }, 3000);
    }
  }, [progress, hasError, isComplete]);

  // Simulate inter-agent messages
  useEffect(() => {
    if (isComplete) return;
    
    const messageInterval = setInterval(() => {
      const messageTemplates = [
        { from: 'Research', to: 'Analysis', text: 'Data collected: 1,247 sources' },
        { from: 'Analysis', to: 'Writer', text: 'Key insights identified' },
        { from: 'Writer', to: 'Research', text: 'Need more context on topic X' },
        { from: 'Research', to: 'Writer', text: 'Additional data sent' },
        { from: 'Analysis', to: 'Research', text: 'Validating statistical model' },
        { from: 'Writer', to: 'Analysis', text: 'Content structure ready' },
      ];
      
      const newMessage = {
        id: messageId,
        ...messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
      };
      
      setMessages(prev => [...prev.slice(-2), newMessage]);
      setMessageId(prev => prev + 1);
    }, 2500); // Slower messaging

    return () => clearInterval(messageInterval);
  }, [messageId, isComplete]);

  // Update conductor status
  useEffect(() => {
    if (isComplete || hasError) return;
    
    const statusInterval = setInterval(() => {
      const statuses = [
        'Monitoring workflow execution...',
        'Optimizing agent performance',
        'Balancing workload distribution',
        'Ensuring quality standards',
        'Validating agent outputs',
        'Coordinating data handoffs'
      ];
      setConductorStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 3500); // Slower status updates

    return () => clearInterval(statusInterval);
  }, [isComplete, hasError]);

  const agents = ['Research', 'Analysis', 'Writer'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 shadow-2xl"
    >
      {/* Conductor Section */}
      <motion.div 
        className="mb-6"
        animate={{ 
          borderColor: hasError ? 'rgba(239, 68, 68, 0.5)' : isComplete ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 88, 12, 0.3)'
        }}
      >
        <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg p-4 border border-orange-600/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center"
                animate={{ 
                  boxShadow: hasError ? '0 0 20px rgba(239, 68, 68, 0.5)' : isComplete ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(234, 88, 12, 0.3)'
                }}
              >
                <Eye className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h4 className="text-white font-semibold">AI Conductor</h4>
                <motion.p 
                  key={conductorStatus}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs ${
                    hasError ? 'text-red-300' : isComplete ? 'text-green-300' : 'text-orange-300'
                  }`}
                >
                  {conductorStatus}
                </motion.p>
              </div>
            </div>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${
                    hasError ? 'bg-red-400' : isComplete ? 'bg-green-400' : 'bg-orange-400'
                  }`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.3 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold mb-2">Live Parallel Execution</h3>
        <motion.div 
          className="text-sm text-orange-400 bg-orange-600/20 px-3 py-1 rounded-full inline-flex items-center"
          animate={{ 
            backgroundColor: isComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 88, 12, 0.2)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-4 h-4 mr-2" />
          </motion.div>
          {isComplete ? 'Execution completed' : '3 agents executing simultaneously'}
        </motion.div>
      </div>

      <div className="text-xs text-gray-400 text-center mb-3">Level 1 - Simultaneous Execution</div>
      
      {/* Agents Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4 relative">
        {agents.map((name, i) => (
          <motion.div 
            key={i} 
            className="bg-gray-600 border border-orange-600/30 rounded-lg p-3 relative"
            animate={{
              borderColor: hasError && i === 1 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 88, 12, 0.3)',
              backgroundColor: hasError && i === 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(75, 85, 99, 1)'
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <motion.div 
                className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center"
                animate={{
                  backgroundColor: hasError && i === 1 ? 'rgb(239, 68, 68)' : 'rgb(234, 88, 12)'
                }}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ 
                    scale: progress[i] >= 100 ? [1, 1.2, 1] : [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: progress[i] >= 100 ? 0.5 : 1, 
                    repeat: progress[i] >= 100 ? 3 : Infinity 
                  }}
                />
              </motion.div>
            </div>
            <div className="text-xs text-white font-medium text-center mb-2">{name} Agent</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full"
                animate={{ width: `${progress[i]}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {progress[i] >= 100 ? 'Complete' : `${Math.round(progress[i])}%`}
            </div>
            
            {/* Error indicator */}
            {hasError && i === 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
              >
                <AlertCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
        
        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          {/* Left to Center */}
          <motion.line 
            x1="33%" y1="50%" x2="50%" y2="50%" 
            stroke="url(#gradient1)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Center to Right */}
          <motion.line 
            x1="50%" y1="50%" x2="67%" y2="50%" 
            stroke="url(#gradient1)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Inter-Agent Messages */}
      <div className="mb-4 h-16 overflow-hidden">
        <div className="text-xs text-gray-400 mb-2 flex items-center">
          <MessageSquare className="w-3 h-3 mr-1" />
          Inter-Agent Communication
        </div>
        <div className="space-y-1">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-xs bg-gray-600/50 rounded px-2 py-1"
            >
              <span className="text-orange-400">{msg.from}</span>
              <span className="text-gray-400"> → </span>
              <span className="text-amber-400">{msg.to}</span>
              <span className="text-gray-300">: {msg.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Performance Comparison */}
      <motion.div 
        className="text-center"
        animate={{
          scale: isComplete ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-sm">
          <span className="text-gray-400">Sequential: 45s</span>
          <motion.span 
            className="text-orange-400 mx-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.span>
          <span className="text-orange-400 font-semibold">Parallel: 15s</span>
        </div>
        <motion.div 
          className="text-xs text-green-400 font-medium mt-1"
          animate={{ 
            color: isComplete ? '#22c55e' : '#10b981'
          }}
        >
          ⚡ 3x faster execution
        </motion.div>
      </motion.div>
    </div>
  );
}