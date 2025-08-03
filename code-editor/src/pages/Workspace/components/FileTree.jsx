import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { FaFile } from "react-icons/fa";
import {executeCode} from '/src/api.js'; // API 호출 함수 import

// Base URL for your API (getSchemas 함수 내부에서 사용될 수 있음)
const API_BASE_URL = "http://20.196.89.99:8080"; // getSchemas가 내부적으로 처리한다면 필요 없음

// 드래그 가능한 테이블 아이템 컴포넌트
const DraggableTable = ({ table }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TABLE',
    item: { id: table.id, name: table.name, columns: table.columns },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Box
      ref={drag}
      p={2}
      mb={2}
      bg="{isDragging ? 'orange.100' : 'white'}"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="sm"
      cursor="grab"
      opacity={isDragging ? 0.7 : 1}
      fontWeight="medium"
      whiteSpace="nowrap"
      _hover={{
        bg: 'gray.50',
        borderColor: 'blue.300',
        boxShadow: 'md',
      }}
    >
      <HStack spacing={2} alignItems="center">
        <FaFile color="gray.500" />
        <Text fontSize="sm">{table.name}</Text>
      </HStack>
    </Box>
  );
};

// FileTree 컴포넌트: projectId prop을 받도록 수정
const FileTree = ({ projectId, tables: propTables }) => { // projectId prop 추가
  const [tables, setTables] = useState(propTables || []);
  const [loading, setLoading] = useState(true); // API 호출 시 초기 로딩 상태는 true

  useEffect(() => {
    // projectId가 유효할 때만 API 호출
    if (projectId) {
      setLoading(true);
      executeCode(projectId) // projectId를 getSchemas 함수에 전달
        .then(data => {
          // API 응답 구조에 따라 data.tables 또는 data.schema.tables 등 조정 필요
          setTables(data.tables || data.schema?.tables || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch schemas:", error);
          setTables([]); // 오류 발생 시 테이블 목록 초기화
          setLoading(false);
          // TODO: 에러 토스트 메시지 등 사용자에게 알림 추가
        });
    } else {
      // projectId가 없으면 로딩 상태를 즉시 false로 설정하고 propTables 사용
      setTables(propTables || []);
      setLoading(false);
    }
  }, [projectId, propTables]); // projectId와 propTables를 의존성 배열에 추가


  if (loading) {
    return (
      <Box p={4} bg="#f9f8f6" borderRadius="md" boxShadow="sm" height="100%" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="md" color="blue.500" />
        <Text ml={2} color="gray.500">스키마 불러오는 중...</Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm" height="100%">
      <Text fontWeight="bold" mb={3} fontSize="lg">DB Connection (테이블 목록)</Text>
      <VStack align="stretch" spacing={2}>
        {tables.length === 0 ? (
          <Text color="gray.500" fontSize="sm">테이블이 없습니다.</Text>
        ) : (
          tables.map(table => (
            <DraggableTable key={table.id} table={table} />
          ))
        )}
      </VStack>
    </Box>
  );
};

export default FileTree;
