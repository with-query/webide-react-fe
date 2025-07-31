import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project or if it's public
      if (project.userId !== req.user.claims.sub && !project.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the project
      const existingProject = await storage.getProject(projectId);
      if (!existingProject || existingProject.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(projectId, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the project
      const existingProject = await storage.getProject(projectId);
      if (!existingProject || existingProject.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Broadcast function for new messages (declare before usage)
  let broadcastMessage: (message: any) => void;

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast the new message to all connected WebSocket clients
      if (broadcastMessage) {
        broadcastMessage(message);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Sample data routes
  app.get('/api/sample-tables', async (req, res) => {
    try {
      const tables = await storage.getSampleTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching sample tables:", error);
      res.status(500).json({ message: "Failed to fetch sample tables" });
    }
  });

  // Query execution route
  app.post('/api/execute-query', isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const results = await storage.executeQuery(query);
      res.json({ results, rowCount: results.length });
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // File system API routes
  app.get('/api/files', async (req, res) => {
    try {
      const { path } = req.query;
      const dirPath = (path as string) || '/';
      
      // Mock file system structure - in a real app this would read from actual filesystem
      const mockFiles: { [key: string]: string[] } = {
        '/': ['src/', 'package.json', 'README.md', 'tsconfig.json'],
        '/src/': ['components/', 'pages/', 'hooks/', 'lib/', 'App.tsx', 'index.tsx'],
        '/src/components/': ['FileTree.tsx', 'FileNode.tsx', 'QueryBuilder.tsx', 'DataTable.tsx'],
        '/src/pages/': ['Dashboard.tsx', 'IDE.tsx', 'Chat.tsx', 'Profile.tsx'],
        '/src/hooks/': ['useFileSystem.ts', 'useAuth.ts', 'use-toast.ts'],
        '/src/lib/': ['fileApi.ts', 'utils.ts', 'i18n.ts', 'queryClient.ts']
      };
      
      const files = mockFiles[dirPath] || [];
      res.json(files);
    } catch (error) {
      console.error("Error listing directory:", error);
      res.status(500).json({ message: "디렉터리 목록을 불러오는데 실패했습니다" });
    }
  });

  app.get('/api/files/content', async (req, res) => {
    try {
      const { path } = req.query;
      const filePath = path as string;
      
      if (!filePath) {
        return res.status(400).json({ message: "파일 경로가 필요합니다" });
      }
      
      // Mock file contents - in a real app this would read from actual files
      const mockFileContents: { [key: string]: string } = {
        '/package.json': JSON.stringify({
          "name": "querilang",
          "version": "1.0.0",
          "dependencies": {
            "react": "^18.0.0",
            "typescript": "^5.0.0"
          }
        }, null, 2),
        '/README.md': '# 쿼리랑 (QueryLang)\n\nSQL 시각화 및 쿼리 빌더 플랫폼\n\n## 기능\n- 드래그 앤 드롭 쿼리 빌더\n- 실시간 SQL 생성\n- 데이터 시각화\n- 팀 협업',
        '/src/App.tsx': '// Main App Component\nimport React from "react";\nimport { Routes, Route } from "react-router-dom";\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>쿼리랑</h1>\n    </div>\n  );\n}',
        '/src/index.tsx': '// App entry point\nimport React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nconst root = ReactDOM.createRoot(document.getElementById("root")!);\nroot.render(<App />);',
        '/src/components/FileTree.tsx': '// File Tree Component\nimport React from "react";\n\nexport default function FileTree() {\n  return (\n    <div>\n      <h2>File Explorer</h2>\n    </div>\n  );\n}',
        '/src/components/QueryBuilder.tsx': '// Query Builder Component\nimport React from "react";\n\nexport default function QueryBuilder() {\n  return (\n    <div>\n      <h1>Query Builder</h1>\n    </div>\n  );\n}',
        '/src/pages/Dashboard.tsx': '// Dashboard Page\nimport React from "react";\n\nexport default function Dashboard() {\n  return (\n    <div>\n      <h1>Dashboard</h1>\n    </div>\n  );\n}',
        '/src/lib/fileApi.ts': '// File API utilities\nexport async function listDirectory(path: string): Promise<string[]> {\n  const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);\n  return res.json();\n}'
      };
      
      const content = mockFileContents[filePath] || `// ${filePath}\n// File content would be loaded here`;
      res.send(content);
    } catch (error) {
      console.error("Error reading file:", error);
      res.status(500).json({ message: "파일 내용을 불러오는데 실패했습니다" });
    }
  });

  app.post('/api/files', async (req, res) => {
    try {
      const { path, content } = req.body;
      
      if (!path || typeof content !== 'string') {
        return res.status(400).json({ message: "파일 경로와 내용이 필요합니다" });
      }
      
      // Mock file writing - in a real app this would write to actual filesystem
      console.log(`Writing file: ${path}`);
      console.log(`Content: ${content.substring(0, 100)}...`);
      
      res.json({ message: "파일이 성공적으로 저장되었습니다" });
    } catch (error) {
      console.error("Error writing file:", error);
      res.status(500).json({ message: "파일 쓰기 실패" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const connectedClients = new Set();
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    connectedClients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });
  
  // Assign broadcast function
  broadcastMessage = (message: any) => {
    const messageData = JSON.stringify({
      type: 'new_message',
      data: message
    });
    
    connectedClients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageData);
      }
    });
  };

  return httpServer;
}
