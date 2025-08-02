import React, { useState, useEffect } from 'react';
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
    onUpdateNodeColumn,
    onDrag 
}) => {
    const [editingColumnName, setEditingColumnName] = useState(null);
    const [isEditingNode, setIsEditingNode] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState('VARCHAR');

    // ✅ 여기가 핵심입니다!
    // collect 함수에 monitor.getDifferenceFromInitialOffset()를 추가하여
    // 드래그하는 동안의 위치 변화량(delta)을 수집합니다.
    const [{ isDragging, delta }, drag] = useDrag(() => ({
        type: 'NODE',
        item: { id: node.id, left: node.position.x, top: node.position.y },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
            delta: monitor.getDifferenceFromInitialOffset(), // 실시간 위치 변화량
        }),
    }));

    // 이제 delta가 정상적으로 정의되었으므로 이 useEffect는 에러 없이 동작합니다.
    useEffect(() => {
        if (onDrag) {
            onDrag(isDragging ? { id: node.id, delta } : null);
        }
    }, [isDragging, delta, node.id, onDrag]);

    // --- 이벤트 핸들러들 ---
    const handleTogglePK = (nodeId, columnName) => onUpdateNodeColumn(nodeId, { name: columnName, togglePK: true });
    const handleDeleteColumn = (nodeId, columnName) => onUpdateNodeColumn(nodeId, { name: columnName, delete: true });
    const handleColumnNameChange = (nodeId, oldName, newName) => {
        if (newName && oldName !== newName) {
            onUpdateNodeColumn(nodeId, { oldName, name: newName });
        }
        setEditingColumnName(null);
    };
    const handleColumnTypeChange = (nodeId, columnName, newType) => onUpdateNodeColumn(nodeId, { name: columnName, type: newType });
    
    const handleAddNewColumn = () => {
        if (newColumnName.trim() === '') return;
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
            bg="gray.50"
            border="1px solid"
            borderColor={isDragging || isEditingNode ? "orange.400" : "gray.200"}
            borderRadius="md"
            boxShadow="md"
            minWidth="220px"
            zIndex={10}
            onContextMenu={(e) => onNodeContextMenu(e, node.id)}
            opacity={isDragging ? 0.7 : 1}
        >
            <Box p={2} bg="brand.100" borderTopRadius="md">
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
            <VStack align="stretch" spacing={0} p={2} bg="white">
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
            </VStack>
            <Divider />
            <Box p={2} bg="white" borderBottomRadius="md">
                 <Popover isOpen={isPopoverOpen} onClose={handleCancelAddColumn} placement="right-start" isLazy>
                    <PopoverTrigger>
                        <Button size="xs" variant="outline" colorScheme="#cab8ae" leftIcon={<AddIcon />} onClick={() => setIsPopoverOpen(true)} w="100%">컬럼 추가</Button>
                    </PopoverTrigger>
                    <Portal>
                        <PopoverContent zIndex={9999} p={2}>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader fontWeight="bold">새 컬럼 추가</PopoverHeader>
                            <PopoverBody>
                                <Input placeholder="컬럼 이름" size="sm" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} mb={2} autoFocus />
                                <Select size="sm" value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)}>
                                    <option value="VARCHAR">VARCHAR</option>
                                    <option value="INT">INT</option>
                                    <option value="DATE">DATE</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="DECIMAL">DECIMAL</option>
                                </Select>
                            </PopoverBody>
                            <PopoverFooter display="flex" justifyContent="flex-end">
                                <Button size="sm" colorScheme="blue" onClick={handleAddNewColumn}>추가</Button>
                            </PopoverFooter>
                        </PopoverContent>
                    </Portal>
                </Popover>
            </Box>
        </Box>
    );
};

export default TableNode;
