// src/pages/Workspace/components/TableNode.jsx

import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    Input,
    Divider,
    Button,
    Select,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    Portal,
} from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import ColumnItem from './ColumnItem';
import { AddIcon } from '@chakra-ui/icons';

const TableNode = ({ 
    node, 
    onConnect, 
    onNodeContextMenu, 
    setNodeRef, 
    setColumnRef, 
    onUpdateNodeColumn 
}) => {
    // 로컬 UI 상태: 현재 어떤 컬럼/노드를 수정 중인지 관리
    const [editingColumnName, setEditingColumnName] = useState(null);
    const [isEditingNode, setIsEditingNode] = useState(false);

    // ✅ 1. '컬럼 추가' 팝업 제어를 위한 상태들을 추가합니다.
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState('VARCHAR');

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NODE',
        item: { id: node.id, left: node.position.x, top: node.position.y }, // position 객체 사용
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    // --- 이벤트 핸들러들을 정의합니다. ---

    // ColumnItem에서 발생하는 이벤트를 Workspace의 핸들러로 전달하는 역할
    const handleTogglePK = (nodeId, columnName) => onUpdateNodeColumn(nodeId, { name: columnName, togglePK: true });
    const handleDeleteColumn = (nodeId, columnName) => onUpdateNodeColumn(nodeId, { name: columnName, delete: true });
    const handleColumnNameChange = (nodeId, oldName, newName) => {
        onUpdateNodeColumn(nodeId, { oldName, name: newName });
        setEditingColumnName(null); // 수정 완료 후 편집 모드 종료
    };
    const handleColumnTypeChange = (nodeId, columnName, newType) => onUpdateNodeColumn(nodeId, { name: columnName, type: newType });
    
    // ✅ 2. '컬럼 추가' 관련 핸들러 함수들을 추가합니다.
    const handleAddNewColumn = () => {
        if (newColumnName.trim() === '') return;
        // isNew 플래그를 추가하여 Workspace에서 새 컬럼임을 알 수 있도록 합니다.
        onUpdateNodeColumn(node.id, { 
            name: newColumnName.trim(), 
            type: newColumnType, 
            isNew: true 
        });
        setIsPopoverOpen(false);
        setNewColumnName('');
        setNewColumnType('VARCHAR');
    };

    const handleCancelAddColumn = () => {
        setIsPopoverOpen(false);
        setNewColumnName('');
        setNewColumnType('VARCHAR');
    };
    
    // 테이블 별칭(Alias) 수정 핸들러
    const handleAliasChange = (newName) => {
        onUpdateNodeColumn(node.id, { alias: newName });
        setIsEditingNode(false);
    };

    return (
        <Box
            ref={(el) => { drag(el); if(el) setNodeRef(node.id, el); }}
            position="absolute"
            left={node.position.x}
            top={node.position.y}
            bg="brand.100"
            border="1px solid"
            borderColor={isDragging || isEditingNode ? "orange.400" : "gray.200"}
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
                        size="sm" variant="flushed"
                        defaultValue={node.data.alias || node.data.tableName}
                        onBlur={(e) => handleAliasChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        autoFocus
                    />
                ) : (
                    <Text
                        fontWeight="bold"
                        onDoubleClick={() => setIsEditingNode(true)}
                        title="더블클릭하여 별칭(Alias) 수정"
                    >
                        {node.data.alias || node.data.tableName}
                    </Text>
                )}
            </Box>
            <Divider />
            <Box bg="white" p={3}>
                <VStack align="stretch" spacing={0}>
                    {node.data.columns.map(col => (
                        <ColumnItem
                            key={col.name}
                            nodeId={node.id}
                            column={col}
                            onConnect={onConnect}
                            setRef={setColumnRef}
                            isEditingName={editingColumnName === col.name}
                            onStartNameEdit={setEditingColumnName}
                            onNameChange={handleColumnNameChange}
                            onTypeChange={handleColumnTypeChange}
                            onTogglePK={handleTogglePK}
                            onDeleteColumn={handleDeleteColumn}
                        />
                    ))}
                    <Popover isOpen={isPopoverOpen} onClose={handleCancelAddColumn} placement="right-start" isLazy>
                        <PopoverTrigger>
                            <Button size="sm" variant="outline" colorScheme="blue" leftIcon={<AddIcon />} onClick={() => setIsPopoverOpen(true)} mt={2} w="100%">
                                컬럼 추가
                            </Button>
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent zIndex={9999} _focus={{ boxShadow: 'none' }} p={2}>
                                <PopoverArrow />
                                <PopoverCloseButton size="sm" />
                                <PopoverHeader fontWeight="bold" p={2} borderBottom="none">새 컬럼 추가</PopoverHeader>
                                <PopoverBody p={2}>
                                    <Input
                                        placeholder="컬럼 이름"
                                        size="sm"
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        mb={2}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewColumn()}
                                    />
                                    <Select size="sm" value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)}>
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