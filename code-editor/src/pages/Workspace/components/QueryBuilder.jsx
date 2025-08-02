import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Text, Menu, MenuButton, MenuList, MenuItem, Portal, Center } from "@chakra-ui/react";
import TableNode from './TableNode';

// 연결선 경로를 계산하는 유틸리티 함수
const getOrthogonalPath = (from, to, nodes, nodeRefs, containerRef, draggedNode) => {
    if (!from?.ref?.current || !to?.ref?.current || !nodeRefs.current[from.fromNodeId] || !nodeRefs.current[to.toNodeId]) {
        return null;
    }
    const container = containerRef.current;
    if (!container) return null;

    let fromNodeRect = nodeRefs.current[from.fromNodeId].getBoundingClientRect();
    let toNodeRect = nodeRefs.current[to.toNodeId].getBoundingClientRect();
    let fromColumnRect = from.ref.current.getBoundingClientRect();
    let toColumnRect = to.ref.current.getBoundingClientRect();

    // ✅ 1. 드래그 중인 노드가 있다면, 그 노드의 실시간 마우스 위치(delta)를 반영하여
    // 노드와 컬럼의 가상 위치를 즉석에서 다시 계산합니다.
    if (draggedNode && draggedNode.delta) {
        const { id, delta } = draggedNode;
        if (id === from.fromNodeId) {
            fromNodeRect = new DOMRect(fromNodeRect.x + delta.x, fromNodeRect.y + delta.y, fromNodeRect.width, fromNodeRect.height);
            fromColumnRect = new DOMRect(fromColumnRect.x + delta.x, fromColumnRect.y + delta.y, fromColumnRect.width, fromColumnRect.height);
        }
        if (id === to.toNodeId) {
            toNodeRect = new DOMRect(toNodeRect.x + delta.x, toNodeRect.y + delta.y, toNodeRect.width, toNodeRect.height);
            toColumnRect = new DOMRect(toColumnRect.x + delta.x, toColumnRect.y + delta.y, toColumnRect.width, toColumnRect.height);
        }
    }

    const containerRect = container.getBoundingClientRect();
    const isTargetRight = (toNodeRect.left + toNodeRect.width / 2) > (fromNodeRect.left + fromNodeRect.width / 2);

    const startPoint = {
        x: (isTargetRight ? fromNodeRect.right : fromNodeRect.left) - containerRect.left + container.scrollLeft,
        y: (fromColumnRect.top + fromColumnRect.height / 2) - containerRect.top + container.scrollTop,
    };
    const endPoint = {
        x: (isTargetRight ? toNodeRect.left : toNodeRect.right) - containerRect.left + container.scrollLeft,
        y: (toColumnRect.top + toColumnRect.height / 2) - containerRect.top + container.scrollTop,
    };

    const offset = 40;
    const midPointX = startPoint.x + (isTargetRight ? offset : -offset);
    return `M ${startPoint.x} ${startPoint.y} H ${midPointX} V ${endPoint.y} H ${endPoint.x}`;
};


const QueryBuilder = ({
    dbSchema,
    nodes, setNodes,
    connections, setConnections,
    onUpdateNodeColumn,
    onDeleteConnection
}) => {
    const [contextMenu, setContextMenu] = useState(null);
    // ✅ 2. 드래그 중인 노드의 정보를 저장할 상태를 추가합니다.
    const [draggedNode, setDraggedNode] = useState(null); 
    
    const containerRef = useRef(null);
    const columnRefs = useRef({});
    const nodeRefs = useRef({});

    const setColumnRef = (nodeId, columnName, el) => {
        if (!columnRefs.current[nodeId]) columnRefs.current[nodeId] = {};
        columnRefs.current[nodeId][columnName] = el;
    };
    const setNodeRef = (nodeId, el) => { nodeRefs.current[nodeId] = el; };

    const handleConnect = useCallback((from, to) => {
        setConnections(prev => [...prev, { id: `${from.fromNodeId}-${to.toNodeId}-${Date.now()}`, from, to }]);
    }, [setConnections]);

    const [, dropRef] = useDrop(() => ({
        accept: ['TABLE', 'NODE'],
        drop: (item, monitor) => {
            const itemType = monitor.getItemType();
            const container = containerRef.current;
            if (!container) return;
            
            const clientOffset = monitor.getSourceClientOffset();
            if (!clientOffset) return;

            const position = {
                x: clientOffset.x - container.getBoundingClientRect().left + container.scrollLeft,
                y: clientOffset.y - container.getBoundingClientRect().top + container.scrollTop,
            };

            if (itemType === 'NODE') {
                const delta = monitor.getDifferenceFromInitialOffset();
                if (delta) {
                    setNodes(prev => ({ ...prev, [item.id]: { ...prev[item.id], position: { x: item.left + delta.x, y: item.top + delta.y } } }));
                }
            } else if (itemType === 'TABLE') {
                if (nodes[item.id]) return;
                const newNode = {
                    id: item.id,
                    type: 'table',
                    position,
                    data: {
                        tableName: item.name,
                        columns: item.columns.map(c => ({ ...c, selected: true })),
                        alias: item.name,
                    },
                };
                setNodes(prev => ({ ...prev, [newNode.id]: newNode }));
            }
        },
    }), [nodes, setNodes]);

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

    // ✅ 3. TableNode로부터 드래그 정보를 받아 상태를 업데이트하는 핸들러를 추가합니다.
    const handleNodeDrag = useCallback((dragInfo) => {
        setDraggedNode(dragInfo);
    }, []);

    return (
        <Box py={3} height="100%" display="flex" flexDirection="column" bg="brand.100">
            <Box flex="1" bg="white" borderRadius="md" position="relative" ref={el => { dropRef(el); containerRef.current = el; }} overflow="auto" onClick={closeContextMenu}>
                
                <svg width="2000px" height="2000px" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
                    {connections.map(conn => {
                        // ✅ 4. getOrthogonalPath 함수에 드래그 중인 노드 정보를 전달합니다.
                        const pathData = getOrthogonalPath(
                            { ...conn.from, ref: { current: columnRefs.current[conn.from.fromNodeId]?.[conn.from.fromColumnName] } },
                            { ...conn.to, ref: { current: columnRefs.current[conn.to.toNodeId]?.[conn.to.toColumnName] } },
                            nodes, 
                            nodeRefs, 
                            containerRef,
                            draggedNode // 👈 실시간 위치 정보
                        );
                        if (!pathData) return null;
                        return ( <path key={conn.id} d={pathData} stroke="#A0AEC0" strokeWidth="2" fill="none" style={{ pointerEvents: 'auto', cursor: 'pointer' }} onDoubleClick={() => onDeleteConnection(conn.id)} /> );
                    })}
                </svg>

                {Object.values(nodes).map(node => (
                    <TableNode 
                        key={node.id} 
                        node={node} 
                        onConnect={handleConnect} 
                        onNodeContextMenu={handleNodeContextMenu} 
                        setNodeRef={setNodeRef} 
                        setColumnRef={setColumnRef} 
                        onUpdateNodeColumn={onUpdateNodeColumn}
                        onDrag={handleNodeDrag} // ✅ 5. 핸들러를 TableNode에 전달합니다.
                    />
                ))}

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
