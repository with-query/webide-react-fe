import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import FileTree from "./components/FileTree";
import QueryBuilder from "./components/QueryBuilder";
import CodeEditor from "./components/CodeEditor";
import ResultsPanel from './components/ResultsPanel';

// Workspace.css 파일을 import 합니다. (아래 CSS 코드 참고)
import './styles/Workspace.css';

// Mock 데이터 및 초기 SQL
const mockResultsData = [
  { customer_id: 101, customer_name: '홍길동', email: 'hong@example.com', order_date: '2025-03-15' },
  { customer_id: 102, customer_name: '이순신', email: 'lee@example.com', order_date: '2025-04-01' },
];
const INITIAL_SQL = "SELECT\n  c.customer_id,\n  c.customer_name\nFROM customers c";

const Workspace = () => {
  const [sqlQuery, setSqlQuery] = useState(INITIAL_SQL);
  const [queryResults, setQueryResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // 쿼리 실행 로직 (API 호출로 대체될 부분)
  const handleRunQuery = () => {
    setIsExecuting(true);
    setQueryResults(null);
    console.log("Executing query:", sqlQuery);
    setTimeout(() => {
      setQueryResults(mockResultsData);
      setIsExecuting(false);
    }, 1500);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box height="calc(100vh - 60px)" width="100vw" bg="gray.50"> {/* 헤더 높이만큼 제외 */}
        <PanelGroup direction="vertical">
          
          {/* 상단 메인 영역 (파일트리 | 쿼리빌더 | 코드에디터) */}
          <Panel defaultSize={70} minSize={30}>
            <PanelGroup direction="horizontal">
              
              {/* 왼쪽 파일트리 */}
              <Panel defaultSize={15} minSize={10} style={{ overflow: 'auto', background: '#f8f9fa' }}>
                <Box p={2}>
                  <FileTree />
                </Box>
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              
              {/* 가운데 쿼리 빌더 */}
              <Panel defaultSize={50} minSize={30} style={{overflow: 'auto'}}>
                <QueryBuilder setSqlQuery={setSqlQuery} />
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />

              {/* 오른쪽 코드 에디터 */}
              <Panel defaultSize={35} minSize={20} style={{ overflow: 'auto' }}>
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
          
          {/* 하단 결과 패널 */}
          <Panel defaultSize={30} minSize={10} style={{ overflow: 'auto' }}>
            <ResultsPanel 
              results={queryResults} 
              loading={isExecuting} 
            />
          </Panel>

        </PanelGroup>
      </Box>
    </DndProvider>
  );
};

export default Workspace;