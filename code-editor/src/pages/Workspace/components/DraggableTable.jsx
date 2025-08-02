import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, HStack, Text } from '@chakra-ui/react';
import { FaTable } from 'react-icons/fa'; // 테이블 아이콘

const DraggableTable = ({ table }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TABLE', // 드래그 아이템 타입을 'TABLE'로 지정
        // QueryBuilder로 드롭했을 때, 테이블의 이름과 컬럼 정보를 전달합니다.
        item: { name: table.tableName, columns: table.columns },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <Box
            ref={drag}
            p={2}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="sm"
            cursor="grab"
            opacity={isDragging ? 0.5 : 1}
            _hover={{ bg: 'orange.50', borderColor: 'orange.300' }}
        >
            <HStack spacing={2}>
                <FaTable color="gray.600" />
                <Text fontSize="sm" fontWeight="medium">{table.tableName}</Text>
            </HStack>
        </Box>
    );
};

export default DraggableTable;