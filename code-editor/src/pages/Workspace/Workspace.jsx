import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, useToast, Flex, Text, Spinner, Center } from "@chakra-ui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';

// Editor 페이지와 동일한 파일 관리 컴포넌트와 훅을 가져옵니다.
import FolderSidebar from "../../components/FolderSidebar"; 
import { useProjectTree } from "../../hooks/useProjectTree";
import QueryBuilder from "./components/QueryBuilder";
import WhereClauseBuilder from './components/WhereClauseBuilder';
import WorkspaceCodeEditor from './components/CodeEditor';
import ResultsPanel from './components/ResultsPanel';

import './styles/Workspace.css';

const API_BASE_URL = "http://20.196.89.99:8080/api";

const Workspace = () => {
  const { projectId } = useParams(); 
  const toast = useToast();

  // 1. useProjectTree 훅으로 사용자 파일 목록을 관리합니다 (Editor와 동기화).
  const { tree, setTree, loading: isLoadingFileTree, manualSave, isSaving } = useProjectTree(projectId);
  const [activeFile, setActiveFile] = useState(null);

  // 2. DB 스키마와 쿼리빌더 상태를 별도로 관리합니다.
  const [dbSchema, setDbSchema] = useState(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [sqlQuery, setSqlQuery] = useState("");
  const [nodes, setNodes] = useState({});
  const [connections, setConnections] = useState([]);
  const [whereClauses, setWhereClauses] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // DB 스키마 로딩 로직
  useEffect(() => {
    const fetchDbSchema = async () => {
      if (!projectId) { setIsLoadingSchema(false); return; }
      setIsLoadingSchema(true);
      const token = localStorage.getItem('token');
      try {
        const connectionsResponse = await axios.get(`${API_BASE_URL}/db-connections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const currentConnection = connectionsResponse.data.find(
          conn => conn.projectId === parseInt(projectId, 10)
        );
        if (!currentConnection) {
          console.warn('이 프로젝트에 연결된 DB를 찾을 수 없습니다.');
          setDbSchema({ tables: [] });
          return;
        }
        const schemaResponse = await axios.get(`${API_BASE_URL}/db-connections/${currentConnection.id}/schemas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDbSchema({ tables: schemaResponse.data });
      } catch (error) {
        console.error("DB 스키마 로딩 실패:", error);
        toast({
          title: "스키마 로딩 실패",
          description: error.message,
          status: "error",
        });
      } finally {
        setIsLoadingSchema(false);
      }
    };
    fetchDbSchema();
  }, [projectId, toast]);

  // Editor 페이지와 동일한 파일 내용/언어 업데이트 함수들
  const updateContent = useCallback((content) => {
    if (!activeFile) return;
    const updateNode = (nodes) => nodes.map(n => n.id === activeFile.id ? {...n, content} : (n.children ? {...n, children: updateNode(n.children)} : n));
    setTree(prev => updateNode(prev));
    setActiveFile(prev => ({ ...prev, content }));
  }, [activeFile, setTree]);

  const changeLanguage = useCallback((lang) => {
    if (!activeFile) return;
    const updateNode = (nodes) => nodes.map(n => n.id === activeFile.id ? {...n, language: lang} : (n.children ? {...n, children: updateNode(n.children)} : n));
    setTree(prev => updateNode(prev));
    setActiveFile(prev => ({ ...prev, language: lang }));
  }, [activeFile, setTree]);

  const handleRunQuery = async () => { /* ... */ };
  
  if (isLoadingFileTree || isLoadingSchema) {
    return (
      <Center height="calc(100vh - 60px)">
        <Spinner size="xl" />
        <Text ml={4}>워크스페이스 데이터를 불러오는 중...</Text>
      </Center>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box height="calc(100vh - 60px)" width="100vw" bg="brand.100">
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={15} minSize={10} style={{ overflow: 'auto', background: '#f9f8f6' }}>
                {/* ✅ 왼쪽 사이드바에 사용자 파일 목록을 표시합니다. */}
                <FolderSidebar
                  tree={tree}
                  setTree={setTree}
                  onSelectFile={setActiveFile}
                  activeFileId={activeFile?.id}
                />        
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={50} minSize={30}>
                <QueryBuilder
                  dbSchema={dbSchema}
                  nodes={nodes}
                  setNodes={setNodes}
                  connections={connections}
                  setConnections={setConnections}
                  whereClauses={whereClauses}
                  setWhereClauses={setWhereClauses}
                  setSqlQuery={setSqlQuery}
                  tablesFromSchema={tablesFromSchema}
                />
              </Panel>
              <PanelResizeHandle className="resize-handle-vertical" />
              <Panel defaultSize={35} minSize={20}>
                <WorkspaceCodeEditor
                  file={activeFile}
                  sql={sqlQuery}
                  setSql={setSqlQuery}
                  onRunQuery={handleRunQuery}
                  isExecuting={isExecuting}
                  onChangeContent={updateContent}
                  onLanguageChange={changeLanguage}
                  onSave={manualSave}
                  isSaving={isSaving}
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
