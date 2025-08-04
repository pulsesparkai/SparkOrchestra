import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";

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
  private io: SocketIOServer;
  private connectedClients: Set<Socket> = new Set();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: "/socket.io"
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.add(socket);

      // Send initial connection acknowledgment
      socket.emit("connected", {
        message: "Connected to Orchestra WebSocket server",
        timestamp: new Date()
      });

      // Handle client subscription to specific workflows
      socket.on("subscribe-workflow", (workflowId: string) => {
        socket.join(`workflow-${workflowId}`);
        console.log(`Client ${socket.id} subscribed to workflow ${workflowId}`);
      });

      socket.on("unsubscribe-workflow", (workflowId: string) => {
        socket.leave(`workflow-${workflowId}`);
        console.log(`Client ${socket.id} unsubscribed from workflow ${workflowId}`);
      });

      // Handle conductor dashboard subscription
      socket.on("subscribe-conductor", () => {
        socket.join("conductor-dashboard");
        console.log(`Client ${socket.id} subscribed to conductor dashboard`);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket);
      });
    });
  }

  // Emit workflow progress updates
  public emitWorkflowProgress(event: WorkflowProgressEvent) {
    this.io.to(`workflow-${event.workflowId}`).emit("workflow-progress", event);
    this.io.to("conductor-dashboard").emit("workflow-progress", event);
    
    console.log(`Emitted workflow progress: ${event.agentId} - ${event.status}`);
  }

  // Emit real-time logs
  public emitLog(event: LogEvent) {
    this.io.to("conductor-dashboard").emit("new-log", event);
    
    if (event.workflowId) {
      this.io.to(`workflow-${event.workflowId}`).emit("workflow-log", event);
    }
    
    console.log(`Emitted log: [${event.level}] ${event.message}`);
  }

  // Emit conductor interventions
  public emitConductorEvent(event: ConductorEvent) {
    this.io.emit("conductor-event", event);
    console.log(`Emitted conductor event: ${event.type} - ${event.message}`);
  }

  // Emit token usage updates
  public emitTokenUsage(event: TokenUsageEvent) {
    this.io.emit("token-usage", event);
    console.log(`Emitted token usage: Agent ${event.agentId} used ${event.tokensUsed} tokens`);
  }

  // Simulate workflow execution for demo purposes
  public simulateWorkflow(workflowId: string, agentIds: string[]) {
    let currentAgentIndex = 0;
    let progress = 0;

    const progressInterval = setInterval(() => {
      if (currentAgentIndex >= agentIds.length) {
        clearInterval(progressInterval);
        
        // Emit completion
        this.emitWorkflowProgress({
          workflowId,
          agentId: agentIds[agentIds.length - 1],
          status: "complete",
          progress: 100,
          message: "Workflow completed successfully"
        });

        this.emitLog({
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          agentName: "Workflow Manager",
          agentId: "system",
          message: `Workflow ${workflowId} completed successfully`,
          level: "success",
          workflowId
        });
        
        return;
      }

      const currentAgent = agentIds[currentAgentIndex];
      progress = Math.min(100, ((currentAgentIndex + 1) / agentIds.length) * 100);

      // Emit progress update
      this.emitWorkflowProgress({
        workflowId,
        agentId: currentAgent,
        status: "running",
        progress,
        message: `Processing step ${currentAgentIndex + 1} of ${agentIds.length}`
      });

      // Emit log entry
      this.emitLog({
        id: `log-${Date.now()}-${currentAgent}`,
        timestamp: new Date(),
        agentName: `Agent ${currentAgentIndex + 1}`,
        agentId: currentAgent,
        message: `Executing task ${currentAgentIndex + 1}: Processing data batch`,
        level: Math.random() > 0.8 ? "warning" : "info",
        workflowId
      });

      // Simulate token usage
      this.emitTokenUsage({
        agentId: currentAgent,
        tokensUsed: Math.floor(Math.random() * 50) + 10,
        totalTokens: Math.floor(Math.random() * 1000) + 500,
        timestamp: new Date()
      });

      currentAgentIndex++;
    }, 2000); // Update every 2 seconds
  }

  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}