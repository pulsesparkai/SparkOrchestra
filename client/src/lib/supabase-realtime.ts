import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface WorkflowProgressEvent {
  workflowId: string;
  agentId: string;
  status: "idle" | "running" | "complete" | "error";
  progress: number;
  message?: string;
}

export interface LogEvent {
  id: string;
  timestamp: Date;
  agentName: string;
  agentId: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
  workflowId?: string;
}

export interface ConductorEvent {
  type: "pause" | "resume" | "retry" | "intervention";
  workflowId?: string;
  agentId?: string;
  message: string;
  timestamp: Date;
}

export interface TokenUsageEvent {
  agentId: string;
  tokensUsed: number;
  totalTokens: number;
  timestamp: Date;
}

class SupabaseRealtimeClient {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;
  private mainChannel: RealtimeChannel | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      // Create main channel for general events
      this.mainChannel = supabase
        .channel('orchestra-main')
        .on('presence', { event: 'sync' }, () => {
          console.log('Connected to Supabase Realtime');
          this.isConnected = true;
          resolve();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            resolve();
          }
        });
    });
  }

  disconnect() {
    // Unsubscribe from all channels
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    
    if (this.mainChannel) {
      supabase.removeChannel(this.mainChannel);
    }
    
    this.channels.clear();
    this.isConnected = false;
  }

  // Workflow subscriptions
  subscribeToWorkflow(workflowId: string) {
    if (!this.isConnected) return;

    const channel = supabase
      .channel(`workflow-${workflowId}`)
      .subscribe();
    
    this.channels.set(`workflow-${workflowId}`, channel);
  }

  unsubscribeFromWorkflow(workflowId: string) {
    const channel = this.channels.get(`workflow-${workflowId}`);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(`workflow-${workflowId}`);
    }
  }

  // Conductor dashboard subscription
  subscribeToConductor() {
    if (!this.isConnected) return;

    const channel = supabase
      .channel('conductor-dashboard')
      .subscribe();
    
    this.channels.set('conductor-dashboard', channel);
  }

  // Event listeners
  onWorkflowProgress(callback: (event: WorkflowProgressEvent) => void) {
    if (!this.mainChannel) return;

    this.mainChannel.on(
      'broadcast',
      { event: 'workflow-progress' },
      (payload) => {
        callback(payload.payload as WorkflowProgressEvent);
      }
    );
  }

  onNewLog(callback: (event: LogEvent) => void) {
    if (!this.mainChannel) return;

    this.mainChannel.on(
      'broadcast',
      { event: 'new-log' },
      (payload) => {
        const event = payload.payload as LogEvent;
        // Convert timestamp string to Date object
        event.timestamp = new Date(event.timestamp);
        callback(event);
      }
    );
  }

  onWorkflowLog(callback: (event: LogEvent) => void) {
    // Listen on workflow-specific channels
    this.channels.forEach((channel, key) => {
      if (key.startsWith('workflow-')) {
        channel.on(
          'broadcast',
          { event: 'workflow-log' },
          (payload) => {
            const event = payload.payload as LogEvent;
            event.timestamp = new Date(event.timestamp);
            callback(event);
          }
        );
      }
    });
  }

  onConductorEvent(callback: (event: ConductorEvent) => void) {
    const channel = this.channels.get('conductor-dashboard');
    if (!channel) return;

    channel.on(
      'broadcast',
      { event: 'conductor-event' },
      (payload) => {
        const event = payload.payload as ConductorEvent;
        event.timestamp = new Date(event.timestamp);
        callback(event);
      }
    );
  }

  onTokenUsage(callback: (event: TokenUsageEvent) => void) {
    if (!this.mainChannel) return;

    this.mainChannel.on(
      'broadcast',
      { event: 'token-usage' },
      (payload) => {
        const event = payload.payload as TokenUsageEvent;
        event.timestamp = new Date(event.timestamp);
        callback(event);
      }
    );
  }

  // Remove event listeners
  offWorkflowProgress(callback?: (event: WorkflowProgressEvent) => void) {
    if (!this.mainChannel) return;
    // Note: Supabase doesn't have a direct way to remove specific listeners
    // You might need to recreate the channel to fully remove listeners
  }

  offNewLog(callback?: (event: LogEvent) => void) {
    // Similar limitation as above
  }

  offWorkflowLog(callback?: (event: LogEvent) => void) {
    // Similar limitation as above
  }

  offConductorEvent(callback?: (event: ConductorEvent) => void) {
    // Similar limitation as above
  }

  offTokenUsage(callback?: (event: TokenUsageEvent) => void) {
    // Similar limitation as above
  }

  get connected(): boolean {
    return this.isConnected;
  }

  // Helper method to broadcast events (for server-side usage via HTTP)
  async broadcastEvent(channel: string, event: string, payload: any) {
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          event,
          payload
        })
      });

      if (!response.ok) {
        console.error('Failed to broadcast event:', await response.text());
      }
    } catch (error) {
      console.error('Error broadcasting event:', error);
    }
  }
}

// Create singleton instance with the same interface as the original websocketClient
export const websocketClient = new SupabaseRealtimeClient();

// Auto-connect when module loads
if (typeof window !== "undefined") {
  websocketClient.connect().catch(error => {
    console.warn("Failed to auto-connect to Supabase Realtime:", error.message);
  });
}