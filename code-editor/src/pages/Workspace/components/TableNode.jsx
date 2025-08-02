// src/pages/Workspace/components/TableNode.jsx

// src/pages/Workspace/components/TableNode.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Input,
  Divider,
  Button,
  Select,
  Flex,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Portal, // <-- 이 부분을 추가해야 합니다!
} from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import ColumnItem from './ColumnItem';
import { AddIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

// ... (나머지 코드 동일)

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
  onAddColumn,
  onUpdateNodeColumn,
}) => {
  const [{ isDragging, delta }, drag] = useDrag(() => ({
    type: 'NODE',
    item: () => ({ id: node.id, left: node.left, top: node.top }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      delta: monitor.getDifferenceFromInitialOffset(),
    }),
  }));

  // 컬럼 추가 모드를 위한 상태 (Popover 제어용)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('VARCHAR'); // 기본 타입 설정

  useEffect(() => {
    onDrag(isDragging ? { id: node.id, delta } : null);
  }, [isDragging, delta, node.id, onDrag]);

  const handleAddNewColumn = () => {
    if (newColumnName.trim() === '') {
      alert('컬럼 이름을 입력해주세요.'); // Chakra UI Toast로 변경 가능
      return;
    }
    onAddColumn(node.id, newColumnName.trim(), newColumnType);
    setIsPopoverOpen(false); // Popover 닫기
    setNewColumnName(''); // 입력 필드 초기화
    setNewColumnType('VARCHAR'); // 타입 초기화
  };

  const handleCancelAddColumn = () => {
    setIsPopoverOpen(false); // Popover 닫기
    setNewColumnName('');
    setNewColumnType('VARCHAR');
  };

  // 컬럼 이름 변경 핸들러 (ColumnItem에서 호출될 예정)
  const handleColumnNameEdit = (columnName, newName) => {
    if (newName.trim() === '') {
      alert('컬럼 이름은 비워둘 수 없습니다.');
      return;
    }
    onUpdateNodeColumn(node.id, { name: newName.trim(), oldName: columnName });
  };

  // 컬럼 타입 변경 핸들러 (ColumnItem에서 호출될 예정)
  const handleColumnTypeEdit = (columnName, newType) => {
    onUpdateNodeColumn(node.id, { name: columnName, type: newType });
  };


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
            onBlur={() => onNodeAliasChange(node.id, node.alias || node.name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onNodeAliasChange(node.id, e.target.value);
                e.target.blur();
              }
            }}
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
              onColumnNameChange={handleColumnNameEdit}
              onColumnTypeChange={handleColumnTypeEdit}
            />
          ))}
          <Popover isOpen={isPopoverOpen} onClose={handleCancelAddColumn} placement="right-start">
            <PopoverTrigger>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<AddIcon />}
                onClick={() => setIsPopoverOpen(true)} // Popover 열기
                mt={2}
                w="100%"
              >
                컬럼 추가
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent zIndex={9999} _focus={{ boxShadow: 'none' }} p={2}> {/* p={2}로 패딩 줄임 */}
                <PopoverArrow />
                <PopoverCloseButton size="sm" /> {/* 버튼 크기 줄임 */}
                <PopoverHeader fontWeight="bold" p={2} borderBottom="none">새 컬럼 추가</PopoverHeader> {/* 패딩 줄임, borderBottom 제거 */}
                <PopoverBody p={2}> {/* 패딩 줄임 */}
                  <Input
                    placeholder="컬럼 이름"
                    size="sm"
                    borderRadius="md"
                    variant="outline" // outline 스타일 명시
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    mb={2} // 간격 유지
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewColumn();
                      }
                    }}
                    borderColor="gray.200"
                    _hover={{ borderColor: "orange.400" }}
                    _focus={{ borderColor: "orange.400", boxShadow:"0 0 0 1px var(--chakra-colors-orange-400)" }}
                  />
                  <Select
                    size="sm"
                    variant="outline" // outline 스타일 명시
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value)}
                    mb={2} // 간격 유지
                    bborderColor="gray.200"
                    _hover={{ borderColor: "orange.400" }}
                    _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)" }}
                    fontWeight="bold"
                    borderRadius="md"
                    ontSize="0.75em"
                    textAlign="center"
                    cursor="pointer"
                    borderColor="gray.200"
                  >
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="INT">INT</option>
                    <option value="DATE">DATE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="DECIMAL">DECIMAL</option>
                  </Select>
                </PopoverBody>
                <PopoverFooter display="flex" justifyContent="flex-end">
                  <Button size="sm" variant="ghost" onClick={handleCancelAddColumn} mr={2}>취소</Button>
                  <Button size="sm" colorScheme="blue" onClick={handleAddNewColumn}>추가</Button>
                </PopoverFooter>
              </PopoverContent>
            </Portal>
          </Popover>
        </VStack>
      </Box>
    </Box>
  );
};

export default TableNode;
