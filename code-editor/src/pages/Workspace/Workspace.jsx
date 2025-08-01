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

  const handleRunQuery = async () => {
    setIsExecuting(true); // 로딩 시작
    setQueryResults(null); // 이전 결과 초기화

    console.log("실행할 쿼리:", sqlQuery);

    // 1.5초 후 Mock 데이터 반환을 시뮬레이션하는 비동기 로직
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 실제로는 여기서 백엔드 API를 호출합니다. ex: const data = await api.runQuery(sqlQuery);
    const mockData = {
      columns: ['customer_id', 'customer_name', 'order_id', 'order_date'],
      rows: [
        [1, 'John Doe', 101, '2024-01-15'],
        [2, 'Jane Smith', 102, '2024-01-17'],
      ]
    };

    setQueryResults(mockData); // 결과 상태 업데이트
    setIsExecuting(false); // 로딩 종료
  };

  console.log("===[Workspace 상태] Nodes 개수:", Object.keys(nodes).length);

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
                  nodes={nodes}
                  setNodes={setNodes} // 세터 함수 전달
                  connections={connections}
                  setConnections={setConnections} // 세터 함수 전달
                  whereClauses={whereClauses} // where절 생성을 위해 전달
                  setSqlQuery={setSqlQuery}
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