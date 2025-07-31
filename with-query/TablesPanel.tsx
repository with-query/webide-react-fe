import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Table, Users, ShoppingCart, Package, List, Wand2 } from "lucide-react";

interface TablesPanelProps {
  onTableDrop: (table: any) => void;
}

export default function TablesPanel({ onTableDrop }: TablesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Mock table data for demonstration
  const tables = [
    {
      name: "sample_customers",
      icon: Users,
      rowCount: 1247,
      category: "Users",
      fields: [
        { name: "id", type: "INT", isPrimaryKey: true },
        { name: "name", type: "VARCHAR" },
        { name: "email", type: "VARCHAR" },
        { name: "created_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "sample_orders",
      icon: ShoppingCart,
      rowCount: 3891,
      category: "Sales",
      fields: [
        { name: "id", type: "INT", isPrimaryKey: true },
        { name: "customer_id", type: "INT", isForeignKey: true, references: "sample_customers.id" },
        { name: "total_amount", type: "DECIMAL" },
        { name: "order_date", type: "DATE" },
      ],
    },
    {
      name: "sample_products",
      icon: Package,
      rowCount: 542,
      category: "Products",
      fields: [
        { name: "id", type: "INT", isPrimaryKey: true },
        { name: "name", type: "VARCHAR" },
        { name: "price", type: "DECIMAL" },
        { name: "category", type: "VARCHAR" },
      ],
    },
    {
      name: "sample_order_items",
      icon: List,
      rowCount: 8234,
      category: "Sales",
      fields: [
        { name: "id", type: "INT", isPrimaryKey: true },
        { name: "order_id", type: "INT", isForeignKey: true, references: "sample_orders.id" },
        { name: "product_id", type: "INT", isForeignKey: true, references: "sample_products.id" },
        { name: "quantity", type: "INT" },
        { name: "price", type: "DECIMAL" },
      ],
    },
  ];

  const categories = ["All", "Users", "Sales", "Products"];

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || table.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, table: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(table));
  };

  return (
    <div className="w-80 bg-white border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3 flex items-center text-dark-text">
          <Table className="w-5 h-5 text-soft-orange mr-2" />
          Database Tables
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-light-beige border-border"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-soft-orange text-white"
                  : "bg-light-beige text-dark-text border-border hover:bg-muted/50"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTables.map((table) => {
          const IconComponent = table.icon;
          
          return (
            <Card
              key={table.name}
              draggable
              onDragStart={(e) => handleDragStart(e, table)}
              className="p-3 bg-light-beige hover:bg-muted/30 cursor-move border-border transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm flex items-center text-dark-text">
                  <IconComponent className="w-4 h-4 text-soft-orange mr-2" />
                  {table.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {table.rowCount.toLocaleString()} rows
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                {table.fields.slice(0, 3).map((field) => (
                  <div key={field.name} className="flex justify-between items-center">
                    <span className="font-mono">
                      {field.name}
                      {field.isPrimaryKey && (
                        <Badge variant="secondary" className="ml-1 text-xs bg-soft-orange/10 text-soft-orange">
                          PK
                        </Badge>
                      )}
                      {field.isForeignKey && (
                        <Badge variant="secondary" className="ml-1 text-xs bg-orange-100 text-orange-600">
                          FK
                        </Badge>
                      )}
                    </span>
                    <span>{field.type}</span>
                  </div>
                ))}
                {table.fields.length > 3 && (
                  <div className="text-xs text-muted-foreground/60">
                    + {table.fields.length - 3} more fields
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2 flex items-center">
          <span>Drag tables to canvas to build query</span>
        </div>
        <Button 
          className="w-full bg-orange-100 hover:bg-orange-200 text-orange-600 border-orange-200"
          size="sm"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generate Sample Query
        </Button>
      </div>
    </div>
  );
}
