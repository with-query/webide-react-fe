// src/pages/Workspace/components/ColumnItem.jsx

import React, { useRef, useEffect } from 'react';
import { HStack, Text, Box, Menu, MenuButton, MenuList, MenuItem, Input, Portal } from '@chakra-ui/react';
import { useDrag, useDrop } from 'react-dnd';

const ColumnItem = ({
  nodeId,
  column,
  onConnect,
  setRef,
  isEditingName,
  onStartNameEdit,
  onNameChange,
  isEditingType,
  onStartTypeEdit,
  onTypeChange,
}) => {
  const ref = useRef(null);
  const dragHandleRef = useRef(null);
  const dataTypes = ["INT", "VARCHAR", "TEXT", "DATE", "DECIMAL"];

  useEffect(() => {
    if (ref.current) {
      setRef(nodeId, column.name, ref.current);
    }
  }, [nodeId, column.name, setRef]);

  const [, drag] = useDrag(() => ({
    type: 'COLUMN',
    item: { fromNodeId: nodeId, fromColumnName: column.name },
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COLUMN',
    drop: (item) => {
      if (item.fromNodeId === nodeId) return;
      onConnect(item, { toNodeId: nodeId, toColumnName: column.name });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  drop(ref);
  drag(dragHandleRef);

  return (
    <HStack
      ref={ref}
      justify="space-between"
      p={1}
      bg={isOver ? 'green.100' : (isEditingName || isEditingType ? 'orange.50' : 'transparent')}
      borderRadius="md"
      w="100%"
    >
      {isEditingName ? (
        <Input
          size="xs"
          variant="flushed"
          defaultValue={column.name}
          onBlur={(e) => onNameChange(nodeId, column.name, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onNameChange(nodeId, column.name, e.target.value); }}
          autoFocus
        />
      ) : (
        <Text
          fontSize="sm"
          whiteSpace="nowrap"
          onDoubleClick={onStartNameEdit}
          cursor="pointer"
          title="더블클릭하여 수정"
        >
          {column.name}
        </Text>
      )}

      <HStack spacing={2} align="center">
        <Menu>
          <MenuButton
            as={Box}
            px={2}
            py={0.5}
            w="80px"
            bg={column.pk ? 'red.100' : 'gray.100'}
            color={column.pk ? 'red.800' : 'gray.800'}
            fontWeight="bold"
            borderRadius="md"
            fontSize="0.75em"
            textAlign="center"
            cursor="pointer"
            _hover={{ bg: column.pk ? 'red.200' : 'gray.200' }}
          >
            {column.type}
          </MenuButton>
          <Portal>
            <MenuList minW="80px" zIndex={9999}>
              {dataTypes.map(type => (
                <MenuItem
                  key={type}
                  onClick={() => onTypeChange(nodeId, column.name, type)}
                  fontWeight="bold"
                  justifyContent="center"
                  fontSize="12px"
                >
                  {type}
                </MenuItem>
              ))}
            </MenuList>
          </Portal>
        </Menu>

        <Box
          ref={dragHandleRef}
          w="10px"
          h="10px"
          bg="gray.300"
          borderRadius="full"
          cursor="grab"
          _hover={{ bg: 'orange.400' }}
          title="드래그하여 연결"
        />
      </HStack>
    </HStack>
  );
};

export default ColumnItem;