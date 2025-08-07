import { useState, useEffect } from 'react';
import { MessageSquare, Zap } from 'lucide-react';

export function LiveDemoPreview() {
  const [progress, setProgress] = useState([0, 0, 0]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev.map((p, i) => {
          // Simulate different completion rates
          const increment = Math.random() * 15 + 5;
          return Math.min(p + increment, 100);
        });
        
        // Check if all agents are complete
        if (newProgress.every(p => p >= 100) && !isComplete) {
          setIsComplete(true);
          setMessages(['Research complete', 'Analysis ready', 'Content generated']);
        }
        
        return newProgress;
      });
    }, 800);
    
    // Reset demo every 10 seconds
    const resetInterval = setInterval(() => {
      setProgress([0, 0, 0]);
      setMessages([]);
      setIsComplete(false);
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, [isComplete]);

  return (
    <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold mb-2">Live Parallel Execution</h3>
        <div className="text-sm text-orange-400 bg-orange-600/20 px-3 py-1 rounded-full inline-flex items-center">
          <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
          3 agents executing simultaneously
        </div>
      </div>
      
      {/* Agent Execution Grid */}
      <div className="space-y-4 mb-4">
        <div className="text-xs text-gray-400 text-center">Level 1 - Simultaneous Execution</div>
        <div className="grid grid-cols-3 gap-3">
          {['Research Agent', 'Analysis Agent', 'Writer Agent'].map((name, i) => (
            <div key={i} className="bg-gray-600 border border-orange-600/30 rounded-lg p-3 text-center">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-white font-medium mb-2">{name}</div>
              <div className="w-full bg-gray-500 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${progress[i]}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {progress[i] >= 100 ? 'Complete' : `${Math.round(progress[i])}%`}
              </div>
            </div>
          ))}
        </div>
        
        {/* Inter-agent Communication */}
        {messages.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-orange-600/20">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-300 font-medium">Inter-Agent Messages</span>
            </div>
            <div className="space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className="text-xs text-gray-300 opacity-80">
                  • {msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Performance Comparison */}
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">Performance Comparison</div>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="text-gray-400">Sequential: 45s</span>
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-semibold">Parallel: 15s</span>
        </div>
        <div className="text-xs text-green-400 font-medium mt-1">
          ⚡ 3x faster execution
        </div>
      </div>
    </div>
  );
}