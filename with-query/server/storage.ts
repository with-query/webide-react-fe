import {
  users,
  projects,
  chatMessages,
  sampleCustomers,
  sampleOrders,
  sampleProducts,
  sampleOrderItems,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ChatMessage,
  type InsertChatMessage,
  type SampleCustomer,
  type SampleOrder,
  type SampleProduct,
  type SampleOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Chat operations
  getChatMessages(limit?: number): Promise<(ChatMessage & { user: User })[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Sample data operations
  getSampleTables(): Promise<{ 
    customers: SampleCustomer[], 
    orders: SampleOrder[], 
    products: SampleProduct[], 
    orderItems: SampleOrderItem[] 
  }>;
  executeQuery(query: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Chat operations
  async getChatMessages(limit: number = 50): Promise<(ChatMessage & { user: User })[]> {
    return await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Sample data operations
  async getSampleTables(): Promise<{ 
    customers: SampleCustomer[], 
    orders: SampleOrder[], 
    products: SampleProduct[], 
    orderItems: SampleOrderItem[] 
  }> {
    const [customers, orders, products, orderItems] = await Promise.all([
      db.select().from(sampleCustomers),
      db.select().from(sampleOrders),
      db.select().from(sampleProducts),
      db.select().from(sampleOrderItems),
    ]);

    return { customers, orders, products, orderItems };
  }

  async executeQuery(query: string): Promise<any[]> {
    try {
      // Basic SQL injection protection - only allow SELECT statements
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed');
      }
      
      const result = await db.execute(sql.raw(query));
      return result.rows || [];
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }
}

export const storage = new DatabaseStorage();
