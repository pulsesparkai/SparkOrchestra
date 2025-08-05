import { type User, type InsertUser, type Agent, type InsertAgent } from "@shared/schema";
import crypto from "crypto";
import { users } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  getAgentsByUserId(userId: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if ('db' in this) {
      // Database storage
      const [user] = await (this as DatabaseStorage).db.insert(users).values({
        ...insertUser,
        email: insertUser.email || null,
        createdAt: new Date(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        userPlan: insertUser.userPlan || "free"
      }).returning();
      return user;
    } else {
      // Memory storage
      const memStorage = this as MemStorage;
      const newUser: User = {
        ...insertUser,
        id: crypto.randomUUID(),
        email: insertUser.email || null,
        createdAt: new Date(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        userPlan: insertUser.userPlan || "free"
      };
      memStorage.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => !agent.deletedAt).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    return Array.from(this.agents.values())
      .filter(agent => agent.userId === userId && !agent.deletedAt)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = crypto.randomUUID();
    const now = new Date();
    const agent: Agent = { 
      id,
      userId: insertAgent.userId,
      name: insertAgent.name,
      role: insertAgent.role,
      prompt: insertAgent.prompt,
      model: insertAgent.model,
      encryptedApiKey: null, // Will be set separately after encryption
      conductorMonitoring: insertAgent.conductorMonitoring || null,
      status: "active",
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { 
      ...agent, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }
}

export const storage = new MemStorage();
