// src/pages/Workspace/components/TableNode.jsx

import React, { useEffect } from 'react';
import { Box, Text, VStack, Input, Divider } from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import ColumnItem from './ColumnItem';

const TableNode = ({
  node,
  onConnect,
  onNodeContextMenu,
  setNodeRef,
  setColumnRef,
  onDrag,
  isEditingNode,
  onStartNodeEdit,
  onNodeAliasChange,
  editingColumnName,
  onStartColumnNameEdit,
  onColumnNameChange,
  editingColumnType,
  onStartColumnTypeEdit,
  onColumnTypeChange,
}) => {
  const [{ isDragging, delta }, drag] = useDrag(() => ({
    type: 'NODE',
    item: () => ({ id: node.id, left: node.left, top: node.top }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      delta: monitor.getDifferenceFromInitialOffset(),
    }),
  }));

  useEffect(() => {
    onDrag(isDragging ? { id: node.id, delta } : null);
  }, [isDragging, delta, node.id, onDrag]);

  return (
    <Box
      ref={(el) => { drag(el); setNodeRef(node.id, el); }}
      position="absolute"
      left={node.left}
      top={node.top}
      bg="brand.100"
      border="1px solid"
      borderColor={isEditingNode ? "orange.400" : "gray.200"}
      borderRadius="md"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
      minWidth="220px"
      zIndex={10}
      onContextMenu={(e) => onNodeContextMenu(e, node.id)}
      overflow="hidden"
    >
      <Box p={3}>
        {isEditingNode ? (
          <Input
            size="sm"
            variant="flushed"
            defaultValue={node.alias || node.name}
            onBlur={() => onStartNodeEdit(null)}
            onKeyDown={(e) => { if (e.key === 'Enter') onNodeAliasChange(node.id, e.target.value); }}
            autoFocus
          />
        ) : (
          <Text
            fontWeight="bold"
            onDoubleClick={() => onStartNodeEdit(node.id)}
            title="더블클릭하여 별칭(Alias) 수정"
          >
            {node.alias || node.name}
          </Text>
        )}
      </Box>
      <Divider />
      <Box bg="white" p={3}>
        <VStack align="stretch" spacing={0}>
          {node.columns?.map((col) => (
            <ColumnItem
              key={col.name}
              nodeId={node.id}
              column={col}
              onConnect={onConnect}
              setRef={setColumnRef}
              isEditingName={editingColumnName?.nodeId === node.id && editingColumnName?.columnName === col.name}
              onStartNameEdit={() => onStartColumnNameEdit({ nodeId: node.id, columnName: col.name })}
              onNameChange={onColumnNameChange}
              isEditingType={editingColumnType?.nodeId === node.id && editingColumnType?.columnName === col.name}
              onStartTypeEdit={() => onStartColumnTypeEdit({ nodeId: node.id, columnName: col.name })}
              onTypeChange={onColumnTypeChange}
            />
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default TableNode;