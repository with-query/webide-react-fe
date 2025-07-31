import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Play, Copy, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export default function SQLEditor({ value, onChange, onExecute, isExecuting }: SQLEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        description: "SQL query copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatSQL = () => {
    // Basic SQL formatting
    const formatted = value
      .replace(/\s+/g, " ")
      .replace(/SELECT/gi, "SELECT")
      .replace(/FROM/gi, "\nFROM")
      .replace(/WHERE/gi, "\nWHERE")
      .replace(/JOIN/gi, "\nJOIN")
      .replace(/LEFT JOIN/gi, "\nLEFT JOIN")
      .replace(/RIGHT JOIN/gi, "\nRIGHT JOIN")
      .replace(/INNER JOIN/gi, "\nINNER JOIN")
      .replace(/ORDER BY/gi, "\nORDER BY")
      .replace(/GROUP BY/gi, "\nGROUP BY")
      .replace(/HAVING/gi, "\nHAVING")
      .replace(/,/g, ",\n  ")
      .trim();
    
    onChange(formatted);
    toast({
      title: "Formatted",
      description: "SQL query has been formatted",
    });
  };

  const getSyntaxValidation = () => {
    if (!value.trim()) {
      return { isValid: false, message: "No query" };
    }
    
    const trimmed = value.trim().toLowerCase();
    if (!trimmed.startsWith("select")) {
      return { isValid: false, message: "Only SELECT queries allowed" };
    }
    
    return { isValid: true, message: "Syntax valid" };
  };

  const validation = getSyntaxValidation();

  return (
    <div className="h-64 bg-white border-t border-border flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium flex items-center text-dark-text">
              <Code className="w-5 h-5 text-soft-orange mr-2" />
              Generated SQL
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={formatSQL}
                disabled={!value.trim()}
              >
                <Wand2 className="w-4 h-4 mr-1" />
                Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!value.trim()}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                validation.isValid ? "bg-green-500" : "bg-red-500"
              }`} />
              {validation.message}
            </div>
            <Button
              onClick={onExecute}
              disabled={isExecuting || !validation.isValid}
              className="bg-soft-orange hover:bg-soft-orange/90 text-white"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Query
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your SQL query will appear here..."
            className="w-full h-full p-4 font-mono text-sm bg-dark-text/5 border-0 resize-none focus:outline-none focus:ring-0"
            style={{ 
              minHeight: "100%",
              lineHeight: "1.5"
            }}
          />
          
          {/* Syntax highlighting overlay could be added here */}
          {value && (
            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
              {value.split('\n').length} lines
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
