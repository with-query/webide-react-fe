import React, { useState, useRef, useLayoutEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";

const GRID_SIZE = 10;
const snapToGrid = (n) => Math.round(n / GRID_SIZE) * GRID_SIZE;

const TableNode = ({ node, moveNode }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: { id: node.id, left: node.left, top: node.top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Box
      ref={drag}
      position="absolute"
      left={node.left}
      top={node.top}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="sm"
      p={3}
      cursor="move"
      opacity={isDragging ? 0.5 : 1}
      minWidth="200px"
      zIndex={isDragging ? 10 : 1}
    >
      <Text fontWeight="bold" mb={2}>{node.name}</Text>
      <VStack align="stretch" spacing={1}>
        {node.columns?.map((col, index) => (
          <HStack key={`${node.id}-${col.name}-${index}`} justify="space-between">
            <Text fontSize="sm">{col.name}</Text>
            <Badge colorScheme={col.pk ? 'red' : 'gray'}>{col.type || 'UNKNOWN'}</Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

const QueryBuilder = ({ setSqlQuery }) => {
  const [nodes, setNodes] = useState({});
  const containerRef = useRef();
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  const [droppedTableCount, setDroppedTableCount] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setBounds({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  const moveNode = (id, left, top) => {
    const nodeWidth = 200;
    const nodeHeight = 150;

    const clampedX = Math.max(0, Math.min(left, bounds.width - nodeWidth));
    const clampedY = Math.max(0, Math.min(top, bounds.height - nodeHeight));

    const snappedX = snapToGrid(clampedX);
    const snappedY = snapToGrid(clampedY);

    setNodes(prev => ({ ...prev, [id]: { ...prev[id], left: snappedX, top: snappedY } }));
  };

  const [, dropRef] = useDrop(() => ({ 
    accept: ['TABLE', 'NODE'],
    drop: (item, monitor) => {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      if (monitor.getItemType() === 'NODE') {
        const delta = monitor.getDifferenceFromInitialOffset();
        const left = item.left + delta.x;
        const top = item.top + delta.y;
        moveNode(item.id, left, top);
      } else if (monitor.getItemType() === 'TABLE') {
        if (!nodes[item.id]) {
          const offset = monitor.getClientOffset();

          const left = offset.x - containerRect.left;
          const top = offset.y - containerRect.top;

          const nodeWidth = 200;
          const nodeHeight = 150;

          const clampedX = Math.max(0, Math.min(leftRaw, bounds.width - nodeWidth));
          const clampedY = Math.max(0, Math.min(topRaw, bounds.height - nodeHeight));

          const snappedX = snapToGrid(clampedX);
          const snappedY = snapToGrid(clampedY);

          const id = item.id ?? `table-${Date.now()}`;
          const newNode = { ...item, left, top };

          setNodes(prev => ({
            ...prev,
            [id]: newNode
          }));

          setSqlQuery(prev => prev.includes('FROM') ? prev : `SELECT * \nFROM ${item.name}`);

          setDroppedTableCount(count => count + 1);
        }
      }
    },
  }));

  console.log('렌더링 직전 nodes 배열:', Object.values(nodes));
  console.log('노드 ID 목록:', Object.values(nodes).map(n => n.id));
  return (
    <Box
      position="relative"
      height="100%"
      ref={(el) => {
        dropRef(el);
        containerRef.current = el;
      }}
      overflow="hidden"
    >
      
      {Object.values(nodes).length === 0 ? (
        <Text color="gray.400" p={4}>테이블을 드래그하여 쿼리 빌더를 시작하세요.</Text>
      ) : (
        Object.values(nodes).map(node => (
          <TableNode key={node.id} node={node} moveNode={moveNode} />
        ))
      )}
    </Box>
  );
};
export default QueryBuilder;
