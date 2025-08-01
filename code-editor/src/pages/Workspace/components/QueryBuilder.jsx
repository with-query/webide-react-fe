// src/pages/Workspace/components/QueryBuilder.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Text, Menu, MenuButton, MenuList, MenuItem, Portal } from "@chakra-ui/react";
import TableNode from './TableNode';
import { generateSql } from '@/components/utils/sqlGenerator';

const getOrthogonalPath = (from, to, nodes, nodeRefs, containerRef) => {
  const fromNodeRef = nodeRefs.current[from.fromNodeId];
  const toNodeRef = nodeRefs.current[to.toNodeId];
  if (!from?.ref?.current || !to?.ref?.current || !fromNodeRef || !toNodeRef) return null;

  const container = containerRef.current;
  if (!container) return null;

  const fromNode = nodes[from.fromNodeId];
  const toNode = nodes[to.toNodeId];
  if (!fromNode || !toNode) return null;

  const scrollTop = container.scrollTop;
  const scrollLeft = container.scrollLeft;
  const containerRect = container.getBoundingClientRect();
  const fromNodeRect = fromNodeRef.getBoundingClientRect();
  const toNodeRect = toNodeRef.getBoundingClientRect();
  const fromColumnRect = from.ref.current.getBoundingClientRect();
  const toColumnRect = to.ref.current.getBoundingClientRect();

  const isTargetRight = (toNodeRect.left + toNodeRect.width / 2) > (fromNodeRect.left + fromNodeRect.width / 2);

  const startPoint = {
    x: (isTargetRight ? fromNodeRect.right : fromNodeRect.left) - containerRect.left + scrollLeft,
    y: (fromColumnRect.top + fromColumnRect.height / 2) - containerRect.top + scrollTop,
  };
  const endPoint = {
    x: (isTargetRight ? toNodeRect.left : toNodeRect.right) - containerRect.left + scrollLeft,
    y: (toColumnRect.top + toColumnRect.height / 2) - containerRect.top + scrollTop,
  };

  const threshold = 5;
  const yDifference = Math.abs(startPoint.y - endPoint.y);

  if (yDifference < threshold && isTargetRight) {
    return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
  }
  
  const offset = 40;
  const midPointX = startPoint.x + (isTargetRight ? offset : -offset);
  return `M ${startPoint.x} ${startPoint.y} H ${midPointX} V ${endPoint.y} H ${endPoint.x}`;
};

