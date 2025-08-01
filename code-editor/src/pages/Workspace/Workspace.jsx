import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import FileTree from "./components/FileTree";
import QueryBuilder from "./components/QueryBuilder";
import WhereClauseBuilder from './components/WhereClauseBuilder';
import CodeEditor from "./components/CodeEditor";
import ResultsPanel from './components/ResultsPanel';

import './styles/Workspace.css';

// --- Mock 데이터 정의 ---
const dbSchema = {
  tables: [
    { id: 'customers', name: 'customers', columns: [ { name: 'customer_id', type: 'INT', pk: true }, { name: 'customer_name', type: 'VARCHAR' }, { name: 'email', type: 'VARCHAR' }] },
    { id: 'orders', name: 'orders', columns: [ { name: 'order_id', type: 'INT', pk: true }, { name: 'customer_id', type: 'INT', fk: true }, { name: 'order_date', type: 'DATE' }] },
    { id: 'products', name: 'products', columns: [ { name: 'product_id', type: 'INT', pk: true }, { name: 'product_name', type: 'VARCHAR' }, { name: 'price', type: 'DECIMAL' }] },
  ]
};

const MOCK_NODES = {
  'customers': { ...dbSchema.tables.find(t => t.id === 'customers'), left: 100, top: 100, alias: 'c1' },
  'orders': { ...dbSchema.tables.find(t => t.id === 'orders'), left: 400, top: 150, alias: 'o2' }
};

const MOCK_CONNECTIONS = [
  { id: 'conn1', from: { fromNodeId: 'customers', fromColumnName: 'customer_id' }, to: { toNodeId: 'orders', toColumnName: 'customer_id' } }
];

const MOCK_WHERE_CLAUSES = [
  { id: 1, column: 'c1.customer_id', operator: '=', value: '1', connector: 'AND' }
];

const Workspace = () => {
  const [sqlQuery, setSqlQuery] = useState("");
  const [nodes, setNodes] = useState(MOCK_NODES);
  // ✨ 1. 누락되었던 connections 상태 선언을 추가합니다.
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [whereClauses, setWhereClauses] = useState([]);
  
  const [queryResults, setQueryResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = () => { /* ... */ };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box height="calc(100vh - 60px)" width="100vw" bg="gray.50">
        {/* ✨ 3. Panel들의 defaultSize 합계를 100으로 맞춥니다. (60 + 20 + 20 = 100) */}
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={15} minSize={10} style={{ overflow: 'auto', background: '#f8f9fa' }}>
                <Box p={2}><FileTree tables={dbSchema.tables} /></Box>
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={50} minSize={30}>
                <QueryBuilder
                  setSqlQuery={setSqlQuery}
                  nodes={nodes}
                  setNodes={setNodes}
                  connections={connections}
                  setConnections={setConnections}
                />
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={35} minSize={20}>
                <CodeEditor
                  sql={sqlQuery}
                  setSql={setSqlQuery}
                  onRunQuery={handleRunQuery}
                  isExecuting={isExecuting}
                />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal" />
          <Panel defaultSize={20} minSize={10} style={{ overflow: 'auto' }}>
            {/* ✨ 2. 불필요한 ref를 제거합니다. */}
            <WhereClauseBuilder nodes={nodes} clauses={whereClauses} setClauses={setWhereClauses} />
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal" />
          <Panel defaultSize={20} minSize={10} style={{ overflow: 'auto' }}>
            <ResultsPanel results={queryResults} loading={isExecuting} />
          </Panel>
        </PanelGroup>
      </Box>
    </DndProvider>
  );
};

export default Workspace;