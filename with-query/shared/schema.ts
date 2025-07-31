import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table for saving user queries and visualizations
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  sqlQuery: text("sql_query"),
  visualConfig: jsonb("visual_config"), // Store canvas layout, chart settings, etc.
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages for collaboration
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sample database tables for demonstration
export const sampleCustomers = pgTable("sample_customers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sampleOrders = pgTable("sample_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => sampleCustomers.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  orderDate: timestamp("order_date").defaultNow(),
});

export const sampleProducts = pgTable("sample_products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: varchar("category"),
});

export const sampleOrderItems = pgTable("sample_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => sampleOrders.id),
  productId: integer("product_id").references(() => sampleProducts.id),
  quantity: integer("quantity").default(1),
  price: decimal("price", { precision: 10, scale: 2 }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  chatMessages: many(chatMessages),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const sampleCustomersRelations = relations(sampleCustomers, ({ many }) => ({
  orders: many(sampleOrders),
}));

export const sampleOrdersRelations = relations(sampleOrders, ({ one, many }) => ({
  customer: one(sampleCustomers, {
    fields: [sampleOrders.customerId],
    references: [sampleCustomers.id],
  }),
  orderItems: many(sampleOrderItems),
}));

export const sampleProductsRelations = relations(sampleProducts, ({ many }) => ({
  orderItems: many(sampleOrderItems),
}));

export const sampleOrderItemsRelations = relations(sampleOrderItems, ({ one }) => ({
  order: one(sampleOrders, {
    fields: [sampleOrderItems.orderId],
    references: [sampleOrders.id],
  }),
  product: one(sampleProducts, {
    fields: [sampleOrderItems.productId],
    references: [sampleProducts.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type SampleCustomer = typeof sampleCustomers.$inferSelect;
export type SampleOrder = typeof sampleOrders.$inferSelect;
export type SampleProduct = typeof sampleProducts.$inferSelect;
export type SampleOrderItem = typeof sampleOrderItems.$inferSelect;
