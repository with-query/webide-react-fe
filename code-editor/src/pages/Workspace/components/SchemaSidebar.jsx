import React, { useState } from 'react';
import { 
    Box, VStack, Text, Spinner, Center, HStack,
    Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow,
    PopoverCloseButton, PopoverHeader, PopoverBody, PopoverFooter, Input, Portal,
    IconButton, Menu, MenuButton, MenuList, MenuItem, Icon
} from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import { FaTable , FaGripVertical} from 'react-icons/fa';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

// 각 테이블을 드래그 가능하게 만드는 작은 컴포넌트
const DraggableTable = ({ table, onDeleteTable }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TABLE', // 드래그 아이템 타입을 'TABLE'로 지정
        // 드롭될 때 테이블 이름과 컬럼 정보를 전달
        item: { 
            id: table.tableName, 
            name: table.tableName, 
            columns: table.columns 
        },

        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <Box
            p={2}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="sm"
            opacity={isDragging ? 0.5 : 1}
            _hover={{ bg: 'orange.50', borderColor: 'orange.300' }}
        >
            {/* ✅ 전체 구조를 HStack으로 변경합니다. */}
            <HStack spacing={2} justifyContent="space-between">
                {/* 메뉴 버튼은 테이블 아이콘과 이름만 감쌉니다. */}
                <Menu>
                    <MenuButton as={Box} cursor="pointer">
                        <HStack>
                            <FaTable color="gray.600" />
                            <Text fontSize="sm" fontWeight="medium">{table.tableName}</Text>
                        </HStack>
                    </MenuButton>
                    <Portal>
                        <MenuList zIndex={200}>
                            <MenuItem 
                                icon={<DeleteIcon />} 
                                color="red.500"
                                onClick={() => onDeleteTable(table.tableName)}
                            >
                                삭제
                            </MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>

                {/* ✅ 드래그 핸들 아이콘을 오른쪽에 추가하고, 여기에 drag ref를 연결합니다. */}
                <Box ref={drag} cursor="grab" p={1}>
                    <Icon as={FaGripVertical} color="gray.400" />
                </Box>
            </HStack>
        </Box>
    );
};

// DB 스키마 전체를 보여주는 사이드바 컴포넌트
const SchemaSidebar = ({ dbSchema, isLoading, onCreateTable, onDeleteTable }) => {
    // ✅ Popover 상태와 입력 값을 관리할 state를 추가합니다.
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [newTableName, setNewTableName] = useState('');

    const handleAddClick = () => {
        setIsPopoverOpen(true);
    };

    const handleCancel = () => {
        setIsPopoverOpen(false);
        setNewTableName(''); // 취소 시 입력 값 초기화
    };

    const handleConfirm = () => {
        console.log("1. SchemaSidebar: '추가' 버튼 클릭됨, 전달할 테이블명:", newTableName);
        onCreateTable(newTableName.trim());
        handleCancel(); // Popover 닫고 초기화
    };

    if (isLoading) {
        return (
            <Center h="100%" bg="gray.50">
                <Spinner />
                <Text ml={2} fontSize="sm" color="gray.500">스키마 로딩 중...</Text>
            </Center>
        );
    }

    return (
        <Box p={3} bg="brand.100" h="100%" overflowY="auto">
            <HStack justifyContent="space-between" mb={4}>
                <Text fontWeight="bold" fontSize="md" color="gray.700">DB 스키마</Text>
                {/* ✅ '테이블 추가' Popover UI를 추가합니다. */}
                <Popover
                    isOpen={isPopoverOpen}
                    onClose={handleCancel}
                    placement="right-start"
                    isLazy
                >
                    <PopoverTrigger>
                        <IconButton
                            aria-label="Add table"
                            icon={<AddIcon />}
                            size="xs"
                            // variant="ghost"
                            bg="#d57239"
                            color="white"
                            onClick={handleAddClick}
                        />
                    </PopoverTrigger>
                    <Portal>
                        <PopoverContent zIndex={100} p={2}>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader fontWeight="bold">새 테이블 추가</PopoverHeader>
                            <PopoverBody>
                                <Input
                                    placeholder="테이블 이름"
                                    size="sm"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                    autoFocus
                                />
                            </PopoverBody>
                            <PopoverFooter display="flex" justifyContent="flex-end">
                                <Button size="sm" colorScheme="orange" onClick={handleConfirm}>
                                    추가
                                </Button>
                            </PopoverFooter>
                        </PopoverContent>
                    </Portal>
                </Popover>
            </HStack>
            <VStack align="stretch" spacing={2}>
                {dbSchema?.tables && dbSchema.tables.length > 0 ? (
                    dbSchema.tables.map(table => (
                        <DraggableTable 
                            key={table.tableName} 
                            table={table} 
                            onDeleteTable={onDeleteTable}
                        />
                    ))
                ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                        테이블이 없습니다.
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default SchemaSidebar;
