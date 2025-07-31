import React from 'react';
import { Box, Text, VStack, Input } from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import ColumnItem from './ColumnItem';

const TableNode = ({
  node,
  onConnect,
  onNodeContextMenu,
  isEditing,
  onStartEditing,
  onStopEditing,
  onAliasChange,
}) => {
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
      border="2px solid"
      borderColor={isEditing ? "orange.400" : "gray.200"}
      borderRadius="md"
      boxShadow="lg"
      p={3}
      cursor="move"
      opacity={isDragging ? 0.5 : 1}
      minWidth="220px"
      zIndex={10}
      onContextMenu={(e) => onNodeContextMenu(e, node.id)}
    >
      {isEditing ? (
        <Input
          size="sm"
          variant="flushed"
          defaultValue={node.alias || node.name}
          onBlur={(e) => onAliasChange(node.id, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAliasChange(node.id, e.target.value); }}
          autoFocus
        />
      ) : (
        <Text
          fontWeight="bold"
          mb={2}
          onDoubleClick={() => onStartEditing(node.id)}
          title="더블클릭하여 별칭(Alias) 수정"
        >
          {node.alias || node.name}
        </Text>
      )}
      <VStack align="stretch" spacing={0}>
        {node.columns?.map((col) => (
          <ColumnItem key={col.name} nodeId={node.id} column={col} onConnect={onConnect} />
        ))}
      </VStack>
    </Box>
  );
};

export default TableNode;