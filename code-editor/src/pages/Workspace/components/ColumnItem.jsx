// src/pages/Workspace/components/ColumnItem.jsx

import React, { useRef, useEffect } from 'react';
// ✅ React.memo와 아이콘을 import 합니다.
import { memo } from 'react';
import { HStack, Text, Box, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Input, Portal, Icon } from '@chakra-ui/react';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { useDrag, useDrop } from 'react-dnd';

const ColumnItem = ({
    nodeId,
    column,
    onConnect,
    setRef,
    isEditingName,
    onStartNameEdit,
    onNameChange,
    onTypeChange,
    // ✅ 새로운 기능들을 위한 콜백 함수 props를 추가합니다.
    onDeleteColumn,
    onTogglePK,
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
            bg={isOver ? 'green.100' : (isEditingName ? 'orange.50' : 'transparent')}
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
                    onDoubleClick={() => onStartNameEdit(column.name)} // 인자로 columnName 전달
                    cursor="pointer"
                    title="더블클릭하여 수정"
                    fontWeight={column.pk ? 'bold' : 'normal'} // PK일 경우 볼드 처리
                >
                    {/* PK일 경우 아이콘 표시 */}
                    {column.pk && <Icon as={StarIcon} color="yellow.500" mr={2} />}
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
                        bg={column.pk ? 'yellow.100' : 'gray.100'}
                        color={column.pk ? 'yellow.800' : 'gray.800'}
                        fontWeight="bold"
                        borderRadius="md"
                        fontSize="0.75em"
                        textAlign="center"
                        cursor="pointer"
                        _hover={{ bg: column.pk ? 'yellow.200' : 'gray.200' }}
                    >
                        {column.type}
                    </MenuButton>
                    <Portal>
                        {/* ✅ 메뉴 목록에 새로운 기능들을 추가합니다. */}
                        <MenuList minW="120px" zIndex={9999}>
                            <MenuItem
                                icon={<StarIcon />}
                                onClick={() => onTogglePK(nodeId, column.name)}
                            >
                                {column.pk ? 'PK 해제' : 'PK로 지정'}
                            </MenuItem>
                            <MenuItem
                                icon={<DeleteIcon />}
                                color="red.500"
                                onClick={() => onDeleteColumn(nodeId, column.name)}
                            >
                                컬럼 삭제
                            </MenuItem>
                            <MenuDivider />
                            {dataTypes.map(type => (
                                <MenuItem
                                    key={type}
                                    onClick={() => onTypeChange(nodeId, column.name, type)}
                                    justifyContent="center"
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

// ✅ React.memo로 컴포넌트를 감싸서 불필요한 리렌더링을 방지합니다.
export default memo(ColumnItem);