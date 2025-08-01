import React, { useRef } from 'react';
import { HStack, Text, Box, Badge } from '@chakra-ui/react';
import { useDrag, useDrop } from 'react-dnd';

const ColumnItem = ({ nodeId, column, onConnect }) => {
  const ref = useRef(null); // DOM 요소 참조를 위해 ref 생성

  // 이 컬럼을 드래그해서 연결을 시작하는 로직
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COLUMN',
    item: { fromNodeId: nodeId, fromColumnName: column.name, ref },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  // 다른 컬럼을 여기에 드롭해서 연결을 완료하는 로직
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COLUMN',
    drop: (item) => { // item: 드래그를 시작한 컬럼 정보
      // 자기 자신에게 연결하는 것 방지
      if (item.fromNodeId === nodeId && item.fromColumnName === column.name) {
        return;
      }
      onConnect(item, { toNodeId: nodeId, toColumnName: column.name, ref });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  // 드래그와 드롭 기능을 모두 하나의 요소에 적용
  drag(drop(ref));

  return (
    <HStack
      ref={ref} // ref를 실제 DOM 요소에 연결
      justify="space-between"
      p={1}
      bg={isOver ? 'green.100' : 'transparent'}
      borderRadius="md"
      w="100%"
    >
      <Text fontSize="sm" whiteSpace="nowrap">{column.name}</Text>
      <Badge colorScheme={column.pk ? 'red' : 'gray'}>{column.type}</Badge>
      <Box
        w="10px"
        h="10px"
        bg="gray.400"
        borderRadius="full"
        cursor="pointer"
        _hover={{ bg: 'orange.400' }}
        title="드래그하여 다른 컬럼에 연결하세요"
      />
    </HStack>
  );
};

export default ColumnItem;