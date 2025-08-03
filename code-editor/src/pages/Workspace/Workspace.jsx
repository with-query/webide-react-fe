import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Spinner, Center, Text, Divider, useToast } from '@chakra-ui/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';

// Component Imports
import SchemaSidebar from './components/SchemaSidebar';
import QueryBuilder from './components/QueryBuilder';
import WhereClauseBuilder from './components/WhereClauseBuilder';
import WorkspaceCodeEditor from './components/CodeEditor';
import ResultsPanel from './components/ResultsPanel';

// Utility Import
import { generateSql } from '../../components/utils/sqlGenerator';

const API_BASE_URL = "http://20.196.89.99:8080";

const defaultSchema = {
  tables: [
    {
      tableName: 'users',
      columns: [
        { name: 'id', type: 'INT', pk: true },
        { name: 'username', type: 'VARCHAR', pk: false },
        { name: 'email', type: 'VARCHAR', pk: false },
        { name: 'created_at', type: 'DATE', pk: false },
      ],
    },
    {
      tableName: 'posts',
      columns: [
        { name: 'id', type: 'INT', pk: true },
        { name: 'user_id', type: 'INT', pk: false },
        { name: 'title', type: 'VARCHAR', pk: false },
        { name: 'content', type: 'TEXT', pk: false },
      ],
    },
     {
      tableName: 'products',
      columns: [
        { name: 'product_id', type: 'INT', pk: true },
        { name: 'product_name', type: 'VARCHAR', pk: false },
        { name: 'price', type: 'DECIMAL', pk: false },
        { name: 'stock', type: 'INT', pk: false },
      ],
    },
  ],
};

