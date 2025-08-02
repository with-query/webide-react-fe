import React from 'react';
import { Box, VStack, Text, Spinner, Center } from '@chakra-ui/react';
import DraggableTable from './DraggableTable';

const SchemaSidebar = ({ dbSchema, isLoading }) => {
    if (isLoading) {
        return (
            <Center h="100%">
                <Spinner />
            </Center>
        );
    }

    return (
        <Box p={3} bg="gray.50" h="100%" overflowY="auto">
            <Text fontWeight="bold" mb={4} fontSize="md" color="gray.700">DB 스키마</Text>
            <VStack align="stretch" spacing={2}>
                {!dbSchema || dbSchema.tables.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                        연결된 DB 스키마가 없거나 테이블이 없습니다.
                    </Text>
                ) : (
                    dbSchema.tables.map((table) => (
                        <DraggableTable key={table.tableName} table={table} />
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default SchemaSidebar;