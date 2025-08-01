// src/pages/Workspace/components/ResultsPanel.jsx

import React from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Spinner, Text, Center } from '@chakra-ui/react';

const ResultsPanel = ({ results, loading }) => {
  // 로딩 중일 때 Spinner를 보여줍니다.
  if (loading) {
    return (
      <Center height="100%" bg="white">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="orange.500" size="xl" />
      </Center>
    );
  }

  // 결과가 없을 때 안내 문구를 보여줍니다.
  if (!results) {
    return (
      <Center height="100%" bg="white">
        <Text color="gray.500">쿼리를 실행하면 결과가 여기에 표시됩니다.</Text>
      </Center>
    );
  }

  // 결과가 있을 때 테이블을 렌더링합니다.
  return (
    <TableContainer height="100%" overflowY="auto" bg="brand.100" py="2" px="3">
      <Table variant="simple" size="sm">
        <Thead position="sticky" top={0} bg="orange.100">
          <Tr>
            {results.columns.map((col, index) => 
              <Th 
                key={index} 
                bg="brand.100" 
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wider"
                py={3}
                >
                  {col}
                </Th>)}
          </Tr>
        </Thead>
        <Tbody>
          {results.rows.map((row, rowIndex) => (
            <Tr key={rowIndex} bg="white"  _hover={{ bg: 'gray.100' }}>
              {row.map((cell, cellIndex) => <Td key={cellIndex}>{cell}</Td>)}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default ResultsPanel;