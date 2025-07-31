import React, { useState } from "react";
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import FileTree from "./components/FileTree";
import QueryBuilder from "./components/QueryBuilder";
import CodeEditor from "./components/CodeEditor";
import ResultsPanel from './components/ResultsPanel';
import { useTranslation } from "react-i18next";

import './styles/Workspace.css';

const mockResultsData = [
  { customer_id: 101, customer_name: '홍길동', email: 'hong@example.com', order_date: '2025-03-15' },
  { customer_id: 102, customer_name: '이순신', email: 'lee@example.com', order_date: '2025-04-01' },
];


const Workspace = () => {
    const { t } = useTranslation();

    const [sqlQuery, setSqlQuery] = useState("SELECT\n  c.customer_id,\n  c.customer_name\nFROM customers c");
    const [queryResults, setQueryResults] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleRunQuery = () => {
      setIsExecuting(true);
      setQueryResults(null);
      setTimeout(() => {
        setQueryResults(mockResultsData);
        setIsExecuting(false);
      }, 1500);
    };

  return (
    <Box height="100vh" width="100vw">
      <PanelGroup direction="vertical">
        {/* 상단 메인 영역 */}
        <Panel defaultSize={70} minSize={30}>
          <PanelGroup direction="horizontal">
            {/* 왼쪽 파일트리 */}
            <Panel defaultSize={15} minSize={10} style={{ overflowY: 'auto' }}>
              <Box p={2}>
                <FileTree />
              </Box>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            
            {/* 가운데 쿼리 빌더 */}
            <Panel defaultSize={50} minSize={30} style={{ overflowY: 'auto' }}>
              <QueryBuilder setSqlQuery={setSqlQuery} />
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* 오른쪽 코드 에디터 */}
            <Panel defaultSize={35} minSize={20}>
              <CodeEditor 
                sqlQuery={sqlQuery}
                  setSqlQuery={setSqlQuery}
                  onRunQuery={handleRunQuery}
                  isExecuting={isExecuting}
                />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle-horizontal" />
        
        {/* 하단 결과 패널 */}
        <Panel defaultSize={30} minSize={10}>
          <ResultsPanel 
            results={queryResults} 
            loading={isExecuting} 
          />
        </Panel>
      </PanelGroup>
    </Box>
  );
};

export default Workspace;