import React, { useState, useRef, useLayoutEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";

const GRID_SIZE = 1;
const snapToGrid = (n) => Math.round(n / GRID_SIZE) * GRID_SIZE;

const TableNode = ({ node }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: () => ({ id: node.id, left: node.left, top: node.top }),
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
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
        {node.columns?.map((col) => (
          <HStack key={col.name} justify="space-between">
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

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ResizeObserver를 사용해 캔버스 크기 변경을 감지
    const observer = new ResizeObserver(() => {
      console.log('container size:', container.clientWidth, container.clientHeight);
      setBounds({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const [, dropRef] = useDrop(() => ({ 
    accept: ['TABLE', 'NODE'],
    drop: (item, monitor) => {
      const nodeWidth = 200;
      const nodeHeight = 150;
      const itemType = monitor.getItemType();
      let left, top;

      if (itemType === 'NODE') {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (!delta) return;

        left = item.left + delta.x;
        top = item.top + delta.y;
    
        const clampedX = left; // 이동 제한 제거
        const clampedY = top;
        const snappedX = snapToGrid(clampedX);
        const snappedY = snapToGrid(clampedY);

        setNodes(prev => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            left: snappedX,
            top: snappedY,
          },
        }));
      } else if (itemType === 'TABLE') {
        if (nodes[item.id]) return;

        const containerRect = containerRef.current?.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!containerRect || !clientOffset) return;

        left = clientOffset.x - containerRect.left - (nodeWidth / 2);
        top = clientOffset.y - containerRect.top - 20;

        const clampedX = left; // 이동 제한 제거
        const clampedY = top;
        const snappedX = snapToGrid(clampedX);
        const snappedY = snapToGrid(clampedY);

        setNodes(prev => ({
          ...prev,
          [item.id]: {
            ...item,
            left: snappedX,
            top: snappedY,
          },
        }));
        
        if (!nodes[item.id]) {
          setSqlQuery(prev => prev.includes('FROM') ? prev : `SELECT * \nFROM ${item.name}`);
        }
      }
    },
  }), [nodes, bounds]); 

  return (
    <Box
      position="relative"
      height="800px"
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
          <TableNode key={node.id} node={node} />
        ))
      )}
    </Box>
  );
};

export default QueryBuilder;