import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FlowNodeProps {
  data: {
    table: string;
    fields: Array<{
      name: string;
      type: string;
      isPrimaryKey?: boolean;
      isForeignKey?: boolean;
      references?: string;
    }>;
    selectedFields: boolean[];
    onFieldToggle: (fieldIndex: number, selected: boolean) => void;
    onRemove: () => void;
  };
}

export default memo(function FlowNode({ data }: FlowNodeProps) {
  return (
    <Card className="bg-white border-border shadow-lg min-w-64 max-w-72">
      {/* Node Header */}
      <div className="bg-soft-orange text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <h3 className="font-medium font-mono">{data.table}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={data.onRemove}
          className="text-white hover:text-white hover:bg-white/20 p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Node Fields */}
      <div className="p-3">
        <div className="space-y-2 text-sm">
          {data.fields.map((field, index) => (
            <div
              key={field.name}
              className={`flex items-center ${
                field.isForeignKey ? "bg-orange-50 -mx-1 px-1 py-1 rounded" : ""
              }`}
            >
              <Checkbox
                checked={data.selectedFields[index]}
                onCheckedChange={(checked) =>
                  data.onFieldToggle(index, checked as boolean)
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

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-soft-orange border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-soft-orange border-2 border-white"
      />
    </Card>
  );
});