const QueryBuilder = ({ setSqlQuery }) => {
  const [nodes, setNodes] = useState({});
  const [connections, setConnections] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  
  // ✨ 모든 수정 관련 상태를 여기서 관리합니다.
  const [editingColumnType, setEditingColumnType] = useState(null);
  const [editingColumnName, setEditingColumnName] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);

  const containerRef = useRef();
  const columnRefs = useRef({});
  const nodeRefs = useRef({});

  const [whereClauses, setWhereClauses] = useState([]);

  const setColumnRef = (nodeId, columnName, el) => {
    if (!columnRefs.current[nodeId]) columnRefs.current[nodeId] = {};
    columnRefs.current[nodeId][columnName] = el;
  };
  const setNodeRef = (nodeId, el) => {
    nodeRefs.current[nodeId] = el;
  };

  const updateQuery = useCallback(() => {
    const sql = generateSql(nodes, connections, whereClauses); // 인자 추가
    setSqlQuery(sql);
  }, [nodes, connections, whereClauses, setSqlQuery]);

  useEffect(updateQuery, [nodes, connections, updateQuery]);

  const handleConnect = useCallback((from, to) => {
    const connectionExists = connections.some(c =>
      (c.from.fromNodeId === from.fromNodeId && c.from.fromColumnName === from.fromColumnName && c.to.toNodeId === to.toNodeId && c.to.toColumnName === to.toColumnName) ||
      (c.from.fromNodeId === to.toNodeId && c.from.fromColumnName === to.toColumnName && c.to.toNodeId === from.fromNodeId && c.to.toColumnName === from.fromColumnName)
    );
    if (!connectionExists) {
      setConnections(prev => [...prev, { from, to, id: Math.random().toString() }]);
    }
  }, [connections]);

  const handleNodeDrag = useCallback((dragInfo) => {
    setDraggedNode(dragInfo);
  }, []);

  const [, dropRef] = useDrop(() => ({
    accept: ['TABLE', 'NODE', 'COLUMN'],
    drop: (item, monitor) => {
      const itemType = monitor.getItemType();
      const currentContainer = containerRef.current;
      if (!currentContainer) return;
      const containerRect = currentContainer.getBoundingClientRect();

      if (itemType === 'NODE') {
        const delta = monitor.getDifferenceFromInitialOffset();
        if(!delta) return;
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        setNodes(prev => ({ ...prev, [item.id]: { ...prev[item.id], left, top } }));
      } else if (itemType === 'TABLE') {
        if (nodes[item.id]) return;
        const clientOffset = monitor.getSourceClientOffset();
        if (!clientOffset) return;
        const left = clientOffset.x - containerRect.left + currentContainer.scrollLeft;
        const top = clientOffset.y - containerRect.top + currentContainer.scrollTop;
        setNodes(prev => ({ ...prev, [item.id]: { ...item, left, top } }));
      }
    },
  }), [nodes]);

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

  const handleAliasChange = (nodeId, newAlias) => {
    setNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], alias: newAlias || prev[nodeId].name } }));
    setEditingNodeId(null);
  };

  const handleColumnTypeChange = (nodeId, columnName, newType) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const targetNode = newNodes[nodeId];
      if (targetNode) {
        targetNode.columns = targetNode.columns.map(col => 
          col.name === columnName ? { ...col, type: newType } : col
        );
      }
      return newNodes;
    });
  };
  
  const handleColumnNameChange = (nodeId, oldName, newName) => {
    if (!newName || oldName === newName) {
      setEditingColumnName(null);
      return;
    }
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const targetNode = newNodes[nodeId];
      if (targetNode) {
        targetNode.columns = targetNode.columns.map(col =>
          col.name === oldName ? { ...col, name: newName } : col
        );
      }
      return newNodes;
    });
    setEditingColumnName(null);
  };


  return (
    <Box p={4} height="100%" display="flex" flexDirection="column" bg="brand.100">
      <Box
        flex="1"
        bg="white"
        borderRadius="md"
        position="relative"
        data-id="query-builder-container"
        ref={el => { dropRef(el); containerRef.current = el; }}
        overflow="auto"
        onClick={closeContextMenu}
      >
        <svg
          key={JSON.stringify(Object.values(nodes).map(n => `${n.left},${n.top}`))}
          width="2000px"
          height="2000px"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        >
          {connections.map(conn => {
            let tempNodes = { ...nodes };
            if (draggedNode && draggedNode.delta) {
              const { id, delta } = draggedNode;
              if (tempNodes[id]) {
                tempNodes[id] = { ...tempNodes[id], left: tempNodes[id].left + delta.x, top: tempNodes[id].top + delta.y };
              }
            }
            const pathData = getOrthogonalPath(
              { ...conn.from, ref: { current: columnRefs.current[conn.from.fromNodeId]?.[conn.from.fromColumnName] } },
              { ...conn.to, ref: { current: columnRefs.current[conn.to.toNodeId]?.[conn.to.toColumnName] } },
              tempNodes,
              nodeRefs,
              containerRef
            );
            if (!pathData) return null;
            return <path key={conn.id} d={pathData} stroke="#A0AEC0" strokeWidth="2" fill="none" />;
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
            onDrag={handleNodeDrag}
            isEditingNode={editingNodeId === node.id}
            onStartNodeEdit={setEditingNodeId}
            onNodeAliasChange={handleAliasChange}
            editingColumnName={editingColumnName}
            onStartColumnNameEdit={setEditingColumnName}
            onColumnNameChange={handleColumnNameChange}
            editingColumnType={editingColumnType}
            onStartColumnTypeEdit={setEditingColumnType}
            onColumnTypeChange={handleColumnTypeChange}
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
          <Text color="gray.400" p={4} textAlign="center">
            왼쪽 목록에서 테이블을 드래그하여 쿼리 빌더를 시작하세요.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default QueryBuilder;