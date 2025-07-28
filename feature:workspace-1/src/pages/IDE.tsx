import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useParams } from "wouter";
import Navigation from "@/components/Navigation";
import TablesPanel from "@/components/TablesPanel";
import QueryBuilderCanvas from "@/components/QueryBuilderCanvas";
import SQLEditor from "@/components/SQLEditor";
import ResultsPanel from "@/components/ResultsPanel";
import FileTree from "@/components/FileTree";

export default function IDE() {
  const { projectId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResults, setQueryResults] = useState<any>(null);
  const [canvasNodes, setCanvasNodes] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeView, setActiveView] = useState<'query-builder' | 'code-editor'>('query-builder');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Load project if projectId is provided
  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId && isAuthenticated,
  });

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
      setSqlQuery(project.sqlQuery || "");
      setCanvasNodes(project.visualConfig?.nodes || []);
    }
  }, [project]);

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (currentProject?.id) {
        return apiRequest("PUT", `/api/projects/${currentProject.id}`, projectData);
      } else {
        return apiRequest("POST", "/api/projects", projectData);
      }
    },
    onSuccess: (response) => {
      const savedProject = response.json();
      setCurrentProject(savedProject);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project saved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    },
  });

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest("POST", "/api/execute-query", { query });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setQueryResults(result);
      setIsExecuting(false);
      toast({
        title: "Success",
        description: `Query executed successfully. ${result.rowCount} rows returned.`,
      });
    },
    onError: (error) => {
      setIsExecuting(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Query Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProject = () => {
    const projectData = {
      name: currentProject?.name || "Untitled Project",
      description: currentProject?.description || "",
      sqlQuery,
      visualConfig: {
        nodes: canvasNodes,
      },
    };
    saveProjectMutation.mutate(projectData);
  };

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      });
      return;
    }
    setIsExecuting(true);
    executeQueryMutation.mutate(sqlQuery);
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-beige flex flex-col">
      <Navigation 
        currentProject={currentProject}
        onSaveProject={handleSaveProject}
        isSaving={saveProjectMutation.isPending}
      />
      
      <div className="flex flex-1 h-screen">
        {/* Left Sidebar - Combined Tables and File Explorer */}
        <div className="w-80 bg-white border-r border-border flex flex-col">
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveView('query-builder')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeView === 'query-builder'
                  ? 'bg-white border-b-2 border-soft-orange text-dark-text'
                  : 'bg-gray-50 text-muted-foreground hover:text-dark-text'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveView('code-editor')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeView === 'code-editor'
                  ? 'bg-white border-b-2 border-soft-orange text-dark-text'
                  : 'bg-gray-50 text-muted-foreground hover:text-dark-text'
              }`}
            >
              Files
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1">
            {activeView === 'query-builder' ? (
              <TablesPanel onTableDrop={(table) => {
                // Add table to canvas
                const newNode = {
                  id: `table-${Date.now()}`,
                  table: table.name,
                  position: { x: 100, y: 100 },
                  fields: table.fields || [],
                };
                setCanvasNodes([...canvasNodes, newNode]);
              }} />
            ) : (
              <FileTree />
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeView === 'query-builder' ? (
            <>
              {/* Visual Query Builder Canvas */}
              <QueryBuilderCanvas
                nodes={canvasNodes}
                onNodesChange={setCanvasNodes}
                onSqlChange={setSqlQuery}
              />

              {/* Bottom Panel - SQL Editor */}
              <SQLEditor
                value={sqlQuery}
                onChange={setSqlQuery}
                onExecute={handleExecuteQuery}
                isExecuting={isExecuting}
              />
            </>
          ) : (
            /* File Tree with integrated code viewing */
            <div className="h-full p-4">
              <FileTree root="/src/" />
            </div>
          )}
        </div>

        {/* Right Sidebar - Results Panel (only for query builder) */}
        {activeView === 'query-builder' && (
          <ResultsPanel 
            results={queryResults}
            isLoading={isExecuting}
          />
        )}
      </div>
    </div>
  );
}