const Workspace = () => {
    const { projectId } = useParams();
    const toast = useToast();

    const [dbSchema, setDbSchema] = useState(null);
    const [isLoadingSchema, setIsLoadingSchema] = useState(true);
    const [sqlQuery, setSqlQuery] = useState('');
    
    const [nodes, setNodes] = useState({});
    const [connections, setConnections] = useState([]);
    const [whereClauses, setWhereClauses] = useState([]);

    const [isExecuting, setIsExecuting] = useState(false);
    const [queryResults, setQueryResults] = useState(null);

    const [dbConnectionId, setDbConnectionId] = useState(null);

    const handleCreateTable = useCallback((newTableName) => {
        if (!newTableName) return;

        const newTable = {
            tableName: newTableName,
            // 기본적으로 id 컬럼을 포함시켜 줍니다.
            columns: [{ name: 'id', type: 'INT', pk: true, selected: true }],
        };

        setDbSchema(prevSchema => {
            // 이전 스키마가 없거나 테이블이 없는 경우를 대비합니다.
            const tables = prevSchema?.tables ? [...prevSchema.tables] : [];
            
            // 중복된 테이블 이름이 있는지 확인합니다.
            if (tables.some(table => table.tableName === newTableName)) {
                toast({
                    title: "오류",
                    description: "이미 존재하는 테이블 이름입니다.",
                    status: "error",
                });
                return prevSchema;
            }

            return {
                ...prevSchema,
                tables: [...tables, newTable],
            };
        });

        toast({
            title: "테이블 생성됨",
            description: `'${newTableName}' 테이블이 스키마에 추가되었습니다.`,
            status: "success",
        });
    }, [toast]);

    // DB 스키마 로딩 로직
    useEffect(() => {
        const fetchDbSchema = async () => {
            if (!projectId) {
                setIsLoadingSchema(false);
                setDbSchema(defaultSchema);
                return;
            }
            setIsLoadingSchema(true);
            const token = localStorage.getItem("token");
            try {
                const connRes = await axios.get(`${API_BASE_URL}/api/db-connections`, { headers: { Authorization: `Bearer ${token}` } });
                const currentConnection = connRes.data.find(conn => conn.projectId === parseInt(projectId, 10));

                if (currentConnection) {
                   setDbConnectionId(currentConnection.id);
                    const schemaRes = await axios.get(`${API_BASE_URL}/api/db-connections/${currentConnection.id}/schemas`, { headers: { Authorization: `Bearer ${token}` } });
                    if (schemaRes.data && schemaRes.data.length > 0) {
                        setDbSchema({ tables: schemaRes.data });
                    } else {
                        setDbSchema(defaultSchema);
                    }
                } else {
                    setDbSchema(defaultSchema);
                }
            } catch (error) {
                setDbSchema(defaultSchema);
            } finally {
                setIsLoadingSchema(false);
            }
        };
        fetchDbSchema();
    }, [projectId]);

    // 쿼리 실행 핸들러 (단일 정의)
    const handleRunQuery = useCallback(async (queryToRun) => {
        if (!dbConnectionId) {
            toast({
                title: "DB 연결 필요",
                description: "쿼리를 실행하려면 먼저 DB 연결이 필요합니다.",
                status: "warning",
            });
            return;
        }

        setIsExecuting(true);
        setQueryResults(null);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_BASE_URL}/api/query/execute`, 
                { 
                    query: queryToRun || sqlQuery,
                    dbConnectionId: dbConnectionId 
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setQueryResults(response.data);
            } catch (error) {
            console.error("Query execution failed:", error);
            toast({
                title: "쿼리 실행 실패",
                description: error.response?.data?.message || "서버에서 에러가 발생했습니다.",
                status: "error",
            });
            setQueryResults({ columns: [], rows: [] });
        } finally {
            setIsExecuting(false);
        }
    }, [sqlQuery, toast, dbConnectionId]);

    // 컬럼 업데이트 핸들러 (단일 정의)
    const handleUpdateNodeColumn = useCallback((nodeId, columnUpdate) => {
        setNodes(prevNodes => {
            const newNodes = { ...prevNodes };
            const targetNode = { ...newNodes[nodeId] };
            if (!targetNode?.data?.columns) return prevNodes;
            
            let newColumns = [...targetNode.data.columns];
            if (columnUpdate.delete) {
                newColumns = newColumns.filter(c => c.name !== columnUpdate.name);
            } else if (columnUpdate.togglePK) {
                const colIndex = newColumns.findIndex(c => c.name === columnUpdate.name);
                if (colIndex > -1) newColumns[colIndex].pk = !newColumns[colIndex].pk;
            } else if (columnUpdate.isNew) {
                if (!newColumns.some(c => c.name === columnUpdate.name)) {
                    newColumns.push({ name: columnUpdate.name, type: columnUpdate.type, pk: false, selected: true });
                }
            } else {
                const colIndex = newColumns.findIndex(c => c.name === (columnUpdate.oldName || columnUpdate.name));
                if (colIndex > -1) {
                    const updatedCol = { ...newColumns[colIndex], ...columnUpdate };
                    delete updatedCol.oldName;
                    newColumns[colIndex] = updatedCol;
                }
            }
            targetNode.data.columns = newColumns;
            newNodes[nodeId] = targetNode;
            return newNodes;
        });
    }, []);

    // 연결선 삭제 핸들러 (단일 정의)
    const handleDeleteConnection = useCallback((connectionId) => {
        setConnections(prev => prev.filter(c => c.id !== connectionId));
    }, []);

    const handleDeleteTable = useCallback((tableNameToDelete) => {
        // 스키마 목록에서 해당 테이블을 제거합니다.
        setDbSchema(prev => ({
            ...prev,
            tables: prev.tables.filter(t => t.tableName !== tableNameToDelete)
        }));

        // 캔버스 위에서 해당 테이블 노드를 제거합니다.
        setNodes(prev => {
            const newNodes = { ...prev };
            // tableName이 노드의 id와 같다는 규칙을 이용합니다.
            delete newNodes[tableNameToDelete];
            return newNodes;
        });

        // 해당 노드와 연결된 모든 연결선을 제거합니다.
        setConnections(prev => prev.filter(conn => 
            conn.from.fromNodeId !== tableNameToDelete && conn.to.toNodeId !== tableNameToDelete
        ));

        toast({
            title: "테이블 삭제됨",
            description: `'${tableNameToDelete}' 테이블이 스키마에서 제거되었습니다.`,
            status: "info",
        });
    }, [toast]);
    
    // SQL 생성 로직 (단일 정의)
   useEffect(() => {
        const newSql = generateSql(nodes, connections, whereClauses);
        setSqlQuery(newSql);
    }, [nodes, connections, whereClauses]);

    if (isLoadingSchema) {
        return <Center height="100vh"><Spinner size="xl" /></Center>;
    }
    
    return (
        <DndProvider backend={HTML5Backend}>
            <Box height="calc(100vh - 60px)" width="100vw">
                <PanelGroup direction="vertical">
                    <Panel defaultSize={75} minSize={40}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={15} minSize={10}>
                                <SchemaSidebar 
                                    dbSchema={dbSchema} 
                                    isLoading={isLoadingSchema}
                                    onCreateTable={handleCreateTable} // ✅ 이 코드를 추가해주세요.
                                    onDeleteTable={handleDeleteTable}
                                />
                            </Panel>
                            <PanelResizeHandle />
                            <Panel defaultSize={45} minSize={30}>
                                <QueryBuilder
                                    dbSchema={dbSchema}
                                    nodes={nodes}
                                    setNodes={setNodes}
                                    connections={connections}
                                    setConnections={setConnections}
                                    onUpdateNodeColumn={handleUpdateNodeColumn}
                                    onDeleteConnection={handleDeleteConnection}
                                />
                            </Panel>
                            <PanelResizeHandle />
                            <Panel defaultSize={40} minSize={20}>
                                <WorkspaceCodeEditor
                                    sql={sqlQuery}
                                    setSql={setSqlQuery}
                                    onRunQuery={handleRunQuery}
                                    isExecuting={isExecuting}
                                />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle />
                    <Panel defaultSize={25} minSize={10}>
                         <Box p={3} height="100%" display="flex" flexDirection="column" overflow="auto" bg="gray.50">
                           <WhereClauseBuilder
                                nodes={Object.values(nodes)}
                                clauses={whereClauses}
                                setClauses={setWhereClauses}
                           />
                           <Divider my={4} />
                           <ResultsPanel results={queryResults} loading={isExecuting} />
                        </Box>
                    </Panel>
                </PanelGroup>
            </Box>
        </DndProvider>
    );
};

export default Workspace;
