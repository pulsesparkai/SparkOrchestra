// Mock WebSocket implementation for compatibility
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

export class WebSocketManager {
  private connectedClients = new Set();

  emitWorkflowProgress(event: WorkflowProgressEvent) {
    console.log('WebSocket event (workflow-progress):', event);
  }

  emitLog(event: LogEvent) {
    console.log('WebSocket event (log):', event);
  }

  emitConductorEvent(event: ConductorEvent) {
    console.log('WebSocket event (conductor):', event);
  }

  emitTokenUsage(event: TokenUsageEvent) {
    console.log('WebSocket event (token-usage):', event);
  }

  simulateWorkflow(workflowId: string, agents: string[]) {
    console.log('Simulating workflow:', workflowId, agents);
  }

  getConnectedClientsCount(): number {
    return 0;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: any): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}