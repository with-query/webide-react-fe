import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ZoomIn, ZoomOut, RotateCcw, Trash2, X } from "lucide-react";

interface QueryBuilderCanvasProps {
  nodes: any[];
  onNodesChange: (nodes: any[]) => void;
  onSqlChange: (sql: string) => void;
}

export default function QueryBuilderCanvas({ nodes, onNodesChange, onSqlChange }: QueryBuilderCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const tableData = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = canvasRef.current?.getBoundingClientRect();
      
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        
        const newNode = {
          id: `table-${Date.now()}`,
          table: tableData.name,
          position: { x, y },
          fields: tableData.fields || [],
          selectedFields: tableData.fields?.map(() => true) || [],
        };
        
        const updatedNodes = [...nodes, newNode];
        onNodesChange(updatedNodes);
        generateSQL(updatedNodes);
      }
    } catch (error) {
      console.error("Error parsing dropped data:", error);
    }
  }, [nodes, onNodesChange, zoom]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    onNodesChange(updatedNodes);
    generateSQL(updatedNodes);
  };

  const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, position } : node
    );
    onNodesChange(updatedNodes);
  };

  const updateFieldSelection = (nodeId: string, fieldIndex: number, selected: boolean) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        const newSelectedFields = [...node.selectedFields];
        newSelectedFields[fieldIndex] = selected;
        return { ...node, selectedFields: newSelectedFields };
      }
      return node;
    });
    onNodesChange(updatedNodes);
    generateSQL(updatedNodes);
  };

  const generateSQL = (currentNodes: any[]) => {
    if (currentNodes.length === 0) {
      onSqlChange("");
      return;
    }

    const selectedFields: string[] = [];
    const tables: string[] = [];
    const joins: string[] = [];

    currentNodes.forEach(node => {
      tables.push(node.table);
      
      node.fields.forEach((field: any, index: number) => {
        if (node.selectedFields[index]) {
          selectedFields.push(`${node.table}.${field.name}`);
        }
      });
    });

    // Auto-detect joins based on foreign key relationships
    for (let i = 0; i < currentNodes.length; i++) {
      for (let j = i + 1; j < currentNodes.length; j++) {
        const node1 = currentNodes[i];
        const node2 = currentNodes[j];
        
        // Check for foreign key relationships
        node1.fields.forEach((field: any) => {
          if (field.isForeignKey && field.references?.startsWith(node2.table)) {
            const refField = field.references.split('.')[1];
            joins.push(`LEFT JOIN ${node2.table} ON ${node1.table}.${field.name} = ${node2.table}.${refField}`);
          }
        });
        
        node2.fields.forEach((field: any) => {
          if (field.isForeignKey && field.references?.startsWith(node1.table)) {
            const refField = field.references.split('.')[1];
            joins.push(`LEFT JOIN ${node1.table} ON ${node2.table}.${field.name} = ${node1.table}.${refField}`);
          }
        });
      }
    }

    let sql = "SELECT";
    if (selectedFields.length > 0) {
      sql += "\n  " + selectedFields.join(",\n  ");
    } else {
      sql += " *";
    }
    
    sql += "\nFROM " + tables[0];
    
    if (joins.length > 0) {
      sql += "\n" + joins.join("\n");
    }
    
    sql += ";";
    
    onSqlChange(sql);
  };

  const handleNodeDragStart = (e: React.MouseEvent, node: any) => {
    setDraggedNode(node);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          updateNodePosition(draggedNode.id, { x, y });
        }
      }
    };
    
    const handleMouseUp = () => {
      setDraggedNode(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const clearCanvas = () => {
    onNodesChange([]);
    onSqlChange("");
  };

  return (
    <div className="flex-1 bg-warm-beige relative overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="bg-white border-border hover:bg-light-beige"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="bg-white border-border hover:bg-light-beige"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(1)}
          className="bg-white border-border hover:bg-light-beige"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="bg-orange-100 hover:bg-orange-200 text-orange-600 border-orange-200"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-br from-warm-beige to-light-beige relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(149, 165, 166) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        {/* Table Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.position.x,
              top: node.position.y,
            }}
          >
            <Card className="bg-white border-border shadow-lg min-w-64 max-w-72">
              {/* Node Header */}
              <div 
                className="bg-soft-orange text-white px-4 py-3 rounded-t-lg flex items-center justify-between cursor-move"
                onMouseDown={(e) => handleNodeDragStart(e, node)}
              >
                <h3 className="font-medium flex items-center">
                  <span className="font-mono">{node.table}</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNode(node.id)}
                  className="text-white hover:text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Node Fields */}
              <div className="p-3">
                <div className="space-y-2 text-sm">
                  {node.fields.map((field: any, index: number) => (
                    <div key={field.name} className={`flex items-center ${
                      field.isForeignKey ? "bg-orange-50 -mx-1 px-1 py-1 rounded" : ""
                    }`}>
                      <Checkbox
                        checked={node.selectedFields[index]}
                        onCheckedChange={(checked) => 
                          updateFieldSelection(node.id, index, checked as boolean)
                        }
                        className="mr-2"
                      />
                      <span className="font-mono flex-1">{field.name}</span>
                      <div className="flex items-center space-x-1">
                        {field.isPrimaryKey && (
                          <Badge className="text-xs bg-soft-orange/10 text-soft-orange">
                            PK
                          </Badge>
                        )}
                        {field.isForeignKey && (
                          <Badge className="text-xs bg-orange-100 text-orange-600">
                            FK
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">
                          {field.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ))}

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
            <div className="text-center">
              <div className="text-4xl text-muted-foreground mb-4">🎯</div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Start Building Your Query
              </h3>
              <p className="text-muted-foreground max-w-md">
                Drag tables from the left panel onto this canvas to begin. 
                Connections will be automatically detected based on foreign key relationships.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
