import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Text, Menu, MenuButton, MenuList, MenuItem, Portal } from "@chakra-ui/react";
import TableNode from './TableNode';
import { generateSql } from '@/components/utils/sqlGenerator'; // 경로는 실제 위치에 맞게 수정

const GRID_SIZE = 1;
const snapToGrid = (n) => Math.round(n / GRID_SIZE) * GRID_SIZE;

// SVG 곡선 경로를 계산하는 함수
const getOrthogonalPath = (from, to, nodes) => {
  // 연결에 필요한 노드와 DOM 참조(ref)가 없으면 경로를 그리지 않음
  if (!from?.ref?.current || !to?.ref?.current) return null;

  const fromNode = nodes[from.fromNodeId];
  const toNode = nodes[to.toNodeId];
  if (!fromNode || !toNode) return null;

  const containerRect = from.ref.current.closest('[data-id="query-builder-container"]').getBoundingClientRect();
  const fromRect = from.ref.current.getBoundingClientRect();
  const toRect = to.ref.current.getBoundingClientRect();

  // 시작점과 끝점의 Y 좌표 계산 (컬럼의 수직 중앙)
  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
  const y2 = toRect.top + toRect.height / 2 - containerRect.top;

  let x1, x2;
  const offset = 30; // 노드에서 선이 꺾이기 시작하는 거리

  // toNode가 fromNode보다 오른쪽에 있을 경우
  if (toNode.left > fromNode.left) {
    x1 = fromRect.right - containerRect.left; 
    x2 = toRect.left - containerRect.left;
    
    // M(시작) -> H(꺾음1) -> V(수직이동) -> H(꺾음2) -> L(도착)
    return `M ${x1} ${y1} H ${midX1} V ${y2} H ${x2}`;
  } 
  // toNode가 fromNode보다 왼쪽에 있을 경우
  else {
    x1 = fromRect.left - containerRect.left;
    x2 = toRect.right - containerRect.left;

    return `M ${x1} ${y1} H ${midX1} V ${y2} H ${x2}`;
  }
};


const QueryBuilder = ({ setSqlQuery }) => {
  const [nodes, setNodes] = useState({});
  const [connections, setConnections] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const containerRef = useRef();
  const columnRefs = useRef({});

  const setColumnRef = (nodeId, columnName, el) => {
    if (!columnRefs.current[nodeId]) {
      columnRefs.current[nodeId] = {};
    }
    columnRefs.current[nodeId][columnName] = el;
  };

  const updateQuery = useCallback(() => {
    const sql = generateSql(nodes, connections);
    setSqlQuery(sql);
  }, [nodes, connections, setSqlQuery]);

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

  const [, dropRef] = useDrop(() => ({
    accept: ['TABLE', 'NODE', 'COLUMN'],
    drop: (item, monitor) => {
      const itemType = monitor.getItemType();

      // 요청하신 노드 이동 로직을 그대로 유지합니다.
      if (itemType === 'NODE') {
        const clientOffset = monitor.getClientOffset();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!clientOffset || !containerRect) return;

        const left = clientOffset.x - containerRect.left - 100;
        const top = clientOffset.y - containerRect.top - 20;

        setNodes(prev => ({
          ...prev,
          [item.id]: { ...prev[item.id], left: snapToGrid(left), top: snapToGrid(top) },
        }));
      }
      // 사이드바에서 새 테이블을 드롭하는 로직
      else if (itemType === 'TABLE') {
        if (nodes[item.id]) return;
        const clientOffset = monitor.getSourceClientOffset();
        const containerRect = containerRef.current.getBoundingClientRect();
        const left = clientOffset.x - containerRect.left;
        const top = clientOffset.y - containerRect.top;
        
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
      const newNodes = { ...prev };
      delete newNodes[nodeIdToDelete];
      return newNodes;
    });
    setConnections(prev => prev.filter(c => c.from.fromNodeId !== nodeIdToDelete && c.to.toNodeId !== nodeIdToDelete));
    closeContextMenu();
  };

  const handleAliasChange = (nodeId, newAlias) => {
    setNodes(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], alias: newAlias || prev[nodeId].name },
    }));
    setEditingNodeId(null);
  };

  return (
    <Box
      ref={el => { dropRef(el); containerRef.current = el; }}
      data-id="query-builder-container"
      position="relative"
      height="100%"
      overflow="auto"
      bg="gray.50"
      onClick={closeContextMenu}
    >
      <svg width="2000px" height="2000px" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {connections.map(conn => {
          const fromRef = columnRefs.current[conn.from.fromNodeId]?.[conn.from.fromColumnName];
          const toRef = columnRefs.current[conn.to.toNodeId]?.[conn.to.toColumnName];

          const pathData = getOrthogonalPath(
            { ...conn.from, ref: { current: fromRef } },
            { ...conn.to, ref: { current: toRef } },
            nodes
          );
          if (!pathData) return null;

          return (
            <path
              key={conn.id}
              d={pathData}
              stroke="#A0AEC0"
              strokeWidth="2"
              fill="none"
            />
          );
        })}
      </svg>

      {Object.values(nodes).map(node => (
        <TableNode
          key={node.id}
          node={node}
          onConnect={handleConnect}
          onNodeContextMenu={handleNodeContextMenu}
          isEditing={editingNodeId === node.id}
          onStartEditing={setEditingNodeId}
          onStopEditing={() => setEditingNodeId(null)}
          onAliasChange={handleAliasChange}
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
  );
};

export default QueryBuilder;