import React from 'react';
import { Box, VStack, Text, Spinner, Center, HStack } from '@chakra-ui/react';
import { useDrag } from 'react-dnd';
import { FaTable } from 'react-icons/fa';

// 각 테이블을 드래그 가능하게 만드는 작은 컴포넌트
const DraggableTable = ({ table }) => {
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

// DB 스키마 전체를 보여주는 사이드바 컴포넌트
const SchemaSidebar = ({ dbSchema, isLoading }) => {
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
            <Text fontWeight="bold" mb={4} fontSize="md" color="gray.700">DB 스키마</Text>
            <VStack align="stretch" spacing={2}>
                {!dbSchema || !dbSchema.tables || dbSchema.tables.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                        연결된 DB가 없거나 테이블이 없습니다.
                    </Text>
                ) : (
                    dbSchema.tables.map((table, index) => (
                        <DraggableTable key={table.tableName || index} table={table} />
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default SchemaSidebar;
