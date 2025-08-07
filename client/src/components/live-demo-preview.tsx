import { useState, useEffect } from 'react';
import { Eye, MessageSquare, Zap } from 'lucide-react';

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
  
  // Simulate progress
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
          setConductorStatus('Workflow completed successfully');
        }
        
        return newProgress;
      });
    }, 800);
    
    // Reset demo every 12 seconds
    const resetInterval = setInterval(() => {
      setProgress([0, 0, 0]);
      setMessages([]);
      setIsComplete(false);
      setConductorStatus('Monitoring workflow...');
      setMessageId(0);
    }, 12000);
    
    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, [isComplete]);

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
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [messageId, isComplete]);

  // Update conductor status
  useEffect(() => {
    if (isComplete) return;
    
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
    }, 3000);

    return () => clearInterval(statusInterval);
  }, [isComplete]);

  const agents = ['Research', 'Analysis', 'Writer'];

  return (
    <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 shadow-2xl">
      {/* Conductor Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg p-4 border border-orange-600/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">AI Conductor</h4>
                <p className="text-xs text-orange-300">{conductorStatus}</p>
              </div>
            </div>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${
                    isComplete ? 'bg-green-400' : 'bg-orange-400 animate-pulse'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold mb-2">Live Parallel Execution</h3>
        <div className="text-sm text-orange-400 bg-orange-600/20 px-3 py-1 rounded-full inline-flex items-center">
          <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
          3 agents executing simultaneously
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center mb-3">Level 1 - Simultaneous Execution</div>
      
      {/* Agents Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4 relative">
        {agents.map((name, i) => (
          <div key={i} className="bg-gray-600 border border-orange-600/30 rounded-lg p-3 relative">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <div className={`w-3 h-3 bg-white rounded-full ${
                  progress[i] >= 100 ? '' : 'animate-pulse'
                }`}></div>
              </div>
            </div>
            <div className="text-xs text-white font-medium text-center mb-2">{name} Agent</div>
            <div className="w-full bg-gray-500 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progress[i]}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {progress[i] >= 100 ? 'Complete' : `${Math.round(progress[i])}%`}
            </div>
          </div>
        ))}
        
        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          {/* Left to Center */}
          <line x1="33%" y1="50%" x2="50%" y2="50%" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </line>
          {/* Center to Right */}
          <line x1="50%" y1="50%" x2="67%" y2="50%" stroke="url(#gradient1)" strokeWidth="2" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </line>
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
            <div
              key={msg.id}
              className="text-xs bg-gray-600/50 rounded px-2 py-1 animate-slide-up"
            >
              <span className="text-orange-400">{msg.from}</span>
              <span className="text-gray-400"> → </span>
              <span className="text-amber-400">{msg.to}</span>
              <span className="text-gray-300">: {msg.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance Comparison */}
      <div className="text-center">
        <div className="text-sm">
          <span className="text-gray-400">Sequential: 45s</span>
          <span className="text-orange-400 mx-2">⚡</span>
          <span className="text-orange-400 font-semibold">Parallel: 15s</span>
        </div>
        <div className="text-xs text-green-400 font-medium mt-1">⚡ 3x faster execution</div>
      </div>
    </div>
  );
}