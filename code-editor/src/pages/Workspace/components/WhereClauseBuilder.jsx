// WhereClauseBuilder.jsx (전체 수정 코드)

import React from 'react';
import { Box, Button, HStack, Select, Input, IconButton, Text, VStack } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const WhereClauseBuilder = ({ nodes, clauses, setClauses }) => {
    // nodes 배열에서 모든 컬럼을 [{ label: '테이블.컬럼', value: '테이블.컬럼' }] 형태로 변환
    const allColumns = nodes.flatMap(node => 
        (node.data.columns || []).map(col => ({
            label: `${node.data.alias || node.data.tableName}.${col.name}`,
            value: `${node.data.alias || node.data.tableName}.${col.name}`
        }))
    );

    // ✅ 불변성을 지키도록 수정한 상태 업데이트 함수
    const handleClauseChange = (index, field, value) => {
        const newClauses = clauses.map((clause, i) => {
            // 현재 수정하려는 인덱스와 같으면, 새로운 객체를 만들어 반환합니다.
            if (i === index) {
                return { ...clause, [field]: value };
            }
            // 다른 객체들은 그대로 둡니다.
            return clause;
        });
        setClauses(newClauses);
    };

    const addClause = () => {
        // 첫 번째 컬럼을 기본값으로 설정해 줄 수 있습니다.
        const defaultColumn = allColumns.length > 0 ? allColumns[0].value : '';
        setClauses([...clauses, { column: defaultColumn, operator: '=', value: '', connector: 'AND' }]);
    };

    const removeClause = (indexToRemove) => {
        setClauses(clauses.filter((_, index) => index !== indexToRemove));
    };

    return (
        <VStack spacing={4} align="stretch" w="100%" bg="brand.100">
            <Text fontWeight="bold" fontSize="md">WHERE 조건</Text>
            {clauses.map((clause, index) => (
                <HStack key={index} spacing={2}>
                    {index > 0 && (
                        <Select 
                            w="100px" 
                            size="sm"
                            bg="white"
                            value={clause.connector} 
                            onChange={(e) => handleClauseChange(index, 'connector', e.target.value)}
                        >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                        </Select>
                    )}
                    <Select
                        placeholder="컬럼 선택"
                        size="sm"
                        bg="white"
                        value={clause.column}
                        onChange={(e) => handleClauseChange(index, 'column', e.target.value)}
                    >
                        {allColumns.map(col => (
                            <option key={col.value} value={col.value}>
                                {col.label}
                            </option>
                        ))}
                    </Select>
                    <Select 
                        w="120px" 
                        size="sm"
                        bg="white"
                        value={clause.operator} 
                        onChange={(e) => handleClauseChange(index, 'operator', e.target.value)}
                    >
                        <option value="=">=</option>
                        <option value="!=">!=</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                        <option value="LIKE">LIKE</option>
                    </Select>
                    <Input 
                        placeholder="값 입력" 
                        size="sm"
                        value={clause.value} 
                        bg="white"
                        onChange={(e) => handleClauseChange(index, 'value', e.target.value)} 
                    />
                    <IconButton
                        aria-label="Delete clause"
                        icon={<DeleteIcon />}
                        size="sm"
                        bg="#d57239"
                        variant="ghost"
                        color="white"
                        onClick={() => removeClause(index)}
                    />
                </HStack>
            ))}
            <Button 
                size="sm" 
                leftIcon={<AddIcon />} 
                onClick={addClause} 
                alignSelf="flex-start"
            >
                조건 추가
            </Button>
        </VStack>
    );
};

export default WhereClauseBuilder;