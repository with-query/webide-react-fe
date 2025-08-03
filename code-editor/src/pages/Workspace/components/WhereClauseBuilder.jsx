// src/pages/Workspace/components/WhereClauseBuilder.jsx

import React from 'react';
import { Box, HStack, VStack, Input, Button, IconButton, Text, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';

const WhereClauseBuilder = ({ nodes, clauses, setClauses }) => {
   const allColumns = nodes.flatMap(node => 
        (node.data.columns || []).map(col => `${node.data.alias || node.data.tableName}.${col.name}`)
    );

  const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

  const handleAddWhereClause = (node, column) => {
    const newClause = {
        // 👇 '테이블별칭.컬럼명' 또는 '테이블명.컬럼명' 형태로 저장
        column: `${node.data.alias || node.data.tableName}.${column.name}`, 
        operator: '=',
        value: '',
        connector: 'AND'
    };

    setWhereClauses(prev => [...prev, newClause]);
};
  
  // const handleClauseChange = (index, field, value) => {
  //   const newClauses = [...clauses];
  //   newClauses[index][field] = value;
  //   setClauses(newClauses);
  // };

  const addClause = () => {
    setClauses([...clauses, { id: Date.now(), column: '', operator: '=', value: '', connector: 'AND' }]);
  };

  const removeClause = (index) => {
    setClauses(clauses.filter((_, i) => i !== index));
  };

  return (
    <Box p={4} bg="brand.100" borderRadius="md" height="100%">
      <HStack mb={2}>
        <Text fontWeight="bold">WHERE 절</Text>
        <Button size="xs" leftIcon={<AddIcon />} onClick={addClause}>조건 추가</Button>
      </HStack>
      <VStack align="stretch" spacing={2}>
        {clauses.map((clause, index) => (
          // ✨ 아이템들을 수직 중앙 정렬합니다.
          <HStack key={clause.id} spacing={2} align="center">
            {index > 0 && (
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline" // 테두리 스타일 통일
                  bg="white" // 배경색 통일
                  w="150px" // 너비를 약간 늘림
                  fontWeight="normal"
                  rightIcon={<ChevronDownIcon />}
                  textAlign="center" 
                  pl="8" // 좌우 패딩 추가
                  justifyContent="space-between"
                >
                  {clause.connector}
                </MenuButton>
                <MenuList zIndex={20} minW="90px" fontSize="14px">
                  <MenuItem onClick={() => handleClauseChange(index, 'connector', 'AND')} justifyContent="center">AND</MenuItem>
                  <MenuItem onClick={() => handleClauseChange(index, 'connector', 'OR')} justifyContent="center">OR</MenuItem>
                </MenuList>
              </Menu>
            )}
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                bg="white"
                flex={1} // 유연한 너비
                minW="150px" // 최소 너비
                fontWeight="normal"
                textAlign="center"
                pl="6"
                rightIcon={<ChevronDownIcon />}
                // ✨ 긴 텍스트가 잘리지 않고 ...으로 표시되도록
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {clause.column || "컬럼 선택"}
              </MenuButton>
              <MenuList zIndex={20} maxH="200px" overflowY="auto" fontSize="14px" >
                {allColumns.map(colName => <MenuItem key={colName} onClick={() => handleClauseChange(index, 'column', colName)}>{colName}</MenuItem>)}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                bg="white"
                w="120px"
                fontWeight="normal"
                pl="6"
                rightIcon={<ChevronDownIcon />}
              >
                {clause.operator}
              </MenuButton>
              <MenuList zIndex={20} fontSize="14px" minW="auto">
                {operators.map(op => <MenuItem key={op} onClick={() => handleClauseChange(index, 'operator', op)} justifyContent="center">{op}</MenuItem>)}
              </MenuList>
            </Menu>
            <Input 
              size="sm" 
              placeholder="값 입력" 
              value={clause.value}
              onChange={(e) => handleClauseChange(index, 'value', e.target.value)}
              bg="white"
              variant="outline"
              px="30"
            />
            <IconButton size="sm" icon={<DeleteIcon />} onClick={() => removeClause(index)} />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default WhereClauseBuilder;