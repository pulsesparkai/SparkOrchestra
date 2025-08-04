import { io, Socket } from "socket.io-client";

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

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket) {
        resolve();
        return;
      }

      const socketUrl = window.location.origin;
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        this.isConnected = true;
        resolve();
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on("connected", (data) => {
        console.log("WebSocket server acknowledgment:", data.message);
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error("WebSocket connection timeout"));
        }
      }, 5000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Workflow subscriptions
  subscribeToWorkflow(workflowId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("subscribe-workflow", workflowId);
    }
  }

  unsubscribeFromWorkflow(workflowId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("unsubscribe-workflow", workflowId);
    }
  }

  // Conductor dashboard subscription
  subscribeToConductor() {
    if (this.socket && this.isConnected) {
      this.socket.emit("subscribe-conductor");
    }
  }

  // Event listeners
  onWorkflowProgress(callback: (event: WorkflowProgressEvent) => void) {
    if (this.socket) {
      this.socket.on("workflow-progress", callback);
    }
  }

  onNewLog(callback: (event: LogEvent) => void) {
    if (this.socket) {
      this.socket.on("new-log", callback);
    }
  }

  onWorkflowLog(callback: (event: LogEvent) => void) {
    if (this.socket) {
      this.socket.on("workflow-log", callback);
    }
  }

  onConductorEvent(callback: (event: ConductorEvent) => void) {
    if (this.socket) {
      this.socket.on("conductor-event", callback);
    }
  }

  onTokenUsage(callback: (event: TokenUsageEvent) => void) {
    if (this.socket) {
      this.socket.on("token-usage", callback);
    }
  }

  // Remove event listeners
  offWorkflowProgress(callback?: (event: WorkflowProgressEvent) => void) {
    if (this.socket) {
      this.socket.off("workflow-progress", callback);
    }
  }

  offNewLog(callback?: (event: LogEvent) => void) {
    if (this.socket) {
      this.socket.off("new-log", callback);
    }
  }

  offWorkflowLog(callback?: (event: LogEvent) => void) {
    if (this.socket) {
      this.socket.off("workflow-log", callback);
    }
  }

  offConductorEvent(callback?: (event: ConductorEvent) => void) {
    if (this.socket) {
      this.socket.off("conductor-event", callback);
    }
  }

  offTokenUsage(callback?: (event: TokenUsageEvent) => void) {
    if (this.socket) {
      this.socket.off("token-usage", callback);
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
export const websocketClient = new WebSocketClient();

// Auto-connect when module loads
if (typeof window !== "undefined") {
  websocketClient.connect().catch(error => {
    console.warn("Failed to auto-connect to WebSocket:", error.message);
  });
}