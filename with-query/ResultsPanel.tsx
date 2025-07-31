import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Table, Download, Share, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsPanelProps {
  results: any;
  isLoading: boolean;
}

export default function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("table");
  const { toast } = useToast();

  const handleExport = (format: string) => {
    if (!results?.results) {
      toast({
        title: "No Data",
        description: "No query results to export",
        variant: "destructive",
      });
      return;
    }

    let content = "";
    let mimeType = "";
    let filename = "";

    if (format === "csv") {
      const headers = Object.keys(results.results[0] || {});
      const csvContent = [
        headers.join(","),
        ...results.results.map((row: any) =>
          headers.map(header => `"${row[header] || ""}"`).join(",")
        )
      ].join("\n");
      
      content = csvContent;
      mimeType = "text/csv";
      filename = "query_results.csv";
    } else if (format === "json") {
      content = JSON.stringify(results.results, null, 2);
      mimeType = "application/json";
      filename = "query_results.json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `Results exported as ${format.toUpperCase()}`,
    });
  };

  const renderTable = () => {
    if (!results?.results || results.results.length === 0) {
      return (
        <div className="text-center py-8">
          <Table className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-dark-text mb-2">No results</h3>
          <p className="text-sm text-muted-foreground">
            Execute a query to see results here
          </p>
        </div>
      );
    }

    const headers = Object.keys(results.results[0]);
    
    return (
      <div className="bg-light-beige rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-xs">
            <thead className="bg-soft-orange/10 sticky top-0">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-2 text-left font-medium text-dark-text">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.results.slice(0, 100).map((row: any, index: number) => (
                <tr key={index} className="hover:bg-white/50">
                  {headers.map((header) => (
                    <td key={header} className="px-3 py-2">
                      {row[header] === null || row[header] === undefined ? (
                        <span className="text-muted-foreground italic">NULL</span>
                      ) : typeof row[header] === "number" ? (
                        <span className="font-mono text-soft-orange">
                          {row[header].toLocaleString()}
                        </span>
                      ) : (
                        <span>{String(row[header])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {results.results.length > 100 && (
            <div className="p-3 text-center text-sm text-muted-foreground bg-muted/20">
              Showing first 100 of {results.rowCount} rows
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (!results?.results || results.results.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-dark-text mb-2">No data to visualize</h3>
          <p className="text-sm text-muted-foreground">
            Execute a query with numeric data to see charts
          </p>
        </div>
      );
    }

    // Simple bar chart visualization
    const data = results.results.slice(0, 10); // Show max 10 bars
    const headers = Object.keys(data[0] || {});
    const numericColumns = headers.filter(header => 
      data.some((row: any) => typeof row[header] === "number")
    );

    if (numericColumns.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-dark-text mb-2">No numeric data</h3>
          <p className="text-sm text-muted-foreground">
            Query results need numeric columns for visualization
          </p>
        </div>
      );
    }

    const numericColumn = numericColumns[0];
    const maxValue = Math.max(...data.map((row: any) => Number(row[numericColumn]) || 0));
    const labelColumn = headers.find(h => h !== numericColumn) || headers[0];

    return (
      <div className="bg-light-beige rounded-lg p-4 border border-border">
        <h4 className="font-medium mb-3 flex items-center text-dark-text">
          <BarChart3 className="w-4 h-4 text-soft-orange mr-2" />
          {numericColumn} by {labelColumn}
        </h4>
        <div className="space-y-3">
          {data.map((row: any, index: number) => {
            const value = Number(row[numericColumn]) || 0;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const label = String(row[labelColumn]).slice(0, 20);
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <span className="w-20 text-xs text-muted-foreground truncate">
                  {label}
                </span>
                <div className="flex-1">
                  <div 
                    className="bg-soft-orange h-4 rounded transition-all duration-300"
                    style={{ width: `${Math.max(2, percentage)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-dark-text w-16 text-right">
                  {value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center text-dark-text">
            <BarChart3 className="w-5 h-5 text-soft-orange mr-2" />
            Query Results
          </h2>
        </div>
        
        {results && (
          <div className="text-sm text-muted-foreground mb-3 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Query executed • {results.rowCount || 0} rows returned
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="table"
              className="data-[state=active]:bg-soft-orange data-[state=active]:text-white"
            >
              Table
            </TabsTrigger>
            <TabsTrigger 
              value="chart"
              className="data-[state=active]:bg-soft-orange data-[state=active]:text-white"
            >
              Chart
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab}>
            <TabsContent value="table" className="mt-0">
              {renderTable()}
            </TabsContent>
            <TabsContent value="chart" className="mt-0">
              {renderChart()}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Actions */}
      {results?.results && (
        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs col-span-2"
            >
              <Share className="w-3 h-3 mr-1" />
              Share Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
