import type { AgentMessage } from '../../shared/schema';
import { getWebSocketManager } from '../websocket-mock';

export interface MessageSubscription {
  agentId: string;
  callback: (message: AgentMessage) => void;
}

export class MessageBus {
  private messages: Map<string, AgentMessage[]> = new Map();
  private subscriptions: Map<string, MessageSubscription[]> = new Map();
  private wsManager = getWebSocketManager();

  constructor(private workflowId: string) {}

  /**
   * Send a message from one agent to another
   */
  async sendMessage(fromAgent: string, toAgent: string, data: any): Promise<void> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromAgent,
      toAgent,
      data,
      timestamp: new Date(),
      workflowId: this.workflowId
    };

    // Store message
    const agentMessages = this.messages.get(toAgent) || [];
    agentMessages.push(message);
    this.messages.set(toAgent, agentMessages);

    // Notify subscribers
    const subscribers = this.subscriptions.get(toAgent) || [];
    subscribers.forEach(sub => {
      try {
        sub.callback(message);
      } catch (error) {
        console.error(`Error in message subscription callback:`, error);
      }
    });

    // Emit real-time message event
    this.wsManager?.emitLog({
      id: message.id,
      timestamp: message.timestamp,
      agentName: `Agent ${fromAgent}`,
      agentId: fromAgent,
      message: `Sent message to Agent ${toAgent}: ${JSON.stringify(data).substring(0, 100)}...`,
      level: 'info',
      workflowId: this.workflowId
    });

    console.log(`📨 Message sent: ${fromAgent} → ${toAgent}`, data);
  }

  /**
   * Subscribe to messages for an agent
   */
  subscribe(agentId: string, callback: (message: AgentMessage) => void): () => void {
    const subscription: MessageSubscription = { agentId, callback };
    
    const agentSubscriptions = this.subscriptions.get(agentId) || [];
    agentSubscriptions.push(subscription);
    this.subscriptions.set(agentId, agentSubscriptions);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(agentId) || [];
      const index = subs.indexOf(subscription);
      if (index > -1) {
        subs.splice(index, 1);
        this.subscriptions.set(agentId, subs);
      }
    };
  }

  /**
   * Get all messages for an agent
   */
  getMessages(agentId: string): AgentMessage[] {
    return this.messages.get(agentId) || [];
  }

  /**
   * Get latest message for an agent
   */
  getLatestMessage(agentId: string): AgentMessage | null {
    const messages = this.getMessages(agentId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(fromAgent: string, data: any): Promise<void> {
    const message: AgentMessage = {
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromAgent,
      toAgent: 'all',
      data,
      timestamp: new Date(),
      workflowId: this.workflowId
    };

    // Send to all subscribed agents
    for (const [agentId, subscribers] of this.subscriptions.entries()) {
      if (agentId !== fromAgent) {
        const agentMessages = this.messages.get(agentId) || [];
        agentMessages.push(message);
        this.messages.set(agentId, agentMessages);

        subscribers.forEach(sub => {
          try {
            sub.callback(message);
          } catch (error) {
            console.error(`Error in broadcast callback:`, error);
          }
        });
      }
    }

    // Emit broadcast event
    this.wsManager?.emitLog({
      id: message.id,
      timestamp: message.timestamp,
      agentName: `Agent ${fromAgent}`,
      agentId: fromAgent,
      message: `Broadcast to all agents: ${JSON.stringify(data).substring(0, 100)}...`,
      level: 'info',
      workflowId: this.workflowId
    });

    console.log(`📢 Broadcast from ${fromAgent}:`, data);
  }

  /**
   * Clear all messages for workflow cleanup
   */
  clearMessages(): void {
    this.messages.clear();
    this.subscriptions.clear();
  }

  /**
   * Get message statistics
   */
  getMessageStats(): {
    totalMessages: number;
    messagesByAgent: Record<string, number>;
    broadcastCount: number;
  } {
    let totalMessages = 0;
    const messagesByAgent: Record<string, number> = {};
    let broadcastCount = 0;

    for (const [agentId, messages] of this.messages.entries()) {
      messagesByAgent[agentId] = messages.length;
      totalMessages += messages.length;
      broadcastCount += messages.filter(m => m.toAgent === 'all').length;
    }

    return {
      totalMessages,
      messagesByAgent,
      broadcastCount
    };
  }
}

export class AgentCommunicator {
  private messageBus: MessageBus;

  constructor(workflowId: string, private agentId: string) {
    this.messageBus = new MessageBus(workflowId);
  }

  /**
   * Send message to specific agent
   */
  async sendTo(targetAgent: string, data: any): Promise<void> {
    return this.messageBus.sendMessage(this.agentId, targetAgent, data);
  }

  /**
   * Broadcast to all agents
   */
  async broadcast(data: any): Promise<void> {
    return this.messageBus.broadcast(this.agentId, data);
  }

  /**
   * Listen for messages
   */
  onMessage(callback: (message: AgentMessage) => void): () => void {
    return this.messageBus.subscribe(this.agentId, callback);
  }

  /**
   * Get all received messages
   */
  getMessages(): AgentMessage[] {
    return this.messageBus.getMessages(this.agentId);
  }

  /**
   * Get latest message
   */
  getLatestMessage(): AgentMessage | null {
    return this.messageBus.getLatestMessage(this.agentId);
  }
}