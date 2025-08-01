import React, { useState, useEffect, useCallback } from "react"; // useEffect, useCallback 추가
import { Box, useToast } from "@chakra-ui/react"; // useToast 추가
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import FileTree from "./components/FileTree";
import QueryBuilder from "./components/QueryBuilder";
import WhereClauseBuilder from './components/WhereClauseBuilder';
import WorkspaceCodeEditor from './components/CodeEditor'
import ResultsPanel from './components/ResultsPanel';

import './styles/Workspace.css';

// Base URL for your API
const API_BASE_URL = "http://20.196.89.99:8080"; // Editor.jsx와 동일하게 설정

// --- Mock 데이터 정의 (API에서 받아올 데이터의 구조를 예상) ---
// dbSchema는 이제 prop으로 받을 것이므로 여기서는 제거하거나 초기값으로만 사용
// const dbSchema = { /* ... */ };

const MOCK_NODES = {
  'customers': { id: 'customers', name: 'customers', left: 100, top: 100, alias: 'c1' }, // dbSchema.tables에서 직접 가져오지 않도록 수정
  'orders': { id: 'orders', name: 'orders', left: 400, top: 150, alias: 'o2' } // dbSchema.tables에서 직접 가져오지 않도록 수정
};

const MOCK_CONNECTIONS = [
  { id: 'conn1', from: { fromNodeId: 'customers', fromColumnName: 'customer_id' }, to: { toNodeId: 'orders', toColumnName: 'customer_id' } }
];

const MOCK_WHERE_CLAUSES = [
  { id: 1, column: 'c1.customer_id', operator: '=', value: '1', connector: 'AND' }
];

