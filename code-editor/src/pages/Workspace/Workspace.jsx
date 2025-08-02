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

const API_BASE_URL = "http://20.196.89.99:8080/api";

const Workspace = () => {
    const { projectId } = useParams();
    const toast = useToast();

    // 🧠 1. All core states are managed here in Workspace.
    const [dbSchema, setDbSchema] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sqlQuery, setSqlQuery] = useState('');
    
    // States for QueryBuilder
    const [nodes, setNodes] = useState({});
    const [connections, setConnections] = useState([]);
    const [whereClauses, setWhereClauses] = useState([]);

    // States for CodeEditor & Results
    const [isExecuting, setIsExecuting] = useState(false);
    const [queryResults, setQueryResults] = useState(null);

    // 👷 2. All handler functions to modify state are defined here.

    // Universal handler for updating any part of a node's column data
    const handleUpdateNodeColumn = useCallback((nodeId, columnUpdate) => {
        setNodes(prevNodes => {
            const newNodes = { ...prevNodes };
            const targetNode = { ...newNodes[nodeId] };
            if (!targetNode || !targetNode.data || !targetNode.data.columns) return prevNodes;
            
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
                    delete updatedCol.oldName; // clean up
                    newColumns[colIndex] = updatedCol;
                }
            }
            
            targetNode.data.columns = newColumns;
            newNodes[nodeId] = targetNode;
            return newNodes;
        });
    }, []);

    const handleDeleteConnection = useCallback((connectionId) => {
        setConnections(prev => prev.filter(c => c.id !== connectionId));
    }, []);
    
    const handleRunQuery = useCallback(async (queryToRun) => {
        setIsExecuting(true);
        setQueryResults(null);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL}/query/execute`, 
                { query: queryToRun || sqlQuery },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setQueryResults(response.data);
        } catch (error) {
            toast({
                title: "Query execution failed",
                description: error.response?.data?.message || error.message,
                status: "error",
            });
        } finally {
            setIsExecuting(false);
        }
    }, [sqlQuery, toast]);
    
    // 🔄 3. Handle side effects based on state changes.

    useEffect(() => {
        const fetchDbSchema = async () => {
            if (!projectId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const token = localStorage.getItem('token');
            try {
                const connectionsResponse = await axios.get(`${API_BASE_URL}/db-connections`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const currentConnection = connectionsResponse.data.find(conn => conn.projectId === parseInt(projectId, 10));
                
                if (currentConnection) {
                    const schemaResponse = await axios.get(`${API_BASE_URL}/db-connections/${currentConnection.id}/schemas`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setDbSchema({ tables: schemaResponse.data });
                } else {
                    setDbSchema({ tables: [] });
                    toast({ title: "DB Connection not found", status: "warning" });
                }
            } catch (error) {
                console.error("Failed to load DB schema:", error);
                setDbSchema({ tables: [] });
                toast({ title: "Failed to load schema", description: error.message, status: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDbSchema();
    }, [projectId, toast]);

    useEffect(() => {
        const newSql = generateSql(nodes, connections, whereClauses);
        setSqlQuery(newSql);
    }, [nodes, connections, whereClauses]);

    if (isLoading) {
        return <Center height="100vh"><Spinner size="xl" /></Center>;
    }
    
    // 🎨 4. Assemble the components, passing down state and handlers as props.
    return (
        <DndProvider backend={HTML5Backend}>
            <Box height="calc(100vh - 60px)" width="100vw">
                <PanelGroup direction="vertical">
                    <Panel defaultSize={80} minSize={40}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={15} minSize={10}>
                                <SchemaSidebar dbSchema={dbSchema} isLoading={isLoading} />
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
                    <Panel defaultSize={20} minSize={10}>
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
