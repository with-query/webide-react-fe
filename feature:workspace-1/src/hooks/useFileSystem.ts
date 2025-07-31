import { useState, useCallback } from 'react';

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  modified: Date;
  created: Date;
  children?: FileSystemItem[];
  isExpanded?: boolean;
  content?: string;
}

// Mock file system data structure
const createMockFileSystem = (): FileSystemItem[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      path: '/src',
      modified: now,
      created: weekAgo,
      isExpanded: true,
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          modified: yesterday,
          created: weekAgo,
          isExpanded: false,
          children: [
            {
              id: '3',
              name: 'QueryBuilder.tsx',
              type: 'file',
              path: '/src/components/QueryBuilder.tsx',
              size: 2048,
              modified: yesterday,
              created: weekAgo,
              content: '// Query Builder Component\nimport React from "react";\n\nexport default function QueryBuilder() {\n  return (\n    <div>\n      <h1>Query Builder</h1>\n    </div>\n  );\n}'
            },
            {
              id: '4',
              name: 'DataTable.tsx',
              type: 'file',
              path: '/src/components/DataTable.tsx',
              size: 1536,
              modified: now,
              created: weekAgo,
              content: '// Data Table Component\nimport React from "react";\n\nexport default function DataTable() {\n  return (\n    <div>\n      <h1>Data Table</h1>\n    </div>\n  );\n}'
            }
          ]
        },
        {
          id: '5',
          name: 'pages',
          type: 'folder',
          path: '/src/pages',
          modified: now,
          created: weekAgo,
          isExpanded: false,
          children: [
            {
              id: '6',
              name: 'Dashboard.tsx',
              type: 'file',
              path: '/src/pages/Dashboard.tsx',
              size: 3072,
              modified: now,
              created: weekAgo,
              content: '// Dashboard Page\nimport React from "react";\n\nexport default function Dashboard() {\n  return (\n    <div>\n      <h1>Dashboard</h1>\n    </div>\n  );\n}'
            },
            {
              id: '7',
              name: 'IDE.tsx',
              type: 'file',
              path: '/src/pages/IDE.tsx',
              size: 4096,
              modified: yesterday,
              created: weekAgo,
              content: '// IDE Page\nimport React from "react";\n\nexport default function IDE() {\n  return (\n    <div>\n      <h1>IDE</h1>\n    </div>\n  );\n}'
            }
          ]
        },
        {
          id: '8',
          name: 'utils',
          type: 'folder',
          path: '/src/utils',
          modified: weekAgo,
          created: weekAgo,
          isExpanded: false,
          children: [
            {
              id: '9',
              name: 'helpers.ts',
              type: 'file',
              path: '/src/utils/helpers.ts',
              size: 512,
              modified: weekAgo,
              created: weekAgo,
              content: '// Helper functions\nexport function formatDate(date: Date): string {\n  return date.toLocaleDateString();\n}\n\nexport function formatBytes(bytes: number): string {\n  const sizes = ["Bytes", "KB", "MB", "GB"];\n  if (bytes === 0) return "0 Bytes";\n  const i = Math.floor(Math.log(bytes) / Math.log(1024));\n  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];\n}'
            }
          ]
        },
        {
          id: '10',
          name: 'App.tsx',
          type: 'file',
          path: '/src/App.tsx',
          size: 1024,
          modified: now,
          created: weekAgo,
          content: '// Main App Component\nimport React from "react";\nimport { Routes, Route } from "react-router-dom";\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>Query랑</h1>\n    </div>\n  );\n}'
        },
        {
          id: '11',
          name: 'index.tsx',
          type: 'file',
          path: '/src/index.tsx',
          size: 256,
          modified: weekAgo,
          created: weekAgo,
          content: '// App entry point\nimport React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nconst root = ReactDOM.createRoot(document.getElementById("root")!);\nroot.render(<App />);'
        }
      ]
    }
  ];
};

export function useFileSystem() {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(createMockFileSystem);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);

  const findItemById = useCallback((items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const updateItem = useCallback((items: FileSystemItem[], id: string, updates: Partial<FileSystemItem>): FileSystemItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, ...updates, modified: new Date() };
      }
      if (item.children) {
        return { ...item, children: updateItem(item.children, id, updates) };
      }
      return item;
    });
  }, []);

  const removeItem = useCallback((items: FileSystemItem[], id: string): FileSystemItem[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children) {
        item.children = removeItem(item.children, id);
      }
      return true;
    });
  }, []);

  const addItem = useCallback((parentId: string, newItem: Omit<FileSystemItem, 'id' | 'modified' | 'created'>) => {
    const now = new Date();
    const item: FileSystemItem = {
      ...newItem,
      id: Date.now().toString(),
      modified: now,
      created: now,
    };

    setFileSystem(prev => {
      const addToParent = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(existingItem => {
          if (existingItem.id === parentId && existingItem.type === 'folder') {
            return {
              ...existingItem,
              children: [...(existingItem.children || []), item],
              isExpanded: true,
              modified: now
            };
          }
          if (existingItem.children) {
            return { ...existingItem, children: addToParent(existingItem.children) };
          }
          return existingItem;
        });
      };
      return addToParent(prev);
    });

    return item;
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setFileSystem(prev => updateItem(prev, id, { isExpanded: !findItemById(prev, id)?.isExpanded }));
  }, [findItemById, updateItem]);

  const selectFile = useCallback((file: FileSystemItem) => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  }, []);

  const renameItem = useCallback((id: string, newName: string) => {
    setFileSystem(prev => updateItem(prev, id, { name: newName }));
  }, [updateItem]);

  const deleteItem = useCallback((id: string) => {
    setFileSystem(prev => removeItem(prev, id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  }, [removeItem, selectedFile]);

  const createFile = useCallback((parentId: string, name: string) => {
    const parentItem = findItemById(fileSystem, parentId);
    const parentPath = parentItem?.path || '/src';
    
    return addItem(parentId, {
      name,
      type: 'file',
      path: `${parentPath}/${name}`,
      size: 0,
      content: `// ${name}\n// New file created in ${parentPath}\n`
    });
  }, [addItem, findItemById, fileSystem]);

  const createFolder = useCallback((parentId: string, name: string) => {
    const parentItem = findItemById(fileSystem, parentId);
    const parentPath = parentItem?.path || '/src';
    
    return addItem(parentId, {
      name,
      type: 'folder',
      path: `${parentPath}/${name}`,
      children: []
    });
  }, [addItem, findItemById, fileSystem]);

  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return {
    fileSystem,
    selectedFile,
    toggleFolder,
    selectFile,
    renameItem,
    deleteItem,
    createFile,
    createFolder,
    formatFileSize,
    formatDate,
    findItemById
  };
}