const Workspace = ({ projectData, dbSchema: propDbSchema, fileTree, selectedFile, onFileSelect }) => { // propDbSchema로 이름 변경하여 내부 상태와 구분
  const [sqlQuery, setSqlQuery] = useState("");
  const [nodes, setNodes] = useState(MOCK_NODES);
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [whereClauses, setWhereClauses] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const toast = useToast();

  // dbSchema를 prop으로 받아서 사용하거나, 필요한 경우 내부 상태로 관리
  // 여기서는 prop으로 받은 dbSchema를 직접 사용합니다.
  const tablesFromSchema = propDbSchema?.tables || []; // propDbSchema가 undefined일 경우 빈 배열 사용

  // Editor.jsx와 동일한 토큰 가져오기 함수
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API 호출 함수: 스키마 정보 가져오기 (필요하다면)
  // 만약 dbSchema가 prop으로 항상 완벽하게 전달된다면 이 함수는 필요 없을 수 있습니다.
  // 하지만 dbSchema를 동적으로 가져와야 한다면 이 함수를 사용합니다.
  const fetchDbSchema = useCallback(async () => {
    // projectId는 Workspace 컴포넌트의 prop으로 전달받지 않으므로,
    // 만약 dbSchema API가 projectId를 필요로 한다면, Workspace 컴포넌트도 projectId를 prop으로 받아야 합니다.
    // 현재는 dbSchema가 propDbSchema로 전달된다고 가정합니다.
    // 만약 dbSchema를 API로 가져와야 한다면, 이 부분을 구현해야 합니다.
    // 예: const response = await fetch(`${API_BASE_URL}/schema`, { ... });
    // const data = await response.json();
    // setDbSchema(data); // 만약 dbSchema를 내부 상태로 관리한다면
  }, []); // 의존성 추가 필요

  // API 호출 함수: 파일 내용 저장/업데이트 (PATCH /api/files/{fileId})
  const updateFileContent = useCallback(async (fileId, newContent) => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not found.", status: "error" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, { // API 경로 확인 필요
        method: "PATCH", // 또는 PUT
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent }),
      });
      if (!response.ok) {
        throw new Error("Failed to update file content.");
      }
      toast({ title: "Success", description: "File content updated.", status: "success" });
      // 파일 트리를 다시 불러오거나 selectedFile을 업데이트하여 변경사항 반영
      // onFileSelect(prev => ({ ...prev, content: newContent })); // selectedFile이 Workspace 내부 상태라면
    } catch (error) {
      console.error("Error updating file content:", error);
      toast({ title: "Error", description: "Failed to update file content.", status: "error" });
    }
  }, [toast]);

  // API 호출 함수: 파일 언어 변경 (PATCH /api/files/{fileId}/language)
  const updateFileLanguage = useCallback(async (fileId, newLanguage) => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not found.", status: "error" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/language`, { // API 경로 확인 필요
        method: "PATCH", // 또는 PUT
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ language: newLanguage }),
      });
      if (!response.ok) {
        throw new Error("Failed to update file language.");
      }
      toast({ title: "Success", description: "File language updated.", status: "success" });
    } catch (error) {
      console.error("Error updating file language:", error);
      toast({ title: "Error", description: "Failed to update file language.", status: "error" });
    }
  }, [toast]);


  const handleRunQuery = async () => {
    setIsExecuting(true);
    setQueryResults(null);

    console.log("실행할 쿼리:", sqlQuery);

    // 실제로는 여기서 백엔드 API를 호출합니다.
    // 예시:
    // const token = getAuthToken();
    // if (!token) {
    //   toast({ title: "Error", description: "Authentication token not found.", status: "error" });
    //   setIsExecuting(false);
    //   return;
    // }
    // try {
    //   const response = await fetch(`${API_BASE_URL}/query/execute`, { // 쿼리 실행 API 경로 확인 필요
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${token}`
    //     },
    //     body: JSON.stringify({ query: sqlQuery }),
    //   });
    //   if (!response.ok) {
    //     throw new Error("Failed to execute query.");
    //   }
    //   const data = await response.json();
    //   setQueryResults(data); // API 응답 형식에 따라 조정
    // } catch (error) {
    //   console.error("Error executing query:", error);
    //   toast({ title: "Error", description: "Failed to execute query.", status: "error" });
    // } finally {
    //   setIsExecuting(false);
    // }

    // 1.5초 후 Mock 데이터 반환을 시뮬레이션하는 비동기 로직 (API 호출 시 이 부분 제거)
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockData = {
      columns: ['customer_id', 'customer_name', 'order_id', 'order_date'],
      rows: [
        [1, 'John Doe', 101, '2024-01-15'],
        [2, 'Jane Smith', 102, '2024-01-17'],
      ]
    };
    setQueryResults(mockData);
    setIsExecuting(false);
  };

  console.log("===[Workspace 상태] Nodes 개수:", Object.keys(nodes).length);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box height="calc(100vh - 60px)" width="100vw" bg="gray.50">
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={15} minSize={10} style={{ overflow: 'auto', background: '#f8f9fa' }}>
                {/* dbSchema가 유효할 때만 tables를 전달 */}
                <Box p={2}><FileTree tables={tablesFromSchema} /></Box>
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={50} minSize={30}>
                <QueryBuilder
                  nodes={nodes}
                  setNodes={setNodes}
                  connections={connections}
                  setConnections={setConnections}
                  whereClauses={whereClauses}
                  setSqlQuery={setSqlQuery}
                  // QueryBuilder가 dbSchema.tables를 직접 사용한다면 propDbSchema를 전달해야 합니다.
                  tablesFromSchema={tablesFromSchema}
                />
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={35} minSize={20}>
                <WorkspaceCodeEditor
                  file={selectedFile}
                  sql={sqlQuery}
                  setSql={setSqlQuery}
                  onRunQuery={handleRunQuery}
                  isExecuting={isExecuting}
                  onChangeContent={(newContent) => {
                    if(selectedFile) {
                      console.log(`파일 ${selectedFile.id} 내용 변경:`, newContent);
                      updateFileContent(selectedFile.id, newContent); // API 호출
                    }
                  }}
                  onLanguageChange={(lang) => {
                    if(selectedFile) {
                      console.log(`파일 ${selectedFile.id} 언어 변경:`, lang);
                      updateFileLanguage(selectedFile.id, lang); // API 호출
                    }
                  }}
                />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal" />
          <Panel defaultSize={20} minSize={10} style={{ overflow: 'auto' }}>
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
