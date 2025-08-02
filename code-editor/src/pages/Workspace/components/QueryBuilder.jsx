// src/pages/Workspace/components/QueryBuilder.jsx

import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Text, Menu, MenuButton, MenuList, MenuItem, Portal, Center } from "@chakra-ui/react";
import TableNode from './TableNode';

// 경로 계산 로직 등은 그대로 유지
const getOrthogonalPath = (from, to, nodes, nodeRefs, containerRef) => { /* ... 이전과 동일 ... */ };

const QueryBuilder = ({
    dbSchema,
    nodes, setNodes,
    connections, setConnections,
    onUpdateNodeColumn,
    onDeleteConnection
}) => {
    const [contextMenu, setContextMenu] = useState(null);
    const containerRef = useRef(null);
    const columnRefs = useRef({});
    const nodeRefs = useRef({});

    // Ref 설정 함수들
    const setColumnRef = (nodeId, columnName, el) => {
        if (!columnRefs.current[nodeId]) columnRefs.current[nodeId] = {};
        columnRefs.current[nodeId][columnName] = el;
    };
    const setNodeRef = (nodeId, el) => {
        nodeRefs.current[nodeId] = el;
    };

    // 연결 핸들러: Workspace의 상태를 직접 업데이트
    const handleConnect = useCallback((from, to) => {
        setConnections(prev => [...prev, { from, to, id: `${from.fromNodeId}-${to.toNodeId}-${Date.now()}` }]);
    }, [setConnections]);

    // Drop 핸들러: 테이블 추가나 노드 이동 처리
    const [, dropRef] = useDrop(() => ({
        accept: ['TABLE', 'NODE'],
        drop: (item, monitor) => {
            const itemType = monitor.getItemType();
            const currentContainer = containerRef.current;
            if (!currentContainer) return;
            const containerRect = currentContainer.getBoundingClientRect();
            const clientOffset = monitor.getSourceClientOffset();
            if (!clientOffset) return;

            const position = {
                x: clientOffset.x - containerRect.left + currentContainer.scrollLeft,
                y: clientOffset.y - containerRect.top + currentContainer.scrollTop,
            };

            if (itemType === 'NODE') {
                const delta = monitor.getDifferenceFromInitialOffset();
                if (!delta) return;
                setNodes(prev => ({ ...prev, [item.id]: { ...prev[item.id], position: { x: item.left + delta.x, y: item.top + delta.y } } }));
            } else if (itemType === 'TABLE') {
                if (nodes[item.id]) return;
                const tableSchema = dbSchema?.tables?.find(t => t.name === item.name);
                setNodes(prev => ({
                    ...prev,
                    [item.id]: {
                        id: item.id,
                        type: 'table',
                        data: {
                            tableName: item.name,
                            columns: tableSchema ? tableSchema.columns.map(c => ({...c, selected: true})) : [],
                        },
                        position,
                    }
                }));
            }
        },
    }), [nodes, setNodes, dbSchema]);

    // Context Menu 관련 핸들러
    const handleNodeContextMenu = (e, nodeId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
    };
    const closeContextMenu = () => setContextMenu(null);

    const handleDeleteNode = () => {
        const nodeIdToDelete = contextMenu?.nodeId;
        if (!nodeIdToDelete) return;
        setNodes(prev => {
            const { [nodeIdToDelete]: _, ...remainingNodes } = prev;
            return remainingNodes;
        });
        setConnections(prev => prev.filter(c => c.from.fromNodeId !== nodeIdToDelete && c.to.toNodeId !== nodeIdToDelete));
        closeContextMenu();
    };

    return (
        <Box p={3} height="100%" display="flex" flexDirection="column" bg="brand.100">
            <Box
                flex="1"
                bg="white"
                borderRadius="md"
                position="relative"
                ref={el => { dropRef(el); containerRef.current = el; }}
                overflow="auto"
                onClick={closeContextMenu}
            >
                {/* SVG로 연결선 그리는 로직 */}
                <svg width="2000px" height="2000px" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
                    {connections.map(conn => {
                        const pathData = getOrthogonalPath(/* ... */); // 상세 로직은 생략
                        if (!pathData) return null;
                        return (
                            <path
                                key={conn.id}
                                d={pathData}
                                stroke="#A0AEC0" strokeWidth="2" fill="none"
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onDoubleClick={() => onDeleteConnection(conn.id)}
                            />
                        );
                    })}
                </svg>

                {/* TableNode 렌더링 */}
                {Object.values(nodes).map(node => (
                    <TableNode
                        key={node.id}
                        node={node}
                        onConnect={handleConnect}
                        onNodeContextMenu={handleNodeContextMenu}
                        setNodeRef={setNodeRef}
                        setColumnRef={setColumnRef}
                        // ✨ onUpdateNodeColumn을 그대로 내려줍니다.
                        onUpdateNodeColumn={onUpdateNodeColumn}
                    />
                ))}

                {/* Context Menu 렌더링 */}
                {contextMenu && (
                    <Menu isOpen onClose={closeContextMenu}>
                        <MenuButton as={Box} position="fixed" top={`${contextMenu.y}px`} left={`${contextMenu.x}px`} />
                        <Portal>
                            <MenuList zIndex={9999}>
                                <MenuItem onClick={handleDeleteNode} color="red.500">빌더에서 제거</MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                )}

                {Object.keys(nodes).length === 0 && (
                    <Center h="100%">
                        <Text color="gray.400">왼쪽 목록에서 테이블을 드래그하여 시작하세요.</Text>
                    </Center>
                )}
            </Box>
        </Box>
    );
};

export default QueryBuilder;